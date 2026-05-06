-- QR Code Attendance System Migration
-- Migration: 20241203_009_qr_attendance.sql

-- =====================================================
-- QR CODE ATTENDANCE SYSTEM
-- =====================================================

-- Create ENUM types
CREATE TYPE qr_scan_status AS ENUM ('valid', 'expired', 'already_used', 'invalid');

-- =====================================================
-- 1. QR ATTENDANCE SESSIONS TABLE
-- =====================================================

CREATE TABLE public.qr_attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Session Info
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id),
    teacher_id UUID REFERENCES public.users(id) NOT NULL,
    
    -- QR Code
    qr_code TEXT UNIQUE NOT NULL, -- Unique QR code string
    qr_secret TEXT NOT NULL, -- Secret for verification
    
    -- Validity
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    
    -- Restrictions
    max_scans INTEGER, -- Optional: limit number of scans
    current_scans INTEGER DEFAULT 0,
    
    -- Location (optional geofencing)
    location_lat NUMERIC(10,8),
    location_lng NUMERIC(11,8),
    location_radius_meters INTEGER, -- Radius for valid location
    
    -- Session Details
    title TEXT NOT NULL,
    description TEXT,
    session_date DATE NOT NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. QR ATTENDANCE RECORDS TABLE
-- =====================================================

CREATE TABLE public.qr_attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relations
    session_id UUID REFERENCES public.qr_attendance_sessions(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Scan Info
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    scan_status qr_scan_status NOT NULL,
    
    -- Location Data
    scan_location_lat NUMERIC(10,8),
    scan_location_lng NUMERIC(11,8),
    is_location_valid BOOLEAN,
    
    -- Device Info
    device_info TEXT,
    ip_address INET,
    user_agent TEXT,
    
    -- Verification
    is_verified BOOLEAN DEFAULT true,
    verified_by UUID REFERENCES public.users(id),
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One scan per student per session
    UNIQUE(session_id, student_id)
);

-- =====================================================
-- 3. QR ATTENDANCE STATISTICS (Materialized View)
-- =====================================================

CREATE MATERIALIZED VIEW public.qr_attendance_stats AS
SELECT 
    s.id as session_id,
    s.class_id,
    s.session_date,
    COUNT(DISTINCT r.student_id) as total_present,
    COUNT(DISTINCT e.student_id) as total_enrolled,
    CASE 
        WHEN COUNT(DISTINCT e.student_id) > 0 
        THEN (COUNT(DISTINCT r.student_id)::NUMERIC / COUNT(DISTINCT e.student_id) * 100)
        ELSE 0 
    END as attendance_rate
FROM public.qr_attendance_sessions s
LEFT JOIN public.qr_attendance_records r ON s.id = r.session_id AND r.scan_status = 'valid'
LEFT JOIN public.enrollments e ON s.class_id = e.class_id AND e.status = 'active'
GROUP BY s.id, s.class_id, s.session_date;

CREATE UNIQUE INDEX idx_qr_attendance_stats_session ON public.qr_attendance_stats(session_id);

-- =====================================================
-- INDEXES for Performance
-- =====================================================

-- Sessions
CREATE INDEX idx_qr_sessions_class ON public.qr_attendance_sessions(class_id);
CREATE INDEX idx_qr_sessions_teacher ON public.qr_attendance_sessions(teacher_id);
CREATE INDEX idx_qr_sessions_date ON public.qr_attendance_sessions(session_date DESC);
CREATE INDEX idx_qr_sessions_active ON public.qr_attendance_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_qr_sessions_qr_code ON public.qr_attendance_sessions(qr_code);
CREATE INDEX idx_qr_sessions_valid ON public.qr_attendance_sessions(valid_from, valid_until);

-- Records
CREATE INDEX idx_qr_records_session ON public.qr_attendance_records(session_id);
CREATE INDEX idx_qr_records_student ON public.qr_attendance_records(student_id);
CREATE INDEX idx_qr_records_scanned_at ON public.qr_attendance_records(scanned_at DESC);
CREATE INDEX idx_qr_records_status ON public.qr_attendance_records(scan_status);

-- =====================================================
-- TRIGGERS for updated_at
-- =====================================================

CREATE TRIGGER update_qr_sessions_updated_at 
    BEFORE UPDATE ON public.qr_attendance_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER: Update scan count
-- =====================================================

CREATE OR REPLACE FUNCTION update_qr_scan_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.scan_status = 'valid' THEN
        UPDATE public.qr_attendance_sessions
        SET current_scans = current_scans + 1
        WHERE id = NEW.session_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_qr_scan_count
    AFTER INSERT ON public.qr_attendance_records
    FOR EACH ROW EXECUTE FUNCTION update_qr_scan_count();

-- =====================================================
-- FUNCTION: Generate QR Code
-- =====================================================

CREATE OR REPLACE FUNCTION generate_qr_code()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'base64');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Verify QR Code
-- =====================================================

CREATE OR REPLACE FUNCTION verify_qr_code(
    p_qr_code TEXT,
    p_student_id UUID,
    p_location_lat NUMERIC DEFAULT NULL,
    p_location_lng NUMERIC DEFAULT NULL
)
RETURNS TABLE (
    is_valid BOOLEAN,
    status qr_scan_status,
    message TEXT,
    session_id UUID
) AS $$
DECLARE
    session_record RECORD;
    distance_meters NUMERIC;
    already_scanned BOOLEAN;
BEGIN
    -- Find session
    SELECT * INTO session_record
    FROM public.qr_attendance_sessions
    WHERE qr_code = p_qr_code;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'invalid'::qr_scan_status, 'QR code not found', NULL::UUID;
        RETURN;
    END IF;
    
    -- Check if active
    IF NOT session_record.is_active THEN
        RETURN QUERY SELECT false, 'expired'::qr_scan_status, 'Session is inactive', session_record.id;
        RETURN;
    END IF;
    
    -- Check time validity
    IF NOW() < session_record.valid_from OR NOW() > session_record.valid_until THEN
        RETURN QUERY SELECT false, 'expired'::qr_scan_status, 'QR code has expired', session_record.id;
        RETURN;
    END IF;
    
    -- Check if already scanned
    SELECT EXISTS(
        SELECT 1 FROM public.qr_attendance_records
        WHERE session_id = session_record.id AND student_id = p_student_id
    ) INTO already_scanned;
    
    IF already_scanned THEN
        RETURN QUERY SELECT false, 'already_used'::qr_scan_status, 'Already marked attendance', session_record.id;
        RETURN;
    END IF;
    
    -- Check max scans limit
    IF session_record.max_scans IS NOT NULL AND session_record.current_scans >= session_record.max_scans THEN
        RETURN QUERY SELECT false, 'expired'::qr_scan_status, 'Maximum scans reached', session_record.id;
        RETURN;
    END IF;
    
    -- Check location if required
    IF session_record.location_lat IS NOT NULL AND session_record.location_lng IS NOT NULL THEN
        IF p_location_lat IS NULL OR p_location_lng IS NULL THEN
            RETURN QUERY SELECT false, 'invalid'::qr_scan_status, 'Location required', session_record.id;
            RETURN;
        END IF;
        
        -- Calculate distance (simplified Haversine formula in meters)
        distance_meters := 6371000 * acos(
            cos(radians(session_record.location_lat)) * 
            cos(radians(p_location_lat)) * 
            cos(radians(p_location_lng) - radians(session_record.location_lng)) + 
            sin(radians(session_record.location_lat)) * 
            sin(radians(p_location_lat))
        );
        
        IF distance_meters > session_record.location_radius_meters THEN
            RETURN QUERY SELECT false, 'invalid'::qr_scan_status, 'Outside valid location', session_record.id;
            RETURN;
        END IF;
    END IF;
    
    -- All checks passed
    RETURN QUERY SELECT true, 'valid'::qr_scan_status, 'Attendance marked successfully', session_record.id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Get attendance report
-- =====================================================

CREATE OR REPLACE FUNCTION get_attendance_report(
    p_class_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    student_id UUID,
    student_name TEXT,
    total_sessions INTEGER,
    attended_sessions INTEGER,
    attendance_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.student_id,
        u.full_name as student_name,
        COUNT(DISTINCT s.id)::INTEGER as total_sessions,
        COUNT(DISTINCT r.session_id)::INTEGER as attended_sessions,
        CASE 
            WHEN COUNT(DISTINCT s.id) > 0 
            THEN (COUNT(DISTINCT r.session_id)::NUMERIC / COUNT(DISTINCT s.id) * 100)
            ELSE 0 
        END as attendance_rate
    FROM public.enrollments e
    JOIN public.users u ON e.student_id = u.id
    CROSS JOIN public.qr_attendance_sessions s
    LEFT JOIN public.qr_attendance_records r ON r.session_id = s.id 
        AND r.student_id = e.student_id 
        AND r.scan_status = 'valid'
    WHERE e.class_id = p_class_id
        AND e.status = 'active'
        AND s.class_id = p_class_id
        AND s.session_date BETWEEN p_start_date AND p_end_date
    GROUP BY e.student_id, u.full_name
    ORDER BY u.full_name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Refresh attendance stats
-- =====================================================

CREATE OR REPLACE FUNCTION refresh_qr_attendance_stats()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.qr_attendance_stats;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- POLICIES (Row Level Security)
-- =====================================================

ALTER TABLE public.qr_attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_attendance_records ENABLE ROW LEVEL SECURITY;

-- Teachers can manage sessions for their classes
CREATE POLICY teachers_manage_qr_sessions ON public.qr_attendance_sessions
    FOR ALL
    USING (teacher_id = auth.uid());

-- Students can view active sessions for their classes
CREATE POLICY students_view_qr_sessions ON public.qr_attendance_sessions
    FOR SELECT
    USING (
        is_active = true
        AND class_id IN (
            SELECT class_id FROM public.enrollments 
            WHERE student_id = auth.uid()
        )
    );

-- Students can view their own attendance records
CREATE POLICY students_view_own_records ON public.qr_attendance_records
    FOR SELECT
    USING (student_id = auth.uid());

-- Teachers can view all records for their sessions
CREATE POLICY teachers_view_records ON public.qr_attendance_records
    FOR SELECT
    USING (
        session_id IN (
            SELECT id FROM public.qr_attendance_sessions 
            WHERE teacher_id = auth.uid()
        )
    );

-- =====================================================
-- COMMENTS for Documentation
-- =====================================================

COMMENT ON TABLE public.qr_attendance_sessions IS 'QR code sessions for attendance tracking';
COMMENT ON TABLE public.qr_attendance_records IS 'Student attendance records via QR scanning';
COMMENT ON MATERIALIZED VIEW public.qr_attendance_stats IS 'Attendance statistics by session';

COMMENT ON FUNCTION generate_qr_code IS 'Generate unique QR code string';
COMMENT ON FUNCTION verify_qr_code IS 'Verify QR code and check all conditions';
COMMENT ON FUNCTION get_attendance_report IS 'Get attendance report for class and date range';
COMMENT ON FUNCTION refresh_qr_attendance_stats IS 'Refresh materialized view for statistics';

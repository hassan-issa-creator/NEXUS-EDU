-- Parent Portal Enhancement Migration
-- Migration: 20241203_010_parent_portal.sql

-- =====================================================
-- PARENT PORTAL ENHANCEMENTS
-- =====================================================

-- Note: parent_students table already exists in initial schema
-- We'll add additional features and views

-- =====================================================
-- 1. PARENT NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE public.parent_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relations
    parent_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Notification Info
    notification_type TEXT NOT NULL, -- 'grade', 'attendance', 'behavior', 'assignment', 'message'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- Reference
    reference_id UUID, -- ID of related assignment, grade, etc.
    reference_type TEXT, -- Type of reference
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. PARENT TEACHER MESSAGES TABLE
-- =====================================================

CREATE TABLE public.parent_teacher_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relations
    parent_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    teacher_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Message
    subject TEXT NOT NULL,
    message_text TEXT NOT NULL,
    reply_to_id UUID REFERENCES public.parent_teacher_messages(id),
    
    -- Attachments
    attachment_urls TEXT[],
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    
    -- Metadata
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. STUDENT BEHAVIOR RECORDS TABLE
-- =====================================================

CREATE TABLE public.student_behavior_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relations
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    class_id UUID REFERENCES public.classes(id),
    recorded_by UUID REFERENCES public.users(id) NOT NULL,
    
    -- Behavior Info
    behavior_type TEXT NOT NULL, -- 'positive', 'negative', 'neutral'
    category TEXT, -- 'participation', 'discipline', 'homework', 'attendance'
    title TEXT NOT NULL,
    description TEXT,
    
    -- Points (for gamification)
    points INTEGER DEFAULT 0,
    
    -- Date
    incident_date DATE NOT NULL,
    
    -- Parent Notification
    parent_notified BOOLEAN DEFAULT false,
    parent_notified_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MATERIALIZED VIEW: Parent Dashboard Summary
-- =====================================================

CREATE MATERIALIZED VIEW public.parent_dashboard_summary AS
SELECT 
    ps.parent_id,
    ps.student_id,
    u.full_name as student_name,
    
    -- Grades Summary
    ROUND(AVG(g.percentage), 2) as avg_grade,
    COUNT(DISTINCT g.id) as total_grades,
    
    -- Attendance Summary
    COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) as days_present,
    COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN a.id END) as days_absent,
    COUNT(DISTINCT CASE WHEN a.status = 'late' THEN a.id END) as days_late,
    ROUND(
        COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END)::NUMERIC / 
        NULLIF(COUNT(DISTINCT a.id), 0) * 100, 
        2
    ) as attendance_rate,
    
    -- Assignments Summary
    COUNT(DISTINCT s.id) as total_assignments,
    COUNT(DISTINCT CASE WHEN s.status = 'submitted' THEN s.id END) as submitted_assignments,
    COUNT(DISTINCT CASE WHEN s.status = 'graded' THEN s.id END) as graded_assignments,
    
    -- Behavior Summary
    SUM(CASE WHEN b.behavior_type = 'positive' THEN 1 ELSE 0 END) as positive_behaviors,
    SUM(CASE WHEN b.behavior_type = 'negative' THEN 1 ELSE 0 END) as negative_behaviors,
    SUM(COALESCE(b.points, 0)) as total_behavior_points,
    
    -- Unread Items
    COUNT(DISTINCT CASE WHEN n.is_read = false THEN n.id END) as unread_notifications,
    
    NOW() as last_updated
FROM public.parent_students ps
JOIN public.users u ON ps.student_id = u.id
LEFT JOIN public.grades g ON ps.student_id = g.student_id
LEFT JOIN public.attendance a ON ps.student_id = a.student_id
LEFT JOIN public.submissions s ON ps.student_id = s.student_id
LEFT JOIN public.student_behavior_records b ON ps.student_id = b.student_id
LEFT JOIN public.parent_notifications n ON ps.parent_id = n.parent_id AND ps.student_id = n.student_id
WHERE ps.is_primary = true
GROUP BY ps.parent_id, ps.student_id, u.full_name;

CREATE UNIQUE INDEX idx_parent_dashboard_parent_student ON public.parent_dashboard_summary(parent_id, student_id);

-- =====================================================
-- INDEXES for Performance
-- =====================================================

-- Parent Notifications
CREATE INDEX idx_parent_notifications_parent ON public.parent_notifications(parent_id);
CREATE INDEX idx_parent_notifications_student ON public.parent_notifications(student_id);
CREATE INDEX idx_parent_notifications_unread ON public.parent_notifications(parent_id, is_read) WHERE is_read = false;
CREATE INDEX idx_parent_notifications_created ON public.parent_notifications(created_at DESC);

-- Parent Teacher Messages
CREATE INDEX idx_pt_messages_parent ON public.parent_teacher_messages(parent_id);
CREATE INDEX idx_pt_messages_teacher ON public.parent_teacher_messages(teacher_id);
CREATE INDEX idx_pt_messages_student ON public.parent_teacher_messages(student_id);
CREATE INDEX idx_pt_messages_reply ON public.parent_teacher_messages(reply_to_id);
CREATE INDEX idx_pt_messages_unread ON public.parent_teacher_messages(parent_id, is_read) WHERE is_read = false;

-- Behavior Records
CREATE INDEX idx_behavior_student ON public.student_behavior_records(student_id);
CREATE INDEX idx_behavior_class ON public.student_behavior_records(class_id);
CREATE INDEX idx_behavior_type ON public.student_behavior_records(behavior_type);
CREATE INDEX idx_behavior_date ON public.student_behavior_records(incident_date DESC);

-- =====================================================
-- TRIGGERS for updated_at
-- =====================================================

CREATE TRIGGER update_behavior_records_updated_at 
    BEFORE UPDATE ON public.student_behavior_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTION: Get Parent Dashboard Data
-- =====================================================

CREATE OR REPLACE FUNCTION get_parent_dashboard(p_parent_id UUID, p_student_id UUID DEFAULT NULL)
RETURNS TABLE (
    student_id UUID,
    student_name TEXT,
    avg_grade NUMERIC,
    attendance_rate NUMERIC,
    pending_assignments INTEGER,
    unread_notifications INTEGER,
    recent_activity JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pds.student_id,
        pds.student_name,
        pds.avg_grade,
        pds.attendance_rate,
        (pds.total_assignments - pds.graded_assignments)::INTEGER as pending_assignments,
        pds.unread_notifications::INTEGER,
        jsonb_build_object(
            'positivePoints', pds.positive_behaviors,
            'negativePoints', pds.negative_behaviors,
            'totalPoints', pds.total_behavior_points
        ) as recent_activity
    FROM public.parent_dashboard_summary pds
    WHERE pds.parent_id = p_parent_id
        AND (p_student_id IS NULL OR pds.student_id = p_student_id);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Notify Parent
-- =====================================================

CREATE OR REPLACE FUNCTION notify_parent(
    p_student_id UUID,
    p_notification_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_reference_id UUID DEFAULT NULL,
    p_reference_type TEXT DEFAULT NULL,
    p_priority TEXT DEFAULT 'normal'
)
RETURNS VOID AS $$
DECLARE
    parent_record RECORD;
BEGIN
    -- Get all parents for this student
    FOR parent_record IN 
        SELECT parent_id FROM public.parent_students 
        WHERE student_id = p_student_id
    LOOP
        -- Insert notification
        INSERT INTO public.parent_notifications (
            parent_id, student_id, notification_type, title, message,
            reference_id, reference_type, priority
        ) VALUES (
            parent_record.parent_id, p_student_id, p_notification_type, p_title, p_message,
            p_reference_id, p_reference_type, p_priority
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Refresh Parent Dashboard
-- =====================================================

CREATE OR REPLACE FUNCTION refresh_parent_dashboard()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.parent_dashboard_summary;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- POLICIES (Row Level Security)
-- =====================================================

ALTER TABLE public.parent_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_teacher_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_behavior_records ENABLE ROW LEVEL SECURITY;

-- Parents can view their own notifications
CREATE POLICY parents_view_own_notifications ON public.parent_notifications
    FOR SELECT
    USING (parent_id = auth.uid());

-- Parents can manage their own notifications
CREATE POLICY parents_manage_notifications ON public.parent_notifications
    FOR UPDATE
    USING (parent_id = auth.uid());

-- Parents and teachers can view their messages
CREATE POLICY view_parent_teacher_messages ON public.parent_teacher_messages
    FOR SELECT
    USING (parent_id = auth.uid() OR teacher_id = auth.uid());

-- Parents and teachers can send messages
CREATE POLICY send_parent_teacher_messages ON public.parent_teacher_messages
    FOR INSERT
    WITH CHECK (parent_id = auth.uid() OR teacher_id = auth.uid());

-- Parents can view behavior records for their children
CREATE POLICY parents_view_student_behavior ON public.student_behavior_records
    FOR SELECT
    USING (
        student_id IN (
            SELECT student_id FROM public.parent_students 
            WHERE parent_id = auth.uid()
        )
    );

-- Teachers can manage behavior records
CREATE POLICY teachers_manage_behavior ON public.student_behavior_records
    FOR ALL
    USING (recorded_by = auth.uid());

-- =====================================================
-- COMMENTS for Documentation
-- =====================================================

COMMENT ON TABLE public.parent_notifications IS 'Notifications for parents about their children';
COMMENT ON TABLE public.parent_teacher_messages IS 'Messages between parents and teachers';
COMMENT ON TABLE public.student_behavior_records IS 'Student behavior tracking and incidents';
COMMENT ON MATERIALIZED VIEW public.parent_dashboard_summary IS 'Aggregated dashboard data for parents';

COMMENT ON FUNCTION get_parent_dashboard IS 'Get comprehensive dashboard data for parent';
COMMENT ON FUNCTION notify_parent IS 'Send notification to all parents of a student';
COMMENT ON FUNCTION refresh_parent_dashboard IS 'Refresh parent dashboard materialized view';

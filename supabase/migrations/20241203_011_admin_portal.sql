-- Admin Portal & Permissions System Migration
-- Migration: 20241203_011_admin_portal.sql

-- =====================================================
-- ADMIN PORTAL & PERMISSIONS SYSTEM
-- =====================================================

-- Create ENUM types
CREATE TYPE permission_scope AS ENUM (
    'users', 'classes', 'subjects', 'assignments', 'grades', 
    'exams', 'content', 'chat', 'games', 'attendance', 
    'reports', 'settings', 'system'
);
CREATE TYPE permission_action AS ENUM ('create', 'read', 'update', 'delete', 'manage', 'export');
CREATE TYPE activity_type AS ENUM ('login', 'create', 'update', 'delete', 'export', 'import', 'settings');

-- =====================================================
-- 1. ADMIN ROLES TABLE
-- =====================================================

CREATE TABLE public.admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Role Info
    name TEXT UNIQUE NOT NULL,
    name_ar TEXT,
    description TEXT,
    
    -- Permissions (JSONB for flexibility)
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Hierarchy
    is_super_admin BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 0, -- Higher = more powerful
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. USER ADMIN ASSIGNMENTS TABLE
-- =====================================================

CREATE TABLE public.user_admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relations
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    role_id UUID REFERENCES public.admin_roles(id) ON DELETE CASCADE NOT NULL,
    
    -- Assignment Details
    assigned_by UUID REFERENCES public.users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Scope (optional: limit to specific school/class)
    school_id UUID REFERENCES public.schools(id),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique assignment per user per role
    UNIQUE(user_id, role_id)
);

-- =====================================================
-- 3. ADMIN ACTIVITY LOG TABLE
-- =====================================================

CREATE TABLE public.admin_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User Info
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    user_email TEXT,
    user_name TEXT,
    
    -- Activity Details
    activity_type activity_type NOT NULL,
    resource_type TEXT NOT NULL, -- 'user', 'class', 'exam', etc.
    resource_id UUID,
    action TEXT NOT NULL,
    description TEXT,
    
    -- Changes (JSONB for before/after)
    changes JSONB,
    
    -- Request Info
    ip_address INET,
    user_agent TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. SYSTEM SETTINGS TABLE
-- =====================================================

CREATE TABLE public.system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Setting Info
    category TEXT NOT NULL, -- 'general', 'security', 'features', 'limits'
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    
    -- Metadata
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- Can non-admins see this?
    
    -- Modification
    modified_by UUID REFERENCES public.users(id),
    modified_at TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique key per category
    UNIQUE(category, key)
);

-- =====================================================
-- 5. SYSTEM STATISTICS (Materialized View)
-- =====================================================

CREATE MATERIALIZED VIEW public.system_statistics AS
SELECT 
    -- User Stats
    COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'student') as total_students,
    COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'teacher') as total_teachers,
    COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'parent') as total_parents,
    COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'admin') as total_admins,
    
    -- Academic Stats
    COUNT(DISTINCT c.id) as total_classes,
    COUNT(DISTINCT s.id) as total_subjects,
    COUNT(DISTINCT a.id) as total_assignments,
    COUNT(DISTINCT e.id) as total_exams,
    
    -- Content Stats
    COUNT(DISTINCT ci.id) as total_content_items,
    COUNT(DISTINCT g.id) as total_games,
    
    -- Activity Stats (Last 30 days)
    COUNT(DISTINCT sub.id) FILTER (WHERE sub.created_at >= NOW() - INTERVAL '30 days') as recent_submissions,
    COUNT(DISTINCT att.id) FILTER (WHERE att.date >= CURRENT_DATE - INTERVAL '30 days') as recent_attendance,
    
    -- Storage Stats
    COALESCE(SUM(ci.file_size), 0) as total_storage_bytes,
    
    NOW() as last_updated
FROM public.users u
CROSS JOIN public.classes c
CROSS JOIN public.subjects s
CROSS JOIN public.assignments a
CROSS JOIN public.exams e
CROSS JOIN public.content_items ci
CROSS JOIN public.games g
LEFT JOIN public.submissions sub ON true
LEFT JOIN public.attendance att ON true;

-- =====================================================
-- INDEXES for Performance
-- =====================================================

-- Admin Roles
CREATE INDEX idx_admin_roles_active ON public.admin_roles(is_active);
CREATE INDEX idx_admin_roles_super ON public.admin_roles(is_super_admin) WHERE is_super_admin = true;

-- User Admin Roles
CREATE INDEX idx_user_admin_roles_user ON public.user_admin_roles(user_id);
CREATE INDEX idx_user_admin_roles_role ON public.user_admin_roles(role_id);
CREATE INDEX idx_user_admin_roles_active ON public.user_admin_roles(is_active) WHERE is_active = true;

-- Activity Log
CREATE INDEX idx_admin_activity_user ON public.admin_activity_log(user_id);
CREATE INDEX idx_admin_activity_type ON public.admin_activity_log(activity_type);
CREATE INDEX idx_admin_activity_resource ON public.admin_activity_log(resource_type, resource_id);
CREATE INDEX idx_admin_activity_created ON public.admin_activity_log(created_at DESC);

-- System Settings
CREATE INDEX idx_system_settings_category ON public.system_settings(category);
CREATE INDEX idx_system_settings_public ON public.system_settings(is_public);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_admin_roles_updated_at 
    BEFORE UPDATE ON public.admin_roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTION: Check Admin Permission
-- =====================================================

CREATE OR REPLACE FUNCTION has_admin_permission(
    p_user_id UUID,
    p_scope permission_scope,
    p_action permission_action
)
RETURNS BOOLEAN AS $$
DECLARE
    user_role RECORD;
    permissions JSONB;
BEGIN
    -- Check if user is super admin
    IF EXISTS (
        SELECT 1 FROM public.user_admin_roles uar
        JOIN public.admin_roles ar ON uar.role_id = ar.id
        WHERE uar.user_id = p_user_id 
        AND uar.is_active = true
        AND ar.is_super_admin = true
        AND ar.is_active = true
    ) THEN
        RETURN true;
    END IF;
    
    -- Check specific permissions
    FOR user_role IN 
        SELECT ar.permissions
        FROM public.user_admin_roles uar
        JOIN public.admin_roles ar ON uar.role_id = ar.id
        WHERE uar.user_id = p_user_id 
        AND uar.is_active = true
        AND ar.is_active = true
    LOOP
        permissions := user_role.permissions;
        
        -- Check if permission exists
        IF permissions ? p_scope::TEXT THEN
            IF permissions->p_scope::TEXT ? p_action::TEXT THEN
                IF (permissions->p_scope::TEXT->>p_action::TEXT)::BOOLEAN THEN
                    RETURN true;
                END IF;
            END IF;
            -- Check for 'manage' permission (grants all actions)
            IF permissions->p_scope::TEXT ? 'manage' THEN
                IF (permissions->p_scope::TEXT->>'manage')::BOOLEAN THEN
                    RETURN true;
                END IF;
            END IF;
        END IF;
    END LOOP;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Log Admin Activity
-- =====================================================

CREATE OR REPLACE FUNCTION log_admin_activity(
    p_user_id UUID,
    p_activity_type activity_type,
    p_resource_type TEXT,
    p_resource_id UUID,
    p_action TEXT,
    p_description TEXT DEFAULT NULL,
    p_changes JSONB DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Get user info
    SELECT email, full_name INTO user_record
    FROM public.users
    WHERE id = p_user_id;
    
    -- Insert log
    INSERT INTO public.admin_activity_log (
        user_id, user_email, user_name, activity_type,
        resource_type, resource_id, action, description, changes
    ) VALUES (
        p_user_id, user_record.email, user_record.full_name, p_activity_type,
        p_resource_type, p_resource_id, p_action, p_description, p_changes
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Get System Overview
-- =====================================================

CREATE OR REPLACE FUNCTION get_system_overview()
RETURNS TABLE (
    total_users BIGINT,
    total_classes BIGINT,
    total_content BIGINT,
    active_sessions BIGINT,
    disk_usage_mb NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT c.id) as total_classes,
        COUNT(DISTINCT ci.id) as total_content,
        0::BIGINT as active_sessions, -- Placeholder
        ROUND(COALESCE(SUM(ci.file_size), 0)::NUMERIC / 1024 / 1024, 2) as disk_usage_mb
    FROM public.users u
    CROSS JOIN public.classes c
    CROSS JOIN public.content_items ci;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Refresh System Stats
-- =====================================================

CREATE OR REPLACE FUNCTION refresh_system_statistics()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW public.system_statistics;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DEFAULT ADMIN ROLES
-- =====================================================

INSERT INTO public.admin_roles (name, name_ar, description, permissions, is_super_admin, priority) VALUES
('Super Admin', 'مدير النظام', 'Full system access', '{}'::jsonb, true, 100),
('School Admin', 'مدير المدرسة', 'Manage school resources', 
    '{
        "users": {"create": true, "read": true, "update": true, "delete": true},
        "classes": {"manage": true},
        "subjects": {"manage": true},
        "assignments": {"manage": true},
        "grades": {"manage": true},
        "reports": {"read": true, "export": true}
    }'::jsonb, 
    false, 80),
('Content Manager', 'مدير المحتوى', 'Manage educational content',
    '{
        "content": {"manage": true},
        "games": {"manage": true}
    }'::jsonb,
    false, 50),
('Support Admin', 'الدعم الفني', 'User support and monitoring',
    '{
        "users": {"read": true, "update": true},
        "reports": {"read": true},
        "chat": {"read": true}
    }'::jsonb,
    false, 30);

-- =====================================================
-- POLICIES (Row Level Security)
-- =====================================================

ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view roles
CREATE POLICY admins_view_roles ON public.admin_roles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_admin_roles
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Admins can view their own roles
CREATE POLICY users_view_own_admin_roles ON public.user_admin_roles
    FOR SELECT
    USING (user_id = auth.uid());

-- Super admins can view all activity logs
CREATE POLICY admins_view_activity_log ON public.admin_activity_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_admin_roles uar
            JOIN public.admin_roles ar ON uar.role_id = ar.id
            WHERE uar.user_id = auth.uid() 
            AND uar.is_active = true
            AND ar.is_super_admin = true
        )
    );

-- Public settings can be viewed by anyone
CREATE POLICY view_public_settings ON public.system_settings
    FOR SELECT
    USING (is_public = true);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.admin_roles IS 'Administrative roles with permissions';
COMMENT ON TABLE public.user_admin_roles IS 'User assignments to admin roles';
COMMENT ON TABLE public.admin_activity_log IS 'Audit log of admin activities';
COMMENT ON TABLE public.system_settings IS 'System-wide configuration settings';

COMMENT ON FUNCTION has_admin_permission IS 'Check if user has specific admin permission';
COMMENT ON FUNCTION log_admin_activity IS 'Log an admin activity for audit trail';
COMMENT ON FUNCTION get_system_overview IS 'Get high-level system statistics';

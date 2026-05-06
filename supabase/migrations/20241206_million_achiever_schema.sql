-- =====================================================
-- Million Achiever Program - Complete Database Schema
-- =====================================================
-- Year-long competitive learning system with scoring,
-- levels, badges, leaderboards, and anti-cheat
-- =====================================================

-- =====================================================
-- 1. MILLION_PROFILES
-- Core student profile for Million Achiever Program
-- =====================================================
CREATE TABLE IF NOT EXISTS million_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Point Tracking
    total_points INTEGER DEFAULT 0 NOT NULL,
    current_level VARCHAR(50) DEFAULT 'Beginner' NOT NULL,
    level_number INTEGER DEFAULT 1 NOT NULL,
    points_to_next_level INTEGER DEFAULT 1000 NOT NULL,
    
    -- Rankings
    class_rank INTEGER,
    grade_rank INTEGER,
    school_rank INTEGER,
    
    -- Calculated Metrics
    progress_index DECIMAL(5,2) DEFAULT 0.00, -- 0.00 to 100.00
    consistency_index DECIMAL(5,2) DEFAULT 0.00, -- 0.00 to 1.00
    winning_probability DECIMAL(5,2) DEFAULT 0.00, -- 0.00 to 100.00
    improvement_rate DECIMAL(5,2) DEFAULT 0.00, -- percentage
    
    -- Streak Tracking
    current_streak_days INTEGER DEFAULT 0,
    longest_streak_days INTEGER DEFAULT 0,
    last_activity_date DATE,
    
    -- Status
    is_finalist BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_frozen BOOLEAN DEFAULT FALSE, -- Frozen if flagged
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(student_id)
);

-- =====================================================
-- 2. MILLION_SCORES
-- Category-wise score breakdown
-- =====================================================
CREATE TABLE IF NOT EXISTS million_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES million_profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 9 Scoring Categories (0-100 scale each)
    attendance_score DECIMAL(5,2) DEFAULT 0.00,
    behavior_score DECIMAL(5,2) DEFAULT 0.00,
    assignments_score DECIMAL(5,2) DEFAULT 0.00,
    exams_score DECIMAL(5,2) DEFAULT 0.00,
    participation_score DECIMAL(5,2) DEFAULT 0.00,
    projects_score DECIMAL(5,2) DEFAULT 0.00,
    consistency_score DECIMAL(5,2) DEFAULT 0.00,
    content_progress_score DECIMAL(5,2) DEFAULT 0.00,
    extra_activities_score DECIMAL(5,2) DEFAULT 0.00,
    
    -- Weighted Points (based on category weights)
    attendance_points INTEGER DEFAULT 0,
    behavior_points INTEGER DEFAULT 0,
    assignments_points INTEGER DEFAULT 0,
    exams_points INTEGER DEFAULT 0,
    participation_points INTEGER DEFAULT 0,
    projects_points INTEGER DEFAULT 0,
    consistency_points INTEGER DEFAULT 0,
    content_progress_points INTEGER DEFAULT 0,
    extra_activities_points INTEGER DEFAULT 0,
    
    -- Time Period
    period_type VARCHAR(20) DEFAULT 'yearly', -- daily, weekly, monthly, yearly
    period_start_date DATE NOT NULL,
    period_end_date DATE,
    
    -- Metadata
    calculated_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(profile_id, period_type, period_start_date)
);

-- =====================================================
-- 3. MILLION_LEVELS
-- 7 Level Definitions
-- =====================================================
CREATE TABLE IF NOT EXISTS million_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_number INTEGER UNIQUE NOT NULL,
    level_name VARCHAR(50) UNIQUE NOT NULL,
    
    -- Requirements
    min_points INTEGER NOT NULL,
    max_points INTEGER,
    min_consistency_index DECIMAL(5,2) DEFAULT 0.00,
    min_behavior_score DECIMAL(5,2) DEFAULT 0.00,
    min_attendance_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Rewards
    xp_boost_multiplier DECIMAL(3,2) DEFAULT 1.00,
    special_badge VARCHAR(100),
    unlock_features JSONB, -- Array of feature names
    
    -- UI
    color_hex VARCHAR(7),
    icon_name VARCHAR(50),
    description TEXT,
    congratulations_message TEXT,
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. MILLION_BADGES
-- Badge Type Definitions
-- =====================================================
CREATE TABLE IF NOT EXISTS million_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_code VARCHAR(50) UNIQUE NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    badge_name_ar VARCHAR(100) NOT NULL,
    
    -- Criteria (JSONB for flexibility)
    criteria JSONB NOT NULL, -- {type, threshold, comparison, etc}
    
    -- Visual
    icon_url VARCHAR(255),
    color_hex VARCHAR(7),
    rarity VARCHAR(20) DEFAULT 'common', -- common, rare, epic, legendary
    
    -- Points Reward
    points_reward INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_auto_award BOOLEAN DEFAULT TRUE, -- Auto-award when criteria met
    
    -- Metadata
    description TEXT,
    description_ar TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 5. MILLION_BADGE_AWARDS
-- Student Badge Achievements
-- =====================================================
CREATE TABLE IF NOT EXISTS million_badge_awards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES million_profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES million_badges(id) ON DELETE CASCADE,
    
    -- Award Details
    awarded_at TIMESTAMP DEFAULT NOW(),
    progress_percentage DECIMAL(5,2) DEFAULT 100.00, -- For partial progress
    
    -- Evidence
    criteria_met JSONB, -- What criteria were fulfilled
    evidence_data JSONB, -- Supporting data
    
    -- Status
    is_claimed BOOLEAN DEFAULT FALSE,
    claimed_at TIMESTAMP,
    
    UNIQUE(profile_id, badge_id)
);

-- =====================================================
-- 6. MILLION_HISTORY_LOGS
-- Audit Trail for Point Changes
-- =====================================================
CREATE TABLE IF NOT EXISTS million_history_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES million_profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Change Details
    action_type VARCHAR(50) NOT NULL, -- 'points_added', 'level_up', 'badge_earned', 'flag_created', etc
    category VARCHAR(50), -- Which scoring category
    
    -- Values
    points_before INTEGER,
    points_after INTEGER,
    points_change INTEGER,
    
    -- Context
    reason TEXT,
    metadata JSONB, -- Flexible additional data
    
    -- Source
    triggered_by VARCHAR(50), -- 'system', 'admin', 'student'
    admin_id UUID REFERENCES users(id),
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_history_logs_profile ON million_history_logs(profile_id);
CREATE INDEX idx_history_logs_student ON million_history_logs(student_id);
CREATE INDEX idx_history_logs_created ON million_history_logs(created_at DESC);

-- =====================================================
-- 7. MILLION_LEADERBOARD_CACHE
-- Pre-calculated Rankings for Performance
-- =====================================================
CREATE TABLE IF NOT EXISTS million_leaderboard_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Scope
    scope_type VARCHAR(20) NOT NULL, -- 'class', 'grade', 'school', 'top50'
    scope_id UUID, -- class_id or grade_id (NULL for school/top50)
    
    -- Rankings (JSONB array for fast retrieval)
    rankings JSONB NOT NULL, -- [{student_id, rank, points, level, etc}]
    
    -- Metadata
    total_participants INTEGER,
    last_updated TIMESTAMP DEFAULT NOW(),
    is_stale BOOLEAN DEFAULT FALSE,
    
    -- Filtering
    gender VARCHAR(10),
    section VARCHAR(50),
    
    UNIQUE(scope_type, scope_id, gender, section)
);

CREATE INDEX idx_leaderboard_scope ON million_leaderboard_cache(scope_type, scope_id);
CREATE INDEX idx_leaderboard_updated ON million_leaderboard_cache(last_updated DESC);

-- =====================================================
-- 8. MILLION_FINALISTS
-- Top-50, Top-10, and Winner Tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS million_finalists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES million_profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Finalist Tier
    tier VARCHAR(20) NOT NULL, -- 'top50', 'top10', 'winner'
    rank INTEGER NOT NULL,
    
    -- Qualification Scores
    total_points INTEGER NOT NULL,
    consistency_index DECIMAL(5,2) NOT NULL,
    behavior_score DECIMAL(5,2) NOT NULL,
    improvement_rate DECIMAL(5,2) NOT NULL,
    teacher_evaluation_score DECIMAL(5,2),
    leadership_score DECIMAL(5,2),
    
    -- Weighted Final Score
    final_weighted_score DECIMAL(8,2) NOT NULL,
    
    -- Selection Details
    selection_criteria JSONB, -- Criteria used for selection
    qualified_at TIMESTAMP DEFAULT NOW(),
    
    -- Admin Review
    admin_approved BOOLEAN DEFAULT FALSE,
    admin_approved_by UUID REFERENCES users(id),
    admin_approved_at TIMESTAMP,
    admin_notes TEXT,
    
    -- Profile Data Snapshot
    profile_snapshot JSONB, -- Full profile at time of selection
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_finalists_tier ON million_finalists(tier, rank);
CREATE INDEX idx_finalists_student ON million_finalists(student_id);

-- =====================================================
-- 9. MILLION_FLAGS
-- Anti-Cheat Flags and Reviews
-- =====================================================
CREATE TABLE IF NOT EXISTS million_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES million_profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Flag Details
    flag_type VARCHAR(50) NOT NULL, -- 'score_jump', 'assignment_anomaly', 'attendance_pattern', etc
    severity VARCHAR(20) NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    
    -- Detection Data
    detected_value JSONB, -- What was detected
    expected_range JSONB, -- What was expected
    deviation_percentage DECIMAL(5,2), -- How far from normal
    
    -- Evidence
    evidence JSONB, -- Supporting data
    detection_algorithm VARCHAR(100), -- Which rule triggered
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'investigating'
    
    -- Admin Review
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    action_taken VARCHAR(100), -- 'cleared', 'points_deducted', 'disqualified', etc
    
    -- Impact
    points_affected INTEGER DEFAULT 0,
    is_resolved BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_flags_profile ON million_flags(profile_id);
CREATE INDEX idx_flags_status ON million_flags(status);
CREATE INDEX idx_flags_severity ON million_flags(severity);
CREATE INDEX idx_flags_created ON million_flags(created_at DESC);

-- =====================================================
-- 10. MILLION_ADMIN_SETTINGS
-- System Configuration
-- =====================================================
CREATE TABLE IF NOT EXISTS million_admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    setting_type VARCHAR(50) NOT NULL, -- 'weights', 'thresholds', 'rules', 'dates', etc
    
    -- Metadata
    description TEXT,
    last_modified_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 11. MILLION_NOTIFICATIONS
-- Notification Templates and History
-- =====================================================
CREATE TABLE IF NOT EXISTS million_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Recipient
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES million_profiles(id) ON DELETE CASCADE,
    
    -- Notification Details
    notification_type VARCHAR(50) NOT NULL, -- 'level_up', 'badge_earned', 'position_change', etc
    title VARCHAR(200) NOT NULL,
    title_ar VARCHAR(200),
    message TEXT NOT NULL,
    message_ar TEXT,
    
    -- Template Data
    template_code VARCHAR(50),
    template_variables JSONB, -- Variables used in template
    
    -- Priority
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP,
    
    -- Delivery Channels
    sent_via_app BOOLEAN DEFAULT TRUE,
    sent_via_email BOOLEAN DEFAULT FALSE,
    sent_via_push BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

CREATE INDEX idx_notifications_student ON million_notifications(student_id);
CREATE INDEX idx_notifications_read ON million_notifications(is_read, created_at DESC);
CREATE INDEX idx_notifications_type ON million_notifications(notification_type);

-- =====================================================
-- SEED DATA: Default Levels
-- =====================================================
INSERT INTO million_levels (level_number, level_name, min_points, max_points, min_consistency_index, min_behavior_score, min_attendance_percentage, xp_boost_multiplier, color_hex, icon_name, description, congratulations_message) VALUES
(1, 'Beginner', 0, 999, 0.00, 0.00, 0.00, 1.00, '#94A3B8', 'user', 'Welcome to Million Achiever! Start your journey by completing assignments and attending classes.', 'مرحباً في برنامج مليون! ابدأ رحلتك نحو التميز!'),
(2, 'Active Learner', 1000, 2499, 0.30, 70.00, 80.00, 1.10, '#3B82F6', 'book-open', 'You are actively participating! Keep up the good work.', 'رائع! أنت متعلم نشط! استمر في التقدم!'),
(3, 'Consistent Performer', 2500, 4999, 0.50, 75.00, 85.00, 1.20, '#8B5CF6', 'trend-up', 'Your consistency is paying off! You are in the top 30%.', 'أداء متميز! أنت الآن ضمن أفضل 30%!'),
(4, 'Achiever', 5000, 7999, 0.65, 80.00, 90.00, 1.30, '#EC4899', 'award', 'Excellent progress! You are on track to become a top performer.', 'تقدم ممتاز! أنت في طريقك للقمة!'),
(5, 'Elite Student', 8000, 11999, 0.75, 85.00, 93.00, 1.50, '#F59E0B', 'star', 'Outstanding! You are among the elite students.', 'متميز جداً! أنت من النخبة!'),
(6, 'Top 1% Performer', 12000, 19999, 0.85, 90.00, 95.00, 1.75, '#10B981', 'zap', 'Incredible! You are in the top 1% of all students!', 'مذهل! أنت ضمن أفضل 1% من الطلاب!'),
(7, 'Million Finalist', 20000, NULL, 0.90, 95.00, 98.00, 2.00, '#EF4444', 'trophy', 'You are a finalist! Competing for the grand prize of 1,000,000 SAR!', 'مبروك! أنت مرشح للفوز بمليون ريال!')
ON CONFLICT (level_number) DO NOTHING;

-- =====================================================
-- SEED DATA: Default Badges
-- =====================================================
INSERT INTO million_badges (badge_code, badge_name, badge_name_ar, criteria, rarity, points_reward, description, description_ar, is_auto_award) VALUES
('CONSISTENCY_30', 'Consistency Champion', 'بطل الاستمرارية', '{"type": "streak", "days": 30}', 'rare', 200, '30 days login streak', '30 يوم حضور متواصل', true),
('EXCELLENCE_95', 'Excellence Badge', 'وسام التميز', '{"type": "average_grade", "threshold": 95}', 'epic', 300, '95%+ average grade', 'معدل 95% أو أكثر', true),
('CREATIVITY_5', 'Creative Mind', 'عقل مبدع', '{"type": "creative_projects", "count": 5}', 'rare', 250, 'Complete 5 creative projects', 'أكمل 5 مشاريع إبداعية', true),
('SPEED_LEARNER', 'Speed Learner', 'متعلم سريع', '{"type": "lesson_speed", "multiplier": 2}', 'epic', 300, 'Complete lessons 2x faster than average', 'أكمل الدروس بسرعة ضعف المعدل', true),
('LEADERSHIP_10', 'Leader', 'قائد', '{"type": "help_peers", "count": 10}', 'legendary', 500, 'Help 10+ classmates', 'ساعد 10 من زملائك', true),
('CHALLENGE_WINNER', 'Challenge Winner', 'بطل التحدي', '{"type": "weekly_challenge", "wins": 1}', 'epic', 400, 'Win a weekly challenge', 'فوز في التحدي الأسبوعي', true),
('TOP_PERFORMER', 'Top Performer', 'الأفضل أداءً', '{"type": "grade_rank", "threshold": 10}', 'legendary', 600, 'Reach top 10 in grade', 'وصول لأفضل 10 في الصف', true),
('PERFECT_ATTENDANCE', 'Perfect Attendance', 'حضور مثالي', '{"type": "attendance", "percentage": 100, "period": "month"}', 'rare', 250, '100% attendance for a month', 'حضور كامل لمدة شهر', true)
ON CONFLICT (badge_code) DO NOTHING;

-- =====================================================
-- SEED DATA: Default Admin Settings
-- =====================================================
INSERT INTO million_admin_settings (setting_key, setting_value, setting_type, description) VALUES
('scoring_weights', '{"attendance": 10, "behavior": 15, "assignments": 20, "exams": 25, "participation": 10, "projects": 10, "consistency": 5, "content_progress": 3, "extra_activities": 2}'::jsonb, 'weights', 'Category weight percentages (must sum to 100)'),
('competition_dates', '{"start_date": "2024-09-01", "end_date": "2025-06-30", "finalist_announcement": "2025-07-15"}'::jsonb, 'dates', 'Competition timeline'),
('finalist_criteria', '{"top50_min_points": 20000, "top50_consistency": 0.75, "top50_behavior": 90, "top10_teacher_eval": 4.5, "top10_leadership": 80}'::jsonb, 'thresholds', 'Finalist selection thresholds'),
('anti_cheat_thresholds', '{"score_jump_24h": 500, "score_jump_7d": 2000, "deviation_stdev": 3, "attendance_pattern_similarity": 0.95}'::jsonb, 'thresholds', 'Anti-cheat detection thresholds'),
('notification_settings', '{"enable_level_up": true, "enable_badge": true, "enable_position_change": true, "enable_weekly_summary": true, "email_digest_frequency": "weekly"}'::jsonb, 'rules', 'Notification preferences')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_profiles_student ON million_profiles(student_id);
CREATE INDEX idx_profiles_level ON million_profiles(current_level, level_number);
CREATE INDEX idx_profiles_rank ON million_profiles(school_rank);
CREATE INDEX idx_profiles_points ON million_profiles(total_points DESC);
CREATE INDEX idx_profiles_active ON million_profiles(is_active, is_frozen);

CREATE INDEX idx_scores_profile ON million_scores(profile_id);
CREATE INDEX idx_scores_student ON million_scores(student_id);
CREATE INDEX idx_scores_period ON million_scores(period_type, period_start_date);

CREATE INDEX idx_badge_awards_profile ON million_badge_awards(profile_id);
CREATE INDEX idx_badge_awards_student ON million_badge_awards(student_id);
CREATE INDEX idx_badge_awards_badge ON million_badge_awards(badge_id);

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATE
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_million_profiles_updated_at BEFORE UPDATE ON million_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_million_scores_updated_at BEFORE UPDATE ON million_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_million_levels_updated_at BEFORE UPDATE ON million_levels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_million_badges_updated_at BEFORE UPDATE ON million_badges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_million_finalists_updated_at BEFORE UPDATE ON million_finalists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_million_flags_updated_at BEFORE UPDATE ON million_flags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_million_admin_settings_updated_at BEFORE UPDATE ON million_admin_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE million_profiles IS 'Core student profiles for Million Achiever Program';
COMMENT ON TABLE million_scores IS 'Category-wise score breakdown for each student';
COMMENT ON TABLE million_levels IS '7 competitive level definitions';
COMMENT ON TABLE million_badges IS 'Badge type definitions';
COMMENT ON TABLE million_badge_awards IS 'Student badge achievements';
COMMENT ON TABLE million_history_logs IS 'Audit trail for all point changes';
COMMENT ON TABLE million_leaderboard_cache IS 'Pre-calculated rankings for performance';
COMMENT ON TABLE million_finalists IS 'Top-50, Top-10, and winner tracking';
COMMENT ON TABLE million_flags IS 'Anti-cheat flags and admin reviews';
COMMENT ON TABLE million_admin_settings IS 'System-wide configuration';
COMMENT ON TABLE million_notifications IS 'Notification templates and delivery history';

-- =====================================================
-- END OF MIGRATION
-- =====================================================

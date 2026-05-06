-- Million Platform - Database Indexes
-- Migration: 003_indexes.sql
-- Description: Create indexes for optimal query performance

-- Million Dialogue Indexes
CREATE INDEX IF NOT EXISTS idx_million_rooms_host_id 
    ON million_rooms(host_id);

CREATE INDEX IF NOT EXISTS idx_million_rooms_status 
    ON million_rooms(status) WHERE status IN ('waiting', 'in_progress');

CREATE INDEX IF NOT EXISTS idx_million_rooms_created_at 
    ON million_rooms(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_million_rounds_room_id 
    ON million_rounds(room_id);

CREATE INDEX IF NOT EXISTS idx_million_rounds_room_round 
    ON million_rounds(room_id, round_number);

CREATE INDEX IF NOT EXISTS idx_million_questions_difficulty 
    ON million_questions(difficulty);

CREATE INDEX IF NOT EXISTS idx_million_questions_tags 
    ON million_questions USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_million_round_questions_round_id 
    ON million_round_questions(round_id);

CREATE INDEX IF NOT EXISTS idx_million_round_questions_question_id 
    ON million_round_questions(question_id);

CREATE INDEX IF NOT EXISTS idx_million_answers_round_id 
    ON million_answers(round_id);

CREATE INDEX IF NOT EXISTS idx_million_answers_user_id 
    ON million_answers(user_id);

CREATE INDEX IF NOT EXISTS idx_million_answers_created_at 
    ON million_answers(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_million_scores_room_id 
    ON million_scores(room_id);

CREATE INDEX IF NOT EXISTS idx_million_scores_user_id 
    ON million_scores(user_id);

CREATE INDEX IF NOT EXISTS idx_million_scores_total_points 
    ON million_scores(total_points DESC);

CREATE INDEX IF NOT EXISTS idx_million_room_participants_room_id 
    ON million_room_participants(room_id);

CREATE INDEX IF NOT EXISTS idx_million_room_participants_user_id 
    ON million_room_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_million_room_participants_active 
    ON million_room_participants(room_id, is_active) WHERE is_active = TRUE;

-- Sidebar Feature Indexes
CREATE INDEX IF NOT EXISTS idx_assignments_student_id 
    ON assignments(student_id);

CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id 
    ON assignments(teacher_id);

CREATE INDEX IF NOT EXISTS idx_assignments_class_id 
    ON assignments(class_id);

CREATE INDEX IF NOT EXISTS idx_assignments_status 
    ON assignments(status);

CREATE INDEX IF NOT EXISTS idx_assignments_due_date 
    ON assignments(due_date) WHERE status != 'graded';

CREATE INDEX IF NOT EXISTS idx_assignments_student_status 
    ON assignments(student_id, status);

CREATE INDEX IF NOT EXISTS idx_grades_student_id 
    ON grades(student_id);

CREATE INDEX IF NOT EXISTS idx_grades_class_id 
    ON grades(class_id);

CREATE INDEX IF NOT EXISTS idx_grades_subject 
    ON grades(subject);

CREATE INDEX IF NOT EXISTS idx_grades_date 
    ON grades(date DESC);

CREATE INDEX IF NOT EXISTS idx_grades_student_subject 
    ON grades(student_id, subject);

CREATE INDEX IF NOT EXISTS idx_attendance_student_id 
    ON attendance(student_id);

CREATE INDEX IF NOT EXISTS idx_attendance_date 
    ON attendance(date DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_student_date 
    ON attendance(student_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_status 
    ON attendance(status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
    ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_read 
    ON notifications(user_id, read) WHERE read = FALSE;

CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
    ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_type 
    ON notifications(type);

CREATE INDEX IF NOT EXISTS idx_notifications_priority 
    ON notifications(priority) WHERE priority IN ('high', 'urgent');

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id 
    ON user_settings(user_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_million_leaderboard 
    ON million_scores(room_id, total_points DESC, updated_at);

CREATE INDEX IF NOT EXISTS idx_student_assignments_pending 
    ON assignments(student_id, due_date) 
    WHERE status IN ('pending', 'late');

CREATE INDEX IF NOT EXISTS idx_recent_grades 
    ON grades(student_id, date DESC, score);

-- Partial indexes for active data
CREATE INDEX IF NOT EXISTS idx_active_rooms 
    ON million_rooms(created_at DESC) 
    WHERE status IN ('waiting', 'in_progress');

CREATE INDEX IF NOT EXISTS idx_unread_notifications 
    ON notifications(user_id, created_at DESC) 
    WHERE read = FALSE AND (expires_at IS NULL OR expires_at > NOW());

-- Full-text search indexes (optional, if using PostgreSQL full-text search)
CREATE INDEX IF NOT EXISTS idx_million_questions_text_search 
    ON million_questions USING GIN(to_tsvector('arabic', text_ar));

CREATE INDEX IF NOT EXISTS idx_assignments_title_search 
    ON assignments USING GIN(to_tsvector('arabic', title || ' ' || COALESCE(description, '')));

-- Comments
COMMENT ON INDEX idx_million_rooms_status IS 'Optimize queries for active rooms';
COMMENT ON INDEX idx_million_scores_total_points IS 'Optimize leaderboard queries';
COMMENT ON INDEX idx_assignments_due_date IS 'Optimize upcoming assignments queries';
COMMENT ON INDEX idx_unread_notifications IS 'Optimize unread notifications with expiry check';

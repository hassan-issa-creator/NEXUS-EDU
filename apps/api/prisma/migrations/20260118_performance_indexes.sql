-- Performance Indexes Migration
-- Created: 2026-01-18
-- Purpose: Add optimized indexes for better query performance

-- =============================================
-- MESSAGE & CHAT OPTIMIZATIONS
-- =============================================

-- Index for fetching messages by conversation with proper ordering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_conversation_created 
  ON "Message"("conversationId", "createdAt" DESC);

-- Index for conversation participants lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversation_participant_user 
  ON "ConversationParticipant"("userId", "conversationId");

-- =============================================
-- ATTENDANCE OPTIMIZATIONS
-- =============================================

-- Composite index for student attendance queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_student_date 
  ON "Attendance"("studentId", "date" DESC);

-- Index for class attendance reports
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_class_date_status 
  ON "Attendance"("classId", "date", "status");

-- =============================================
-- SUBMISSION & ASSIGNMENT OPTIMIZATIONS
-- =============================================

-- Index for fetching submissions by assignment
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_submission_assignment_submitted 
  ON "Submission"("assignmentId", "submittedAt" DESC);

-- Index for student submission history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_submission_student_submitted 
  ON "Submission"("studentId", "submittedAt" DESC);

-- Index for assignments by subject with due date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assignment_subject_due 
  ON "Assignment"("subjectId", "dueDate");

-- Index for teacher assignments
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assignment_teacher_created 
  ON "Assignment"("teacherId", "createdAt" DESC);

-- =============================================
-- GRADE OPTIMIZATIONS
-- =============================================

-- Composite index for grade queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_grade_student_subject 
  ON "Grade"("studentId", "subjectId");

-- Index for subject grade reports
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_grade_subject_created 
  ON "Grade"("subjectId", "createdAt" DESC);

-- =============================================
-- MILLION MODULE OPTIMIZATIONS
-- =============================================

-- Index for leaderboard queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_million_profile_points 
  ON "MillionProfile"("totalPoints" DESC);

-- Index for score history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_million_score_profile_date 
  ON "MillionScore"("profileId", "date" DESC);

-- =============================================
-- ENROLLMENT OPTIMIZATIONS
-- =============================================

-- Index for class student lists
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollment_class_enrolled 
  ON "Enrollment"("classId", "enrolledAt");

-- =============================================
-- INVOICE OPTIMIZATIONS
-- =============================================

-- Index for payment status queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoice_status_created 
  ON "Invoice"("status", "createdAt" DESC);

-- =============================================
-- LESSON OPTIMIZATIONS
-- =============================================

-- Index for subject lessons
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lesson_subject_created 
  ON "Lesson"("subjectId", "createdAt" DESC);

-- =============================================
-- CLASS SESSION OPTIMIZATIONS
-- =============================================

-- Index for active sessions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_class_session_active 
  ON "ClassSession"("isActive", "startTime");

-- Index for class sessions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_class_session_class_start 
  ON "ClassSession"("classId", "startTime" DESC);

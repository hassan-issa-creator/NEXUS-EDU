-- Exam System Migration
-- Migration: 20241203_005_exam_system.sql

-- =====================================================
-- EXAM SYSTEM TABLES
-- =====================================================

-- Create ENUM types for exam system
CREATE TYPE exam_type AS ENUM ('quiz', 'midterm', 'final', 'assignment', 'practice');
CREATE TYPE exam_status AS ENUM ('draft', 'published', 'active', 'closed', 'archived');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'true_false', 'short_answer', 'essay', 'fill_blank');
CREATE TYPE exam_submission_status AS ENUM ('not_started', 'in_progress', 'submitted', 'graded', 'late');

-- =====================================================
-- 1. EXAMS TABLE
-- =====================================================

CREATE TABLE public.exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Info
    title TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    
    -- Relations
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.users(id) NOT NULL,
    
    -- Exam Configuration
    exam_type exam_type NOT NULL DEFAULT 'quiz',
    status exam_status DEFAULT 'draft',
    
    -- Timing
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    
    -- Grading
    total_points NUMERIC(6,2) NOT NULL DEFAULT 100,
    passing_score NUMERIC(6,2) DEFAULT 60,
    
    -- Settings (JSONB for flexibility)
    settings JSONB DEFAULT '{
        "randomizeQuestions": false,
        "randomizeOptions": false,
        "showResults": true,
        "showCorrectAnswers": false,
        "allowReview": true,
        "requireFullScreen": false,
        "preventTabSwitch": false,
        "maxAttempts": 1,
        "showTimer": true,
        "autoSubmit": true
    }'::jsonb,
    
    -- Publishing
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. EXAM QUESTIONS TABLE
-- =====================================================

CREATE TABLE public.exam_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
    
    -- Question Content
    question_text TEXT NOT NULL,
    question_type question_type NOT NULL DEFAULT 'multiple_choice',
    
    -- Options (for MCQ/TF) - Array of options with correct flag
    -- Format: [{"text": "Option A", "isCorrect": true}, {...}]
    options JSONB,
    
    -- Correct Answer (for short answer/essay)
    correct_answer TEXT,
    
    -- Grading
    points NUMERIC(5,2) NOT NULL DEFAULT 1,
    
    -- Optional: explanation shown after submission
    explanation TEXT,
    
    -- Attachments (images, diagrams, etc.)
    attachment_urls TEXT[],
    
    -- Ordering
    order_index INTEGER NOT NULL DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. EXAM SUBMISSIONS TABLE
-- =====================================================

CREATE TABLE public.exam_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relations
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    time_taken_minutes INTEGER,
    
    -- Status
    status exam_submission_status DEFAULT 'not_started',
    
    -- Grading
    total_score NUMERIC(6,2) DEFAULT 0,
    max_score NUMERIC(6,2),
    percentage NUMERIC(5,2),
    grade_letter VARCHAR(2),
    
    -- Feedback
    overall_feedback TEXT,
    graded_by UUID REFERENCES public.users(id),
    graded_at TIMESTAMPTZ,
    
    -- Anti-Cheating Metrics
    tab_switches INTEGER DEFAULT 0,
    copy_attempts INTEGER DEFAULT 0,
    paste_attempts INTEGER DEFAULT 0,
    fullscreen_exits INTEGER DEFAULT 0,
    suspicious_activity JSONB DEFAULT '[]'::jsonb,
    
    -- IP and Browser Info
    ip_address INET,
    user_agent TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One submission per student per exam
    UNIQUE(exam_id, student_id)
);

-- =====================================================
-- 4. EXAM ANSWERS TABLE
-- =====================================================

CREATE TABLE public.exam_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relations
    submission_id UUID REFERENCES public.exam_submissions(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.exam_questions(id) ON DELETE CASCADE NOT NULL,
    
    -- Answer Content
    answer_value TEXT,
    selected_option_index INTEGER, -- For MCQ (0-based index)
    
    -- Grading
    is_correct BOOLEAN,
    points_awarded NUMERIC(5,2) DEFAULT 0,
    
    -- Teacher Feedback (for essay/short answer)
    feedback TEXT,
    
    -- Timing
    answered_at TIMESTAMPTZ DEFAULT NOW(),
    time_spent_seconds INTEGER,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One answer per question per submission
    UNIQUE(submission_id, question_id)
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================

-- Exams
CREATE INDEX idx_exams_subject ON public.exams(subject_id);
CREATE INDEX idx_exams_class ON public.exams(class_id);
CREATE INDEX idx_exams_created_by ON public.exams(created_by);
CREATE INDEX idx_exams_status ON public.exams(status);
CREATE INDEX idx_exams_start_time ON public.exams(start_time);
CREATE INDEX idx_exams_end_time ON public.exams(end_time);
CREATE INDEX idx_exams_is_published ON public.exams(is_published);

-- Exam Questions
CREATE INDEX idx_exam_questions_exam ON public.exam_questions(exam_id);
CREATE INDEX idx_exam_questions_order ON public.exam_questions(exam_id, order_index);

-- Exam Submissions
CREATE INDEX idx_exam_submissions_exam ON public.exam_submissions(exam_id);
CREATE INDEX idx_exam_submissions_student ON public.exam_submissions(student_id);
CREATE INDEX idx_exam_submissions_status ON public.exam_submissions(status);
CREATE INDEX idx_exam_submissions_submitted_at ON public.exam_submissions(submitted_at);

-- Exam Answers
CREATE INDEX idx_exam_answers_submission ON public.exam_answers(submission_id);
CREATE INDEX idx_exam_answers_question ON public.exam_answers(question_id);

-- =====================================================
-- TRIGGERS for updated_at
-- =====================================================

CREATE TRIGGER update_exams_updated_at 
    BEFORE UPDATE ON public.exams 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exam_questions_updated_at 
    BEFORE UPDATE ON public.exam_questions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exam_submissions_updated_at 
    BEFORE UPDATE ON public.exam_submissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exam_answers_updated_at 
    BEFORE UPDATE ON public.exam_answers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS for Documentation
-- =====================================================

COMMENT ON TABLE public.exams IS 'Online exams/quizzes for students';
COMMENT ON TABLE public.exam_questions IS 'Questions for each exam';
COMMENT ON TABLE public.exam_submissions IS 'Student submissions for exams';
COMMENT ON TABLE public.exam_answers IS 'Individual answers for each question in submission';

COMMENT ON COLUMN public.exams.settings IS 'JSON settings for exam behavior (randomization, display options, security)';
COMMENT ON COLUMN public.exam_submissions.suspicious_activity IS 'Log of potential cheating attempts';
COMMENT ON COLUMN public.exam_questions.options IS 'Array of option objects with text and isCorrect flag';

-- =====================================================
-- FUNCTIONS for Auto-Grading
-- =====================================================

-- Function to calculate submission score
CREATE OR REPLACE FUNCTION calculate_submission_score(submission_id_param UUID)
RETURNS NUMERIC AS $$
DECLARE
    total_score NUMERIC;
    max_score NUMERIC;
BEGIN
    -- Sum up points from all answers
    SELECT 
        COALESCE(SUM(points_awarded), 0),
        COALESCE(SUM(q.points), 0)
    INTO total_score, max_score
    FROM public.exam_answers ea
    JOIN public.exam_questions q ON ea.question_id = q.id
    WHERE ea.submission_id = submission_id_param;
    
    -- Update submission
    UPDATE public.exam_submissions
    SET 
        total_score = calculate_submission_score.total_score,
        max_score = calculate_submission_score.max_score,
        percentage = CASE 
            WHEN calculate_submission_score.max_score > 0 
            THEN (calculate_submission_score.total_score / calculate_submission_score.max_score) * 100 
            ELSE 0 
        END
    WHERE id = submission_id_param;
    
    RETURN total_score;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-grade MCQ/TF questions
CREATE OR REPLACE FUNCTION auto_grade_answer(answer_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
    question_record RECORD;
    answer_record RECORD;
    is_correct BOOLEAN := false;
    points_awarded NUMERIC := 0;
BEGIN
    -- Get answer details
    SELECT * INTO answer_record
    FROM public.exam_answers
    WHERE id = answer_id_param;
    
    -- Get question details
    SELECT * INTO question_record
    FROM public.exam_questions
    WHERE id = answer_record.question_id;
    
    -- Check correctness based on question type
    IF question_record.question_type IN ('multiple_choice', 'true_false') THEN
        -- Check if selected option is correct
        SELECT 
            (options->answer_record.selected_option_index->>'isCorrect')::boolean
        INTO is_correct
        FROM public.exam_questions
        WHERE id = question_record.id;
        
        -- Award points if correct
        IF is_correct THEN
            points_awarded := question_record.points;
        END IF;
        
        -- Update answer
        UPDATE public.exam_answers
        SET 
            is_correct = auto_grade_answer.is_correct,
            points_awarded = auto_grade_answer.points_awarded
        WHERE id = answer_id_param;
    END IF;
    
    RETURN is_correct;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- POLICIES (Row Level Security) - Optional
-- =====================================================

-- Enable RLS on tables
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_answers ENABLE ROW LEVEL SECURITY;

-- Teachers can see all exams they created
CREATE POLICY teachers_own_exams ON public.exams
    FOR ALL
    USING (created_by = auth.uid());

-- Students can see published exams for their classes
CREATE POLICY students_view_published_exams ON public.exams
    FOR SELECT
    USING (
        is_published = true 
        AND class_id IN (
            SELECT class_id FROM public.enrollments 
            WHERE student_id = auth.uid()
        )
    );

-- Students can only see their own submissions
CREATE POLICY students_own_submissions ON public.exam_submissions
    FOR ALL
    USING (student_id = auth.uid());

-- Teachers can see submissions for their exams
CREATE POLICY teachers_view_submissions ON public.exam_submissions
    FOR SELECT
    USING (
        exam_id IN (
            SELECT id FROM public.exams 
            WHERE created_by = auth.uid()
        )
    );

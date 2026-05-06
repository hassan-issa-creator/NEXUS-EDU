-- Million EdTech Platform - Row Level Security Policies (Fixed Version)
-- File: policies_fixed.sql

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any user
CREATE POLICY "Admins can update users"
  ON public.users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- CLASSES TABLE POLICIES
-- =====================================================

-- Students can view their enrolled classes
CREATE POLICY "Students can view enrolled classes"
  ON public.classes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE class_id = classes.id AND student_id = auth.uid()
    )
  );

-- Teachers can view classes they teach
CREATE POLICY "Teachers can view their classes"
  ON public.classes FOR SELECT
  USING (teacher_id = auth.uid());

-- Admins can view all classes
CREATE POLICY "Admins can view all classes"
  ON public.classes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- ENROLLMENTS POLICIES
-- =====================================================

-- Students can view their own enrollments
CREATE POLICY "Students can view own enrollments"
  ON public.enrollments FOR SELECT
  USING (student_id = auth.uid());

-- Teachers can view enrollments in their classes
CREATE POLICY "Teachers can view class enrollments"
  ON public.enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE id = enrollments.class_id AND teacher_id = auth.uid()
    )
  );

-- Admins can manage all enrollments
CREATE POLICY "Admins can manage enrollments"
  ON public.enrollments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- ASSIGNMENTS POLICIES
-- =====================================================

-- Students can view published assignments in their classes
CREATE POLICY "Students can view published assignments"
  ON public.assignments FOR SELECT
  USING (
    status = 'published' AND
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE class_id = assignments.class_id AND student_id = auth.uid()
    )
  );

-- Teachers can manage their assignments
CREATE POLICY "Teachers can manage their assignments"
  ON public.assignments FOR ALL
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

-- =====================================================
-- SUBMISSIONS POLICIES
-- =====================================================

-- Students can manage own submissions
CREATE POLICY "Students can manage own submissions"
  ON public.submissions FOR ALL
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Teachers can grade submissions
CREATE POLICY "Teachers can grade submissions"
  ON public.submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = submissions.assignment_id AND a.teacher_id = auth.uid()
    )
  );

-- =====================================================
-- GRADES POLICIES
-- =====================================================

-- Students can view their own grades
CREATE POLICY "Students can view own grades"
  ON public.grades FOR SELECT
  USING (student_id = auth.uid());

-- Teachers can manage grades for their classes
CREATE POLICY "Teachers can manage grades"
  ON public.grades FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE id = grades.class_id AND teacher_id = auth.uid()
    )
  );

-- =====================================================
-- ATTENDANCE POLICIES
-- =====================================================

-- Students can view their own attendance
CREATE POLICY "Students can view own attendance"
  ON public.attendance FOR SELECT
  USING (student_id = auth.uid());

-- Teachers can manage class attendance
CREATE POLICY "Teachers can manage class attendance"
  ON public.attendance FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE id = attendance.class_id AND teacher_id = auth.uid()
    )
  );

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their notification read status
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- System can create notifications
CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- MESSAGES POLICIES
-- =====================================================

-- Students can view messages in their classes
CREATE POLICY "Students can view class messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE class_id = messages.class_id AND student_id = auth.uid()
    )
  );

-- Teachers can manage class messages
CREATE POLICY "Teachers can manage class messages"
  ON public.messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE id = messages.class_id AND teacher_id = auth.uid()
    )
  );

-- =====================================================
-- PAYMENTS POLICIES
-- =====================================================

-- Students can view their own payments
CREATE POLICY "Students can view own payments"
  ON public.payments FOR SELECT
  USING (student_id = auth.uid());

-- Admins can manage all payments
CREATE POLICY "Admins can manage payments"
  ON public.payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Million EdTech Platform - Row Level Security Policies
-- File: policies.sql

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
-- HELPER FUNCTIONS
-- =====================================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if user is teacher
CREATE OR REPLACE FUNCTION auth.is_teacher()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'teacher'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if user teaches a class
CREATE OR REPLACE FUNCTION auth.teaches_class(class_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classes 
    WHERE id = class_id AND teacher_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if student is enrolled in class
CREATE OR REPLACE FUNCTION auth.is_enrolled(class_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.enrollments 
    WHERE class_id = class_id AND student_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if user is parent of student
CREATE OR REPLACE FUNCTION auth.is_parent_of(student_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parent_students 
    WHERE parent_id = auth.uid() AND student_id = student_id
  );
$$ LANGUAGE SQL SECURITY DEFINER;

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
  USING (auth.is_admin());

-- Teachers can view students in their classes
CREATE POLICY "Teachers can view their students"
  ON public.users FOR SELECT
  USING (
    auth.is_teacher() AND
    role = 'student' AND
    EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.classes c ON e.class_id = c.id
      WHERE e.student_id = users.id AND c.teacher_id = auth.uid()
    )
  );

-- Parents can view their children
CREATE POLICY "Parents can view their children"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_students
      WHERE parent_id = auth.uid() AND student_id = users.id
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
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

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
  USING (auth.is_admin());

-- Teachers can update their classes
CREATE POLICY "Teachers can update their classes"
  ON public.classes FOR UPDATE
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

-- Admins can create/update/delete classes
CREATE POLICY "Admins can manage classes"
  ON public.classes FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

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

-- Parents can view their children's enrollments
CREATE POLICY "Parents can view children enrollments"
  ON public.enrollments FOR SELECT
  USING (auth.is_parent_of(student_id));

-- Admins can manage all enrollments
CREATE POLICY "Admins can manage enrollments"
  ON public.enrollments FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- =====================================================
-- ASSIGNMENTS POLICIES
-- =====================================================

-- Students can view published assignments in their classes
CREATE POLICY "Students can view published assignments"
  ON public.assignments FOR SELECT
  USING (
    status = 'published' AND
    auth.is_enrolled(class_id)
  );

-- Teachers can view/manage their assignments
CREATE POLICY "Teachers can manage their assignments"
  ON public.assignments FOR ALL
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

-- Admins can view all assignments
CREATE POLICY "Admins can view all assignments"
  ON public.assignments FOR SELECT
  USING (auth.is_admin());

-- =====================================================
-- SUBMISSIONS POLICIES
-- =====================================================

-- Students can view/create/update their own submissions
CREATE POLICY "Students can manage own submissions"
  ON public.submissions FOR ALL
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Teachers can view/grade submissions in their classes
CREATE POLICY "Teachers can grade submissions"
  ON public.submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = submissions.assignment_id AND a.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = submissions.assignment_id AND a.teacher_id = auth.uid()
    )
  );

-- Parents can view their children's submissions
CREATE POLICY "Parents can view children submissions"
  ON public.submissions FOR SELECT
  USING (auth.is_parent_of(student_id));

-- =====================================================
-- GRADES POLICIES
-- =====================================================

-- Students can view their own grades
CREATE POLICY "Students can view own grades"
  ON public.grades FOR SELECT
  USING (student_id = auth.uid());

-- Parents can view their children's grades
CREATE POLICY "Parents can view children grades"
  ON public.grades FOR SELECT
  USING (auth.is_parent_of(student_id));

-- Teachers can view/create/update grades for their classes
CREATE POLICY "Teachers can manage grades"
  ON public.grades FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE id = grades.class_id AND teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE id = grades.class_id AND teacher_id = auth.uid()
    )
  );

-- Admins can view all grades
CREATE POLICY "Admins can view all grades"
  ON public.grades FOR SELECT
  USING (auth.is_admin());

-- =====================================================
-- ATTENDANCE POLICIES
-- =====================================================

-- Students can view their own attendance
CREATE POLICY "Students can view own attendance"
  ON public.attendance FOR SELECT
  USING (student_id = auth.uid());

-- Parents can view their children's attendance
CREATE POLICY "Parents can view children attendance"
  ON public.attendance FOR SELECT
  USING (auth.is_parent_of(student_id));

-- Teachers can manage attendance for their classes
CREATE POLICY "Teachers can manage class attendance"
  ON public.attendance FOR ALL
  USING (auth.teaches_class(class_id))
  WITH CHECK (auth.teaches_class(class_id));

-- Admins can view all attendance
CREATE POLICY "Admins can view all attendance"
  ON public.attendance FOR SELECT
  USING (auth.is_admin());

-- =====================================================
-- PAYMENTS POLICIES
-- =====================================================

-- Students can view their own payments
CREATE POLICY "Students can view own payments"
  ON public.payments FOR SELECT
  USING (student_id = auth.uid());

-- Parents can view their children's payments
CREATE POLICY "Parents can view children payments"
  ON public.payments FOR SELECT
  USING (auth.is_parent_of(student_id) OR parent_id = auth.uid());

-- Admins can manage all payments
CREATE POLICY "Admins can manage payments"
  ON public.payments FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

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

-- System can create notifications for any user
CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- MESSAGES POLICIES
-- =====================================================

-- Students can view messages in their classes
CREATE POLICY "Students can view class messages"
  ON public.messages FOR SELECT
  USING (auth.is_enrolled(class_id));

-- Teachers can view/create messages in their classes
CREATE POLICY "Teachers can manage class messages"
  ON public.messages FOR ALL
  USING (auth.teaches_class(class_id))
  WITH CHECK (auth.teaches_class(class_id));

-- Students can create messages in their classes
CREATE POLICY "Students can send class messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.is_enrolled(class_id) AND
    sender_id = auth.uid() AND
    is_announcement = false
  );

-- =====================================================
-- AUDIT LOGS POLICIES
-- =====================================================

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.is_admin());

-- System can create audit logs
CREATE POLICY "System can create audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

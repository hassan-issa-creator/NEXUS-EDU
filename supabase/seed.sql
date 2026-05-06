-- Supabase Storage Configuration & Seed Data
-- File: seed.sql

-- =====================================================
-- STORAGE BUCKETS CONFIGURATION
-- =====================================================

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('profile-images', 'profile-images', true),
  ('course-assets', 'course-assets', false),
  ('attachments', 'attachments', false),
  ('invoices', 'invoices', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (using DO block to avoid errors if they exist)
DO $$
BEGIN
    -- Profile Images Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view profile images') THEN
        CREATE POLICY "Anyone can view profile images" ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload their own profile image') THEN
        CREATE POLICY "Users can upload their own profile image" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own profile image') THEN
        CREATE POLICY "Users can update their own profile image" ON storage.objects FOR UPDATE USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;

    -- Course Assets Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers can upload course assets') THEN
        CREATE POLICY "Teachers can upload course assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'course-assets' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'teacher'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enrolled students can view course assets') THEN
        CREATE POLICY "Enrolled students can view course assets" ON storage.objects FOR SELECT USING (bucket_id = 'course-assets' AND (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'teacher') OR EXISTS (SELECT 1 FROM public.enrollments e WHERE e.student_id = auth.uid())));
    END IF;

    -- Attachments Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload attachments') THEN
        CREATE POLICY "Users can upload attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their attachments') THEN
        CREATE POLICY "Users can view their attachments" ON storage.objects FOR SELECT USING (bucket_id = 'attachments' AND (auth.uid()::text = (storage.foldername(name))[1] OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('teacher', 'admin'))));
    END IF;
END $$;

-- =====================================================
-- SEED DATA
-- =====================================================

-- Helper function to create auth user
CREATE OR REPLACE FUNCTION create_auth_user(
    uid UUID,
    email TEXT,
    password TEXT
) RETURNS UUID AS $$
DECLARE
  encrypted_pw TEXT;
BEGIN
  encrypted_pw := crypt(password, gen_salt('bf'));
  
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    uid,
    'authenticated',
    'authenticated',
    email,
    encrypted_pw,
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) ON CONFLICT (id) DO NOTHING;
  
  RETURN uid;
END;
$$ LANGUAGE plpgsql;

-- 1. Insert School
INSERT INTO public.schools (id, name, name_ar, city, country, email, phone)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'King Fahad International School', 'مدرسة الملك فهد الدولية', 'Riyadh', 'Saudi Arabia', 'info@kfis.edu.sa', '+966112345678')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Users (Auth + Public)

-- Admin (1)
SELECT create_auth_user('11111111-1111-1111-1111-111111111111', 'admin@kfis.edu.sa', 'password123');
INSERT INTO public.users (id, email, full_name, role, phone)
VALUES ('11111111-1111-1111-1111-111111111111', 'admin@kfis.edu.sa', 'Ahmed Al-Mansour', 'admin', '+966501234567')
ON CONFLICT (id) DO NOTHING;

-- Teachers (3)
SELECT create_auth_user('22222222-2222-2222-2222-222222222221', 'teacher1@kfis.edu.sa', 'password123');
SELECT create_auth_user('22222222-2222-2222-2222-222222222222', 'teacher2@kfis.edu.sa', 'password123');
SELECT create_auth_user('22222222-2222-2222-2222-222222222223', 'teacher3@kfis.edu.sa', 'password123');

INSERT INTO public.users (id, email, full_name, role, phone, bio)
VALUES 
  ('22222222-2222-2222-2222-222222222221', 'teacher1@kfis.edu.sa', 'Mohammed Al-Qahtani', 'teacher', '+966501234568', 'Mathematics Teacher - 15 years experience'),
  ('22222222-2222-2222-2222-222222222222', 'teacher2@kfis.edu.sa', 'Fatima Al-Dosari', 'teacher', '+966501234569', 'Science Teacher - 10 years experience'),
  ('22222222-2222-2222-2222-222222222223', 'teacher3@kfis.edu.sa', 'Khalid Al-Harbi', 'teacher', '+966501234560', 'English Teacher - 8 years experience')
ON CONFLICT (id) DO NOTHING;

-- Parents (5)
SELECT create_auth_user('44444444-4444-4444-4444-444444444441', 'parent1@example.com', 'password123');
SELECT create_auth_user('44444444-4444-4444-4444-444444444442', 'parent2@example.com', 'password123');
SELECT create_auth_user('44444444-4444-4444-4444-444444444443', 'parent3@example.com', 'password123');
SELECT create_auth_user('44444444-4444-4444-4444-444444444444', 'parent4@example.com', 'password123');
SELECT create_auth_user('44444444-4444-4444-4444-444444444445', 'parent5@example.com', 'password123');

INSERT INTO public.users (id, email, full_name, role, phone)
VALUES 
  ('44444444-4444-4444-4444-444444444441', 'parent1@example.com', 'Ali Ahmed', 'parent', '+966501234571'),
  ('44444444-4444-4444-4444-444444444442', 'parent2@example.com', 'Omar Khalid', 'parent', '+966501234572'),
  ('44444444-4444-4444-4444-444444444443', 'parent3@example.com', 'Saad Al-Faisal', 'parent', '+966501234573'),
  ('44444444-4444-4444-4444-444444444444', 'parent4@example.com', 'Hassan Al-Amri', 'parent', '+966501234574'),
  ('44444444-4444-4444-4444-444444444445', 'parent5@example.com', 'Ibrahim Al-Sayed', 'parent', '+966501234575')
ON CONFLICT (id) DO NOTHING;

-- Students (10)
SELECT create_auth_user('33333333-3333-3333-3333-333333333331', 'student1@kfis.edu.sa', 'password123');
SELECT create_auth_user('33333333-3333-3333-3333-333333333332', 'student2@kfis.edu.sa', 'password123');
SELECT create_auth_user('33333333-3333-3333-3333-333333333333', 'student3@kfis.edu.sa', 'password123');
SELECT create_auth_user('33333333-3333-3333-3333-333333333334', 'student4@kfis.edu.sa', 'password123');
SELECT create_auth_user('33333333-3333-3333-3333-333333333335', 'student5@kfis.edu.sa', 'password123');
SELECT create_auth_user('33333333-3333-3333-3333-333333333336', 'student6@kfis.edu.sa', 'password123');
SELECT create_auth_user('33333333-3333-3333-3333-333333333337', 'student7@kfis.edu.sa', 'password123');
SELECT create_auth_user('33333333-3333-3333-3333-333333333338', 'student8@kfis.edu.sa', 'password123');
SELECT create_auth_user('33333333-3333-3333-3333-333333333339', 'student9@kfis.edu.sa', 'password123');
SELECT create_auth_user('33333333-3333-3333-3333-333333333310', 'student10@kfis.edu.sa', 'password123');

INSERT INTO public.users (id, email, full_name, role, phone)
VALUES 
  ('33333333-3333-3333-3333-333333333331', 'student1@kfis.edu.sa', 'Ahmed Ali', 'student', '+966501234581'),
  ('33333333-3333-3333-3333-333333333332', 'student2@kfis.edu.sa', 'Fatima Omar', 'student', '+966501234582'),
  ('33333333-3333-3333-3333-333333333333', 'student3@kfis.edu.sa', 'Sara Khalid', 'student', '+966501234583'),
  ('33333333-3333-3333-3333-333333333334', 'student4@kfis.edu.sa', 'Abdullah Fahad', 'student', '+966501234584'),
  ('33333333-3333-3333-3333-333333333335', 'student5@kfis.edu.sa', 'Noura Saad', 'student', '+966501234585'),
  ('33333333-3333-3333-3333-333333333336', 'student6@kfis.edu.sa', 'Yousef Hassan', 'student', '+966501234586'),
  ('33333333-3333-3333-3333-333333333337', 'student7@kfis.edu.sa', 'Layla Ibrahim', 'student', '+966501234587'),
  ('33333333-3333-3333-3333-333333333338', 'student8@kfis.edu.sa', 'Mohammed Saleh', 'student', '+966501234588'),
  ('33333333-3333-3333-3333-333333333339', 'student9@kfis.edu.sa', 'Huda Abdullah', 'student', '+966501234589'),
  ('33333333-3333-3333-3333-333333333310', 'student10@kfis.edu.sa', 'Fahad Salman', 'student', '+966501234590')
ON CONFLICT (id) DO NOTHING;

-- 3. Parent-Student Relationships
INSERT INTO public.parent_students (parent_id, student_id, relationship, is_primary)
VALUES 
  ('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333331', 'father', true),
  ('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333332', 'father', true),
  ('44444444-4444-4444-4444-444444444442', '33333333-3333-3333-3333-333333333333', 'father', true),
  ('44444444-4444-4444-4444-444444444443', '33333333-3333-3333-3333-333333333334', 'father', true),
  ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333335', 'father', true),
  ('44444444-4444-4444-4444-444444444445', '33333333-3333-3333-3333-333333333336', 'father', true)
ON CONFLICT (parent_id, student_id) DO NOTHING;

-- 4. Subjects
INSERT INTO public.subjects (id, school_id, name, name_ar, code, color)
VALUES 
  ('55555555-5555-5555-5555-555555555551', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mathematics', 'الرياضيات', 'MATH101', '#3B82F6'),
  ('55555555-5555-5555-5555-555555555552', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Science', 'العلوم', 'SCI101', '#10B981'),
  ('55555555-5555-5555-5555-555555555553', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Arabic Language', 'اللغة العربية', 'ARAB101', '#F59E0B'),
  ('55555555-5555-5555-5555-555555555554', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'English Language', 'اللغة الإنجليزية', 'ENG101', '#EF4444'),
  ('55555555-5555-5555-5555-555555555555', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Islamic Studies', 'الدراسات الإسلامية', 'ISL101', '#8B5CF6')
ON CONFLICT (id) DO NOTHING;

-- 5. Classes
INSERT INTO public.classes (id, school_id, name, name_ar, academic_year, grade_level, teacher_id, capacity)
VALUES 
  ('66666666-6666-6666-6666-666666666661', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Grade 10 - A', 'الصف العاشر - أ', '2024-2025', 10, '22222222-2222-2222-2222-222222222221', 30),
  ('66666666-6666-6666-6666-666666666662', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Grade 10 - B', 'الصف العاشر - ب', '2024-2025', 10, '22222222-2222-2222-2222-222222222222', 30),
  ('66666666-6666-6666-6666-666666666663', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Grade 11 - A', 'الصف الحادي عشر - أ', '2024-2025', 11, '22222222-2222-2222-2222-222222222223', 30)
ON CONFLICT (id) DO NOTHING;

-- 6. Class Subjects
INSERT INTO public.class_subjects (class_id, subject_id, teacher_id)
VALUES 
  ('66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555551', '22222222-2222-2222-2222-222222222221'),
  ('66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555552', '22222222-2222-2222-2222-222222222222'),
  ('66666666-6666-6666-6666-666666666662', '55555555-5555-5555-5555-555555555553', '22222222-2222-2222-2222-222222222223')
ON CONFLICT (class_id, subject_id) DO NOTHING;

-- 7. Enrollments
INSERT INTO public.enrollments (student_id, class_id, status)
VALUES 
  ('33333333-3333-3333-3333-333333333331', '66666666-6666-6666-6666-666666666661', 'active'),
  ('33333333-3333-3333-3333-333333333332', '66666666-6666-6666-6666-666666666661', 'active'),
  ('33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666661', 'active'),
  ('33333333-3333-3333-3333-333333333334', '66666666-6666-6666-6666-666666666661', 'active'),
  ('33333333-3333-3333-3333-333333333335', '66666666-6666-6666-6666-666666666661', 'active'),
  ('33333333-3333-3333-3333-333333333336', '66666666-6666-6666-6666-666666666662', 'active'),
  ('33333333-3333-3333-3333-333333333337', '66666666-6666-6666-6666-666666666662', 'active'),
  ('33333333-3333-3333-3333-333333333338', '66666666-6666-6666-6666-666666666662', 'active'),
  ('33333333-3333-3333-3333-333333333339', '66666666-6666-6666-6666-666666666662', 'active'),
  ('33333333-3333-3333-3333-333333333310', '66666666-6666-6666-6666-666666666662', 'active')
ON CONFLICT (student_id, class_id) DO NOTHING;

-- 8. Assignments
INSERT INTO public.assignments (id, class_id, subject_id, teacher_id, title, description, due_date, total_points, status)
VALUES 
  ('77777777-7777-7777-7777-777777777771', '66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555551', '22222222-2222-2222-2222-222222222221', 'Algebra Quiz 1', 'Solve problems 1-20', (NOW() + INTERVAL '3 days')::timestamptz, 20, 'published'),
  ('77777777-7777-7777-7777-777777777772', '66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555552', '22222222-2222-2222-2222-222222222222', 'Physics Lab Report', 'Motion experiment', (NOW() + INTERVAL '7 days')::timestamptz, 50, 'published')
ON CONFLICT (id) DO NOTHING;

-- 9. Submissions & Grades
INSERT INTO public.submissions (assignment_id, student_id, status, grade, graded_by, submitted_at)
VALUES 
  ('77777777-7777-7777-7777-777777777771', '33333333-3333-3333-3333-333333333331', 'graded', 18, '22222222-2222-2222-2222-222222222221', NOW() - INTERVAL '1 day'),
  ('77777777-7777-7777-7777-777777777771', '33333333-3333-3333-3333-333333333332', 'graded', 19, '22222222-2222-2222-2222-222222222221', NOW() - INTERVAL '1 day')
ON CONFLICT (assignment_id, student_id) DO NOTHING;

INSERT INTO public.grades (student_id, class_id, subject_id, assignment_id, grade_value, max_points, graded_by)
VALUES 
  ('33333333-3333-3333-3333-333333333331', '66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555551', '77777777-7777-7777-7777-777777777771', 18, 20, '22222222-2222-2222-2222-222222222221'),
  ('33333333-3333-3333-3333-333333333332', '66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555551', '77777777-7777-7777-7777-777777777771', 19, 20, '22222222-2222-2222-2222-222222222221')
ON CONFLICT DO NOTHING;

-- 10. Attendance
INSERT INTO public.attendance (student_id, class_id, date, status, marked_by)
VALUES 
  ('33333333-3333-3333-3333-333333333331', '66666666-6666-6666-6666-666666666661', CURRENT_DATE, 'present', '22222222-2222-2222-2222-222222222221'),
  ('33333333-3333-3333-3333-333333333332', '66666666-6666-6666-6666-666666666661', 'present', 'present', '22222222-2222-2222-2222-222222222221'),
  ('33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666661', CURRENT_DATE, 'absent', '22222222-2222-2222-2222-222222222221')
ON CONFLICT (student_id, class_id, date) DO NOTHING;

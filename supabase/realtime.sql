-- Supabase Realtime Configuration
-- File: realtime.sql

-- Enable Realtime on specific tables

-- Messages - for in-class chat
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Attendance - for live attendance tracking
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;

-- Notifications - for instant notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Submissions - for real-time submission status
ALTER PUBLICATION supabase_realtime ADD TABLE submissions;

-- Optional: Grades (if you want parents to see grades update live)
-- ALTER PUBLICATION supabase_realtime ADD TABLE grades;

-- Create function to broadcast custom events
CREATE OR REPLACE FUNCTION notify_assignment_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'assignment_created',
    json_build_object(
      'assignment_id', NEW.id,
      'class_id', NEW.class_id,
      'teacher_id', NEW.teacher_id,
      'title', NEW.title,
      'due_date', NEW.due_date
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new assignments
CREATE TRIGGER on_assignment_created
  AFTER INSERT ON public.assignments
  FOR EACH ROW
  EXECUTE FUNCTION notify_assignment_created();

-- Create function to broadcast grade updates
CREATE OR REPLACE FUNCTION notify_grade_updated()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'grade_updated',
    json_build_object(
      'grade_id', NEW.id,
      'student_id', NEW.student_id,
      'assignment_id', NEW.assignment_id,
      'grade_value', NEW.grade_value,
      'percentage', NEW.percentage
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for grade updates
CREATE TRIGGER on_grade_updated
  AFTER INSERT OR UPDATE ON public.grades
  FOR EACH ROW
  EXECUTE FUNCTION notify_grade_updated();

COMMENT ON FUNCTION notify_assignment_created() IS 'Broadcast new assignment creation events';
COMMENT ON FUNCTION notify_grade_updated() IS 'Broadcast grade update events';

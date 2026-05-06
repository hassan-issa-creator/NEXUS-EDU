import '../entities/course_entity.dart';

/// Abstract Course Repository contract (Domain Layer)
abstract class CourseRepository {
  /// Get all courses for current user
  Future<List<CourseEntity>> getCourses();

  /// Get single course by ID
  Future<CourseEntity> getCourseById(String id);

  /// Get courses by teacher ID
  Future<List<CourseEntity>> getCoursesByTeacher(String teacherId);

  /// Enroll in a course
  Future<void> enrollCourse(String courseId);

  /// Get enrolled courses
  Future<List<CourseEntity>> getEnrolledCourses();
}

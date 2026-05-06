import '../entities/course_entity.dart';
import '../repositories/course_repository.dart';

/// Use Case: Get Courses
class GetCourses {
  final CourseRepository _repository;

  const GetCourses(this._repository);

  /// Get all courses
  Future<List<CourseEntity>> call() {
    return _repository.getCourses();
  }

  /// Get enrolled courses
  Future<List<CourseEntity>> enrolled() {
    return _repository.getEnrolledCourses();
  }

  /// Get single course
  Future<CourseEntity> byId(String id) {
    return _repository.getCourseById(id);
  }
}

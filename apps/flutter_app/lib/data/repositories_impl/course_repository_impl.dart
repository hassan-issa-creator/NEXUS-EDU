import 'package:dio/dio.dart';
import '../../core/constants/api_constants.dart';
import '../../core/errors/app_exceptions.dart';
import '../../domain/entities/course_entity.dart';
import '../../domain/repositories/course_repository.dart' as domain;
import '../../services/api_service.dart';
import '../models/course_model.dart';

/// Concrete implementation of CourseRepository
class CourseRepositoryImpl implements domain.CourseRepository {
  final Dio _dio = ApiService.instance;

  @override
  Future<List<CourseEntity>> getCourses() async {
    try {
      final response = await _dio.get(ApiConstants.subjects);
      final list = response.data as List;
      return list.map((json) => CourseModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw ApiException(message: e.message ?? 'حدث خطأ', statusCode: e.response?.statusCode);
    }
  }

  @override
  Future<CourseEntity> getCourseById(String id) async {
    try {
      final response = await _dio.get('${ApiConstants.subjects}/$id');
      return CourseModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException(message: e.message ?? 'حدث خطأ', statusCode: e.response?.statusCode);
    }
  }

  @override
  Future<List<CourseEntity>> getCoursesByTeacher(String teacherId) async {
    try {
      final response = await _dio.get(ApiConstants.subjects, queryParameters: {'teacher_id': teacherId});
      final list = response.data as List;
      return list.map((json) => CourseModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw ApiException(message: e.message ?? 'حدث خطأ', statusCode: e.response?.statusCode);
    }
  }

  @override
  Future<void> enrollCourse(String courseId) async {
    try {
      await _dio.post(ApiConstants.enrollments, data: {'course_id': courseId});
    } on DioException catch (e) {
      throw ApiException(message: e.message ?? 'حدث خطأ', statusCode: e.response?.statusCode);
    }
  }

  @override
  Future<List<CourseEntity>> getEnrolledCourses() async {
    try {
      final response = await _dio.get('${ApiConstants.enrollments}/my');
      final list = response.data as List;
      return list.map((json) => CourseModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw ApiException(message: e.message ?? 'حدث خطأ', statusCode: e.response?.statusCode);
    }
  }
}

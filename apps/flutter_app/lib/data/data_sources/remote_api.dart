import 'package:dio/dio.dart';
import '../../core/constants/api_constants.dart';
import '../../services/api_service.dart';

/// Remote data source — abstraction over Dio for API calls
/// Used by repository implementations
class RemoteApi {
  final Dio _dio = ApiService.instance;

  // ═══════════════════════════════════════════
  // GENERIC REQUESTS
  // ═══════════════════════════════════════════

  /// GET request
  Future<dynamic> get(String path, {Map<String, dynamic>? queryParams}) async {
    final response = await _dio.get(path, queryParameters: queryParams);
    return response.data;
  }

  /// POST request
  Future<dynamic> post(String path, {Map<String, dynamic>? data}) async {
    final response = await _dio.post(path, data: data);
    return response.data;
  }

  /// PUT request
  Future<dynamic> put(String path, {Map<String, dynamic>? data}) async {
    final response = await _dio.put(path, data: data);
    return response.data;
  }

  /// DELETE request
  Future<dynamic> delete(String path) async {
    final response = await _dio.delete(path);
    return response.data;
  }

  // ═══════════════════════════════════════════
  // SPECIFIC ENDPOINTS
  // ═══════════════════════════════════════════

  /// Fetch user profile
  Future<Map<String, dynamic>> fetchUserProfile() async {
    return await get(ApiConstants.userProfile);
  }

  /// Fetch courses/subjects
  Future<List<dynamic>> fetchCourses() async {
    return await get(ApiConstants.subjects);
  }

  /// Fetch leaderboard
  Future<List<dynamic>> fetchLeaderboard() async {
    return await get(ApiConstants.leaderboard);
  }

  /// Fetch notifications
  Future<List<dynamic>> fetchNotifications() async {
    return await get(ApiConstants.notifications);
  }

  /// Fetch AI recommendations
  Future<Map<String, dynamic>> fetchAiRecommendations() async {
    return await get(ApiConstants.aiRecommendations);
  }

  /// Send AI chat message
  Future<Map<String, dynamic>> sendAiMessage(String message) async {
    return await post(ApiConstants.aiChat, data: {'message': message});
  }
}

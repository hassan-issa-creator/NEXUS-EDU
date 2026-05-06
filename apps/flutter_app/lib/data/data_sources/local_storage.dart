import 'package:shared_preferences/shared_preferences.dart';

/// Local data source — caching layer for offline support
class LocalStorage {
  static const _cachedUserKey = 'cached_user';
  static const _cachedCoursesKey = 'cached_courses';
  static const _lastSyncKey = 'last_sync';

  // ═══════════════════════════════════════════
  // CACHE USER
  // ═══════════════════════════════════════════

  static Future<void> cacheUserJson(String userJson) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_cachedUserKey, userJson);
  }

  static Future<String?> getCachedUser() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_cachedUserKey);
  }

  // ═══════════════════════════════════════════
  // CACHE COURSES
  // ═══════════════════════════════════════════

  static Future<void> cacheCoursesJson(String coursesJson) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_cachedCoursesKey, coursesJson);
  }

  static Future<String?> getCachedCourses() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_cachedCoursesKey);
  }

  // ═══════════════════════════════════════════
  // SYNC MANAGEMENT
  // ═══════════════════════════════════════════

  static Future<void> setLastSync() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_lastSyncKey, DateTime.now().toIso8601String());
  }

  static Future<DateTime?> getLastSync() async {
    final prefs = await SharedPreferences.getInstance();
    final str = prefs.getString(_lastSyncKey);
    return str != null ? DateTime.tryParse(str) : null;
  }

  /// Check if cache is stale (older than duration)
  static Future<bool> isCacheStale(Duration maxAge) async {
    final lastSync = await getLastSync();
    if (lastSync == null) return true;
    return DateTime.now().difference(lastSync) > maxAge;
  }

  // ═══════════════════════════════════════════
  // CLEAR CACHE
  // ═══════════════════════════════════════════

  static Future<void> clearCache() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_cachedUserKey);
    await prefs.remove(_cachedCoursesKey);
    await prefs.remove(_lastSyncKey);
  }
}

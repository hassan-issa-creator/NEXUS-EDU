/// API Constants for Nexus EDU
class ApiConstants {
  ApiConstants._();

  // ═══════════════════════════════════════════
  // BASE URL
  // ═══════════════════════════════════════════
  // For Android emulator use 10.0.2.2 instead of localhost
  // For real device, use actual IP or deployed URL
  static const String baseUrl = 'http://10.0.2.2:3001/api';
  static const String productionUrl = 'https://your-api-domain.com/api';

  // ═══════════════════════════════════════════
  // AUTH ENDPOINTS
  // ═══════════════════════════════════════════
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String refreshToken = '/auth/refresh';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';

  // ═══════════════════════════════════════════
  // USER ENDPOINTS
  // ═══════════════════════════════════════════
  static const String userProfile = '/users/me';
  static const String updateProfile = '/users';
  static const String uploadAvatar = '/upload';

  // ═══════════════════════════════════════════
  // CLASS ENDPOINTS
  // ═══════════════════════════════════════════
  static const String classes = '/classes';

  // ═══════════════════════════════════════════
  // SUBJECT ENDPOINTS
  // ═══════════════════════════════════════════
  static const String subjects = '/subjects';

  // ═══════════════════════════════════════════
  // LESSON ENDPOINTS
  // ═══════════════════════════════════════════
  static const String lessons = '/lessons';

  // ═══════════════════════════════════════════
  // ASSIGNMENT ENDPOINTS
  // ═══════════════════════════════════════════
  static const String assignments = '/assignments';

  // ═══════════════════════════════════════════
  // GRADE ENDPOINTS
  // ═══════════════════════════════════════════
  static const String grades = '/grades';

  // ═══════════════════════════════════════════
  // ATTENDANCE ENDPOINTS
  // ═══════════════════════════════════════════
  static const String attendance = '/attendance';
  static const String qrAttendance = '/qr-attendance/scan';

  // ═══════════════════════════════════════════
  // CHAT ENDPOINTS
  // ═══════════════════════════════════════════
  static const String chat = '/chat';
  static const String chatMessages = '/chat/messages';

  // ═══════════════════════════════════════════
  // AI ENDPOINTS
  // ═══════════════════════════════════════════
  static const String aiChat = '/ai/chat';
  static const String aiRecommendations = '/ai/recommendations';

  // ═══════════════════════════════════════════
  // NOTIFICATION ENDPOINTS
  // ═══════════════════════════════════════════
  static const String notifications = '/notifications';
  static const String registerDevice = '/notifications/register-device';

  // ═══════════════════════════════════════════
  // PAYMENT ENDPOINTS
  // ═══════════════════════════════════════════
  static const String payment = '/payment';
  static const String subscribe = '/payment/subscribe';
  static const String paymentStatus = '/payment/status';

  // ═══════════════════════════════════════════
  // GAMIFICATION ENDPOINTS
  // ═══════════════════════════════════════════
  static const String leaderboard = '/gamification/leaderboard';
  static const String badges = '/gamification/badges';
  static const String studentStats = '/gamification/stats';

  // ═══════════════════════════════════════════
  // GAMES ENDPOINTS
  // ═══════════════════════════════════════════
  static const String games = '/games';

  // ═══════════════════════════════════════════
  // REPORTS ENDPOINTS
  // ═══════════════════════════════════════════
  static const String reports = '/reports';

  // ═══════════════════════════════════════════
  // MILLION ENDPOINTS
  // ═══════════════════════════════════════════
  static const String million = '/million';
  static const String millionProgress = '/million/progress';

  // ═══════════════════════════════════════════
  // ANALYTICS ENDPOINTS
  // ═══════════════════════════════════════════
  static const String analytics = '/analytics';

  // ═══════════════════════════════════════════
  // EXAM ENDPOINTS
  // ═══════════════════════════════════════════
  static const String exams = '/exams';

  // ═══════════════════════════════════════════
  // CONTENT ENDPOINTS
  // ═══════════════════════════════════════════
  static const String content = '/content';

  // ═══════════════════════════════════════════
  // ENROLLMENT ENDPOINTS
  // ═══════════════════════════════════════════
  static const String enrollments = '/enrollment';

  // ═══════════════════════════════════════════
  // ADMIN ENDPOINTS
  // ═══════════════════════════════════════════
  static const String admin = '/admin';
  static const String adminUsers = '/admin/users';
  static const String adminStats = '/admin/stats';

  // ═══════════════════════════════════════════
  // TIMEOUTS
  // ═══════════════════════════════════════════
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const Duration sendTimeout = Duration(seconds: 30);
}

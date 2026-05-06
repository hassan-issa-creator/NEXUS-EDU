import 'package:intl/intl.dart';

/// General helper utilities
class Helpers {
  Helpers._();

  // ═══════════════════════════════════════════
  // DATE FORMATTING
  // ═══════════════════════════════════════════

  /// Format date to Arabic readable string (١٢ مارس ٢٠٢٦)
  static String formatDateAr(DateTime date) {
    return DateFormat('d MMMM yyyy', 'ar').format(date);
  }

  /// Format date to short (١٢/٣/٢٠٢٦)
  static String formatDateShort(DateTime date) {
    return DateFormat('d/M/yyyy').format(date);
  }

  /// Format time (٨:٣٠ ص)
  static String formatTimeAr(DateTime date) {
    return DateFormat('h:mm a', 'ar').format(date);
  }

  /// Relative time (منذ ٣ ساعات)
  static String timeAgo(DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 1) return 'الآن';
    if (diff.inMinutes < 60) return 'منذ ${diff.inMinutes} دقيقة';
    if (diff.inHours < 24) return 'منذ ${diff.inHours} ساعة';
    if (diff.inDays < 7) return 'منذ ${diff.inDays} يوم';
    if (diff.inDays < 30) return 'منذ ${diff.inDays ~/ 7} أسبوع';
    return formatDateAr(date);
  }

  // ═══════════════════════════════════════════
  // ROLE HELPERS
  // ═══════════════════════════════════════════

  /// Get Arabic name for role
  static String roleNameAr(String role) {
    switch (role.toLowerCase()) {
      case 'student':
        return 'طالب';
      case 'teacher':
        return 'معلم';
      case 'parent':
        return 'ولي أمر';
      case 'admin':
        return 'مدير';
      case 'administrator':
        return 'مشرف';
      default:
        return 'مستخدم';
    }
  }

  /// Get emoji for role
  static String roleEmoji(String role) {
    switch (role.toLowerCase()) {
      case 'student':
        return '🎓';
      case 'teacher':
        return '👨‍🏫';
      case 'parent':
        return '👨‍👧';
      case 'admin':
      case 'administrator':
        return '🔧';
      default:
        return '👤';
    }
  }

  /// Get dashboard route for role
  static String dashboardRoute(String role) {
    switch (role.toLowerCase()) {
      case 'student':
        return '/student';
      case 'teacher':
        return '/teacher';
      case 'parent':
        return '/parent';
      case 'admin':
      case 'administrator':
        return '/admin';
      default:
        return '/student';
    }
  }

  // ═══════════════════════════════════════════
  // STRING HELPERS
  // ═══════════════════════════════════════════

  /// Truncate string with ellipsis
  static String truncate(String text, int maxLength) {
    if (text.length <= maxLength) return text;
    return '${text.substring(0, maxLength)}...';
  }

  /// Get initials from name
  static String getInitials(String name) {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    return parts[0][0].toUpperCase();
  }

  // ═══════════════════════════════════════════
  // NUMBER HELPERS
  // ═══════════════════════════════════════════

  /// Format large numbers (1234 → 1.2K)
  static String formatCompact(int number) {
    if (number >= 1000000) return '${(number / 1000000).toStringAsFixed(1)}M';
    if (number >= 1000) return '${(number / 1000).toStringAsFixed(1)}K';
    return number.toString();
  }

  /// Grade letter from percentage
  static String gradeLetter(double percentage) {
    if (percentage >= 95) return 'A+';
    if (percentage >= 90) return 'A';
    if (percentage >= 85) return 'A-';
    if (percentage >= 80) return 'B+';
    if (percentage >= 75) return 'B';
    if (percentage >= 70) return 'B-';
    if (percentage >= 65) return 'C+';
    if (percentage >= 60) return 'C';
    if (percentage >= 55) return 'D+';
    if (percentage >= 50) return 'D';
    return 'F';
  }
}

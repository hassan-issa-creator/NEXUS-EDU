/// Core application exceptions
/// Separated from api_client for Clean Architecture

class AppException implements Exception {
  final String message;
  final int? code;

  const AppException({required this.message, this.code});

  @override
  String toString() => 'AppException: $message (code: $code)';
}

/// API / Network exceptions
class ApiException extends AppException {
  final int? statusCode;
  final dynamic data;

  const ApiException({
    required super.message,
    this.statusCode,
    this.data,
    super.code,
  });

  @override
  String toString() => 'ApiException: $message (status: $statusCode)';
}

/// Cache / Local storage exceptions
class CacheException extends AppException {
  const CacheException({required super.message, super.code});
}

/// Network connectivity exceptions
class NetworkException extends AppException {
  const NetworkException({
    super.message = 'لا يوجد اتصال بالإنترنت. تحقق من اتصالك وحاول مرة أخرى.',
    super.code,
  });
}

/// Authentication exceptions
class AuthException extends AppException {
  const AuthException({
    super.message = 'غير مصرح. الرجاء تسجيل الدخول مرة أخرى.',
    super.code,
  });
}

/// Validation exceptions
class ValidationException extends AppException {
  final Map<String, String>? fieldErrors;

  const ValidationException({
    required super.message,
    this.fieldErrors,
    super.code,
  });
}

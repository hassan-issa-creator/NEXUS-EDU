import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../data/models/user_model.dart';
import '../../../services/storage_service.dart';

/// Auth state
enum AuthStatus { initial, loading, authenticated, unauthenticated, error }

class AuthState {
  final AuthStatus status;
  final UserModel? user;
  final String? errorMessage;

  const AuthState({
    this.status = AuthStatus.initial,
    this.user,
    this.errorMessage,
  });

  AuthState copyWith({
    AuthStatus? status,
    UserModel? user,
    String? errorMessage,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      errorMessage: errorMessage,
    );
  }
}

/// Auth state notifier — uses StorageService from Services Layer
class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthState()) {
    _checkAuthStatus();
  }

  /// Check initial auth status
  Future<void> _checkAuthStatus() async {
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  /// Login — demo mode (no backend needed)
  Future<String?> login(String email, String password) async {
    state = state.copyWith(status: AuthStatus.loading);

    try {
      // Determine role from email
      String role = 'student';
      if (email.toLowerCase().contains('admin.staff')) {
        role = 'administrator';
      } else if (email.toLowerCase().contains('admin')) {
        role = 'admin';
      } else if (email.toLowerCase().contains('teacher')) {
        role = 'teacher';
      } else if (email.toLowerCase().contains('parent')) {
        role = 'parent';
      }

      final user = UserModel(
        id: 'demo-user-${DateTime.now().millisecondsSinceEpoch}',
        email: email,
        name: _getNameForRole(role),
        role: role,
      );

      // Save to StorageService
      await StorageService.saveUserId(user.id);
      await StorageService.saveUserRole(user.role);
      await StorageService.saveAccessToken('demo-token');
      await StorageService.setDemoMode(true);

      // Small delay for UX feel
      await Future.delayed(const Duration(milliseconds: 500));

      state = AuthState(
        status: AuthStatus.authenticated,
        user: user,
      );
      return user.role;
    } catch (e) {
      state = AuthState(
        status: AuthStatus.error,
        errorMessage: 'حدث خطأ. حاول مرة أخرى.',
      );
      return null;
    }
  }

  String _getNameForRole(String role) {
    switch (role) {
      case 'teacher':
        return 'أ. محمد العمري';
      case 'parent':
        return 'عبدالله السعيد';
      case 'admin':
      case 'administrator':
        return 'مدير النظام';
      default:
        return 'أحمد محمد';
    }
  }

  /// Register (demo mode)
  Future<bool> register({
    required String name,
    required String email,
    required String password,
    required String role,
  }) async {
    state = state.copyWith(status: AuthStatus.loading);
    try {
      await Future.delayed(const Duration(milliseconds: 500));
      state = const AuthState(status: AuthStatus.unauthenticated);
      return true;
    } catch (e) {
      state = AuthState(status: AuthStatus.error, errorMessage: 'حدث خطأ في التسجيل');
      return false;
    }
  }

  /// Logout
  Future<void> logout() async {
    await StorageService.clearAll();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }
}

/// Providers
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});

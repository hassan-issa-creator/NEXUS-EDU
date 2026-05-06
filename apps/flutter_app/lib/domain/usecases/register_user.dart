import '../entities/user_entity.dart';
import '../repositories/auth_repository.dart';

/// Use Case: Register User
class RegisterUser {
  final AuthRepository _repository;

  const RegisterUser(this._repository);

  /// Execute registration
  Future<UserEntity> call({
    required String name,
    required String email,
    required String password,
    required String role,
  }) {
    return _repository.register(
      name: name,
      email: email,
      password: password,
      role: role,
    );
  }
}

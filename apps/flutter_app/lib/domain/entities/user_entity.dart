import 'package:equatable/equatable.dart';

/// Pure domain entity for User — no JSON, no framework dependency
class UserEntity extends Equatable {
  final String id;
  final String email;
  final String name;
  final String role;
  final String? avatarUrl;
  final DateTime? createdAt;

  const UserEntity({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    this.avatarUrl,
    this.createdAt,
  });

  /// Role check helpers
  bool get isStudent => role == 'student';
  bool get isTeacher => role == 'teacher';
  bool get isParent => role == 'parent';
  bool get isAdmin => role == 'admin';
  bool get isAdministrator => role == 'administrator';

  /// Get first name
  String get firstName => name.split(' ').first;

  @override
  List<Object?> get props => [id, email, name, role, avatarUrl, createdAt];
}

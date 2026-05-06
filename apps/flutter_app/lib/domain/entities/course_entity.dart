import 'package:equatable/equatable.dart';

/// Pure domain entity for Course/Subject
class CourseEntity extends Equatable {
  final String id;
  final String name;
  final String? description;
  final String? teacherName;
  final String? teacherId;
  final int progress;
  final double? grade;
  final String? gradeLetter;
  final String? imageUrl;
  final DateTime? startDate;
  final DateTime? endDate;

  const CourseEntity({
    required this.id,
    required this.name,
    this.description,
    this.teacherName,
    this.teacherId,
    this.progress = 0,
    this.grade,
    this.gradeLetter,
    this.imageUrl,
    this.startDate,
    this.endDate,
  });

  @override
  List<Object?> get props => [id, name, teacherId, progress, grade];
}

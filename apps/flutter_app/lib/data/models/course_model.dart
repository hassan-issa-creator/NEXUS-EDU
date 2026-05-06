import '../../domain/entities/course_entity.dart';

/// Data layer Course Model — extends domain entity, adds JSON
class CourseModel extends CourseEntity {
  const CourseModel({
    required super.id,
    required super.name,
    super.description,
    super.teacherName,
    super.teacherId,
    super.progress,
    super.grade,
    super.gradeLetter,
    super.imageUrl,
    super.startDate,
    super.endDate,
  });

  factory CourseModel.fromJson(Map<String, dynamic> json) {
    return CourseModel(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      teacherName: json['teacher_name'] ?? json['teacherName'],
      teacherId: json['teacher_id']?.toString() ?? json['teacherId']?.toString(),
      progress: json['progress'] ?? 0,
      grade: (json['grade'] as num?)?.toDouble(),
      gradeLetter: json['grade_letter'] ?? json['gradeLetter'],
      imageUrl: json['image_url'] ?? json['imageUrl'],
      startDate: json['start_date'] != null ? DateTime.tryParse(json['start_date']) : null,
      endDate: json['end_date'] != null ? DateTime.tryParse(json['end_date']) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'teacher_name': teacherName,
        'teacher_id': teacherId,
        'progress': progress,
        'grade': grade,
        'grade_letter': gradeLetter,
        'image_url': imageUrl,
      };
}

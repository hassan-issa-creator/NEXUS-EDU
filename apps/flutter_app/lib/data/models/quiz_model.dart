import '../../domain/entities/quiz_entity.dart';

/// Data layer Quiz Model — extends domain entity, adds JSON
class QuizModel extends QuizEntity {
  const QuizModel({
    required super.id,
    required super.title,
    super.description,
    required super.courseId,
    super.courseName,
    super.totalQuestions,
    super.correctAnswers,
    super.score,
    super.timeLimit,
    super.timeTaken,
    super.status,
    super.startDate,
    super.endDate,
  });

  factory QuizModel.fromJson(Map<String, dynamic> json) {
    return QuizModel(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      courseId: json['course_id']?.toString() ?? json['courseId']?.toString() ?? '',
      courseName: json['course_name'] ?? json['courseName'],
      totalQuestions: json['total_questions'] ?? json['totalQuestions'] ?? 0,
      correctAnswers: json['correct_answers'] ?? json['correctAnswers'],
      score: (json['score'] as num?)?.toDouble(),
      timeLimit: json['time_limit'] != null ? Duration(minutes: json['time_limit']) : null,
      timeTaken: json['time_taken'] != null ? Duration(seconds: json['time_taken']) : null,
      status: _parseStatus(json['status']),
      startDate: json['start_date'] != null ? DateTime.tryParse(json['start_date']) : null,
      endDate: json['end_date'] != null ? DateTime.tryParse(json['end_date']) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'course_id': courseId,
        'total_questions': totalQuestions,
        'correct_answers': correctAnswers,
        'score': score,
        'time_limit': timeLimit?.inMinutes,
        'time_taken': timeTaken?.inSeconds,
        'status': status.name,
      };

  static QuizStatus _parseStatus(String? status) {
    switch (status) {
      case 'in_progress':
        return QuizStatus.inProgress;
      case 'completed':
        return QuizStatus.completed;
      case 'missed':
        return QuizStatus.missed;
      default:
        return QuizStatus.upcoming;
    }
  }
}

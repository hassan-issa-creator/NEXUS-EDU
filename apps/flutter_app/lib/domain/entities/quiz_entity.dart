import 'package:equatable/equatable.dart';

/// Pure domain entity for Quiz/Exam
class QuizEntity extends Equatable {
  final String id;
  final String title;
  final String? description;
  final String courseId;
  final String? courseName;
  final int totalQuestions;
  final int? correctAnswers;
  final double? score;
  final Duration? timeLimit;
  final Duration? timeTaken;
  final QuizStatus status;
  final DateTime? startDate;
  final DateTime? endDate;

  const QuizEntity({
    required this.id,
    required this.title,
    this.description,
    required this.courseId,
    this.courseName,
    this.totalQuestions = 0,
    this.correctAnswers,
    this.score,
    this.timeLimit,
    this.timeTaken,
    this.status = QuizStatus.upcoming,
    this.startDate,
    this.endDate,
  });

  bool get isCompleted => status == QuizStatus.completed;
  bool get isPassed => (score ?? 0) >= 60;

  @override
  List<Object?> get props => [id, title, courseId, score, status];
}

enum QuizStatus { upcoming, inProgress, completed, missed }

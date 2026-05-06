import { query } from '../../config/database';
import {
  Exam,
  ExamQuestion,
  ExamSubmission,
  ExamAnswer,
  CreateExamRequest,
  UpdateExamRequest,
  CreateQuestionRequest,
  SubmitAnswerRequest,
  ExamError,
  ExamErrorCodes,
  StartExamResponse,
  ExamResultsResponse,
  ExamStatsResponse,
  QuestionType,
  ExamSubmissionStatus,
} from '../../types/exam.types';

/**
 * Exam Service
 * Business logic for exam management system
 */
export class ExamService {
  /**
   * Create a new exam (Teacher only)
   */
  async createExam(teacherId: string, data: CreateExamRequest): Promise<Exam> {
    const result = await query(
      `INSERT INTO exams (
                title, description, instructions, subject_id, class_id, 
                created_by, exam_type, duration_minutes, start_time, end_time,
                total_points, passing_score, settings
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *`,
      [
        data.title,
        data.description,
        data.instructions,
        data.subjectId,
        data.classId,
        teacherId,
        data.examType,
        data.durationMinutes,
        data.startTime,
        data.endTime,
        data.totalPoints,
        data.passingScore,
        JSON.stringify(data.settings || {}),
      ],
    );

    return this.mapExamFromDb(result.rows[0]);
  }

  /**
   * Get exam by ID
   */
  async getExam(
    examId: string,
    userId: string,
    userRole: string,
  ): Promise<Exam> {
    const result = await query(`SELECT * FROM exams WHERE id = $1`, [examId]);

    if (result.rowCount === 0) {
      throw new ExamError('Exam not found', ExamErrorCodes.EXAM_NOT_FOUND, 404);
    }

    const exam = this.mapExamFromDb(result.rows[0]);

    // Check permissions
    if (
      userRole === 'student' &&
      (!exam.isPublished || exam.status === 'draft')
    ) {
      throw new ExamError(
        'Exam not available',
        ExamErrorCodes.EXAM_NOT_PUBLISHED,
        403,
      );
    }

    return exam;
  }

  /**
   * List exams (with filters)
   */
  async listExams(filters: {
    classId?: string;
    subjectId?: string;
    userId?: string;
    userRole?: string;
  }): Promise<Exam[]> {
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (filters.classId) {
      params.push(filters.classId);
      whereClause += ` AND class_id = $${params.length}`;
    }

    if (filters.subjectId) {
      params.push(filters.subjectId);
      whereClause += ` AND subject_id = $${params.length}`;
    }

    if (filters.userRole === 'teacher' && filters.userId) {
      params.push(filters.userId);
      whereClause += ` AND created_by = $${params.length}`;
    } else if (filters.userRole === 'student') {
      whereClause += ` AND is_published = true`;
    }

    const result = await query(
      `SELECT * FROM exams ${whereClause} ORDER BY created_at DESC`,
      params,
    );

    return result.rows.map((row) => this.mapExamFromDb(row));
  }

  /**
   * Update exam (Teacher only)
   */
  async updateExam(
    examId: string,
    teacherId: string,
    data: UpdateExamRequest,
  ): Promise<Exam> {
    // Verify ownership
    const exam = await this.getExam(examId, teacherId, 'teacher');
    if (exam.createdBy !== teacherId) {
      throw new ExamError('Unauthorized', ExamErrorCodes.UNAUTHORIZED, 403);
    }

    // Check if students have already submitted
    if (data.isPublished === false) {
      const submissions = await query(
        `SELECT COUNT(*) FROM exam_submissions WHERE exam_id = $1 AND status != 'not_started'`,
        [examId],
      );
      if (parseInt(submissions.rows[0].count) > 0) {
        throw new ExamError(
          'Cannot unpublish exam with submissions',
          ExamErrorCodes.INVALID_ANSWER,
          400,
        );
      }
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        const snakeKey = this.camelToSnake(key);
        fields.push(`${snakeKey} = $${paramIndex}`);
        values.push(typeof value === 'object' ? JSON.stringify(value) : value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return exam;
    }

    values.push(examId);
    const result = await query(
      `UPDATE exams SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values,
    );

    return this.mapExamFromDb(result.rows[0]);
  }

  /**
   * Delete exam (Teacher only)
   */
  async deleteExam(examId: string, teacherId: string): Promise<void> {
    await query(`DELETE FROM exams WHERE id = $1 AND created_by = $2`, [
      examId,
      teacherId,
    ]);
  }

  /**
   * Add question to exam
   */
  async addQuestion(
    examId: string,
    data: CreateQuestionRequest,
  ): Promise<ExamQuestion> {
    const result = await query(
      `INSERT INTO exam_questions (
                exam_id, question_text, question_type, options, correct_answer,
                points, explanation, attachment_urls, order_index
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *`,
      [
        examId,
        data.questionText,
        data.questionType,
        JSON.stringify(data.options || []),
        data.correctAnswer,
        data.points,
        data.explanation,
        data.attachmentUrls,
        data.orderIndex,
      ],
    );

    return this.mapQuestionFromDb(result.rows[0]);
  }

  /**
   * Get exam questions (hide correct answers for students)
   */
  async getExamQuestions(
    examId: string,
    userRole: string,
  ): Promise<ExamQuestion[]> {
    const result = await query(
      `SELECT * FROM exam_questions WHERE exam_id = $1 ORDER BY order_index`,
      [examId],
    );

    const questions = result.rows.map((row) => this.mapQuestionFromDb(row));

    // Hide correct answers for students
    if (userRole === 'student') {
      return questions.map((q) => ({
        ...q,
        correctAnswer: undefined,
        options: q.options?.map((opt) => ({ ...opt, isCorrect: false })),
      }));
    }

    return questions;
  }

  /**
   * Start exam (Student)
   */
  async startExam(
    examId: string,
    studentId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<StartExamResponse> {
    // Verify exam exists and is accessible
    const exam = await this.getExam(examId, studentId, 'student');

    // Check time window
    const now = new Date();
    if (exam.startTime && new Date(exam.startTime) > now) {
      throw new ExamError(
        'Exam has not started yet',
        ExamErrorCodes.EXAM_NOT_STARTED,
        400,
      );
    }
    if (exam.endTime && new Date(exam.endTime) < now) {
      throw new ExamError('Exam has ended', ExamErrorCodes.EXAM_ENDED, 400);
    }

    // Check if already submitted
    const existing = await query(
      `SELECT * FROM exam_submissions WHERE exam_id = $1 AND student_id = $2`,
      [examId, studentId],
    );

    if (
      (existing.rowCount ?? 0) > 0 &&
      existing.rows[0].status !== 'not_started'
    ) {
      throw new ExamError(
        'Already submitted',
        ExamErrorCodes.ALREADY_SUBMITTED,
        400,
      );
    }

    // Create or update submission
    const submissionResult = await query(
      `INSERT INTO exam_submissions (exam_id, student_id, status, ip_address, user_agent, max_score)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (exam_id, student_id) 
            DO UPDATE SET started_at = NOW(), status = 'in_progress'
            RETURNING *`,
      [
        examId,
        studentId,
        'in_progress',
        ipAddress,
        userAgent,
        exam.totalPoints,
      ],
    );

    const submission = this.mapSubmissionFromDb(submissionResult.rows[0]);
    const questions = await this.getExamQuestions(examId, 'student');

    // Calculate time remaining
    const timeRemaining = exam.durationMinutes * 60; // in seconds

    return {
      submission,
      questions,
      timeRemaining,
    };
  }

  /**
   * Submit answer to question
   */
  async submitAnswer(
    submissionId: string,
    data: SubmitAnswerRequest,
  ): Promise<ExamAnswer> {
    // Get submission
    const submission = await query(
      `SELECT * FROM exam_submissions WHERE id = $1`,
      [submissionId],
    );

    if (submission.rowCount === 0) {
      throw new ExamError(
        'Submission not found',
        ExamErrorCodes.EXAM_NOT_FOUND,
        404,
      );
    }

    if (submission.rows[0].status === 'submitted') {
      throw new ExamError(
        'Exam already submitted',
        ExamErrorCodes.ALREADY_SUBMITTED,
        400,
      );
    }

    // Insert or update answer
    const result = await query(
      `INSERT INTO exam_answers (submission_id, question_id, answer_value, selected_option_index, time_spent_seconds)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (submission_id, question_id)
            DO UPDATE SET answer_value = $3, selected_option_index = $4, time_spent_seconds = $5, answered_at = NOW()
            RETURNING *`,
      [
        submissionId,
        data.questionId,
        data.answerValue,
        data.selectedOptionIndex,
        data.timeSpentSeconds,
      ],
    );

    const answer = this.mapAnswerFromDb(result.rows[0]);

    // Auto-grade if MCQ/TF
    await this.autoGradeAnswer(answer.id);

    return answer;
  }

  /**
   * Finish exam (Student)
   */
  async finishExam(submissionId: string): Promise<ExamSubmission> {
    // Calculate scores
    await query(`SELECT calculate_submission_score($1)`, [submissionId]);

    // Update submission status
    const result = await query(
      `UPDATE exam_submissions 
            SET status = 'submitted', submitted_at = NOW(),
                time_taken_minutes = EXTRACT(EPOCH FROM (NOW() - started_at)) / 60
            WHERE id = $1
            RETURNING *`,
      [submissionId],
    );

    return this.mapSubmissionFromDb(result.rows[0]);
  }

  /**
   * Auto-grade answer (for MCQ/TF)
   */
  private async autoGradeAnswer(answerId: string): Promise<void> {
    await query(`SELECT auto_grade_answer($1)`, [answerId]);
  }

  /**
   * Get exam results (Student)
   */
  async getResults(
    examId: string,
    studentId: string,
  ): Promise<ExamResultsResponse> {
    const exam = await this.getExam(examId, studentId, 'student');

    const submissionResult = await query(
      `SELECT * FROM exam_submissions WHERE exam_id = $1 AND student_id = $2`,
      [examId, studentId],
    );

    if (submissionResult.rowCount === 0) {
      throw new ExamError(
        'No submission found',
        ExamErrorCodes.EXAM_NOT_FOUND,
        404,
      );
    }

    const submission = this.mapSubmissionFromDb(submissionResult.rows[0]);

    // Get answers
    const answersResult = await query(
      `SELECT * FROM exam_answers WHERE submission_id = $1`,
      [submission.id],
    );
    const answers = answersResult.rows.map((row) => this.mapAnswerFromDb(row));

    // Get questions
    const questions = await this.getExamQuestions(examId, 'teacher');

    const canViewCorrectAnswers = exam.settings.showCorrectAnswers || false;

    return {
      submission,
      answers,
      questions: canViewCorrectAnswers
        ? questions
        : questions.map((q) => ({
            ...q,
            correctAnswer: undefined,
            options: q.options?.map((opt) => ({ ...opt, isCorrect: false })),
          })),
      canViewCorrectAnswers,
    };
  }

  /**
   * Get exam statistics (Teacher)
   */
  async getExamStats(examId: string): Promise<ExamStatsResponse> {
    const exam = await this.getExam(examId, '', 'teacher');

    const statsResult = await query(
      `SELECT 
                COUNT(*) as total,
                AVG(percentage) as avg_score,
                MAX(percentage) as max_score,
                MIN(percentage) as min_score,
                SUM(CASE WHEN percentage >= $2 THEN 1 ELSE 0 END)::float / NULLIF(COUNT(*), 0) * 100 as pass_rate
            FROM exam_submissions 
            WHERE exam_id = $1 AND status = 'graded'`,
      [examId, exam.passingScore || 60],
    );

    const stats = statsResult.rows[0];

    return {
      exam,
      totalSubmissions: parseInt(stats.total),
      averageScore: parseFloat(stats.avg_score) || 0,
      highestScore: parseFloat(stats.max_score) || 0,
      lowestScore: parseFloat(stats.min_score) || 0,
      passRate: parseFloat(stats.pass_rate) || 0,
      submissionsByStatus: {
        not_started: 0,
        in_progress: 0,
        submitted: 0,
        graded: 0,
        late: 0,
      },
    };
  }

  // Helper functions
  private mapExamFromDb(row: any): Exam {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      instructions: row.instructions,
      subjectId: row.subject_id,
      classId: row.class_id,
      createdBy: row.created_by,
      examType: row.exam_type,
      status: row.status,
      durationMinutes: row.duration_minutes,
      startTime: row.start_time,
      endTime: row.end_time,
      totalPoints: parseFloat(row.total_points),
      passingScore: row.passing_score
        ? parseFloat(row.passing_score)
        : undefined,
      settings:
        typeof row.settings === 'string'
          ? JSON.parse(row.settings)
          : row.settings,
      isPublished: row.is_published,
      publishedAt: row.published_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapQuestionFromDb(row: any): ExamQuestion {
    return {
      id: row.id,
      examId: row.exam_id,
      questionText: row.question_text,
      questionType: row.question_type,
      options:
        typeof row.options === 'string' ? JSON.parse(row.options) : row.options,
      correctAnswer: row.correct_answer,
      points: parseFloat(row.points),
      explanation: row.explanation,
      attachmentUrls: row.attachment_urls,
      orderIndex: row.order_index,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapSubmissionFromDb(row: any): ExamSubmission {
    return {
      id: row.id,
      examId: row.exam_id,
      studentId: row.student_id,
      startedAt: row.started_at,
      submittedAt: row.submitted_at,
      timeTakenMinutes: row.time_taken_minutes,
      status: row.status,
      totalScore: parseFloat(row.total_score || 0),
      maxScore: parseFloat(row.max_score || 0),
      percentage: parseFloat(row.percentage || 0),
      gradeLetter: row.grade_letter,
      overallFeedback: row.overall_feedback,
      gradedBy: row.graded_by,
      gradedAt: row.graded_at,
      tabSwitches: row.tab_switches || 0,
      copyAttempts: row.copy_attempts || 0,
      pasteAttempts: row.paste_attempts || 0,
      fullscreenExits: row.fullscreen_exits || 0,
      suspiciousActivity:
        typeof row.suspicious_activity === 'string'
          ? JSON.parse(row.suspicious_activity)
          : row.suspicious_activity || [],
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapAnswerFromDb(row: any): ExamAnswer {
    return {
      id: row.id,
      submissionId: row.submission_id,
      questionId: row.question_id,
      answerValue: row.answer_value,
      selectedOptionIndex: row.selected_option_index,
      isCorrect: row.is_correct,
      pointsAwarded: parseFloat(row.points_awarded || 0),
      feedback: row.feedback,
      answeredAt: row.answered_at,
      timeSpentSeconds: row.time_spent_seconds,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}

export const examService = new ExamService();

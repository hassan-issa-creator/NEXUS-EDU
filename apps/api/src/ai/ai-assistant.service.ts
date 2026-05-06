import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface QuestionSuggestion {
  question: string;
  options?: string[];
  correctAnswer?: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
  explanation?: string;
}

export interface ErrorPattern {
  topic: string;
  errorCount: number;
  commonMistakes: string[];
  studentIds: string[];
  suggestedAction: string;
}

export interface PerformancePrediction {
  studentId: string;
  predictedGrade: number;
  confidence: number;
  riskFactors: string[];
  recommendations: string[];
}

export interface LessonSummary {
  title: string;
  keyPoints: string[];
  concepts: string[];
  practiceQuestions: QuestionSuggestion[];
}

@Injectable()
export class AIAssistantService {
  private readonly logger = new Logger(AIAssistantService.name);

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Generate question suggestions based on topic and difficulty
   */
  async suggestQuestions(
    subjectId: string,
    topic: string,
    count: number = 5,
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD',
  ): Promise<QuestionSuggestion[]> {
    // Get existing questions for context
    const existingQuestions = await this.prisma.assignment.findMany({
      where: { subjectId },
      select: { title: true, description: true },
      take: 10,
    });

    // Question templates based on topic and difficulty
    const questionTemplates = this.getQuestionTemplates(
      topic,
      difficulty || 'MEDIUM',
    );

    // Generate suggestions (in production, this would use an LLM)
    const suggestions: QuestionSuggestion[] = questionTemplates
      .slice(0, count)
      .map((template, idx) => ({
        question: template.question,
        options: template.options,
        correctAnswer: template.correctAnswer,
        difficulty: difficulty || 'MEDIUM',
        topic,
        explanation: template.explanation,
      }));

    this.logger.log(
      `Generated ${suggestions.length} question suggestions for ${topic}`,
    );
    return suggestions;
  }

  /**
   * Analyze common errors across students
   */
  async analyzeErrors(classId?: string): Promise<ErrorPattern[]> {
    // Get all grades with low scores
    const lowGrades = await this.prisma.grade.findMany({
      where: {
        grade: { lt: 60 },
      },
      include: {
        subject: true,
        student: { select: { id: true, name: true } },
      },
    });

    // Group errors by subject/topic
    const errorsBySubject = new Map<
      string,
      {
        count: number;
        students: Set<string>;
        topics: Set<string>;
      }
    >();

    for (const grade of lowGrades) {
      const key = grade.subject?.name || 'Unknown';
      const existing = errorsBySubject.get(key) || {
        count: 0,
        students: new Set<string>(),
        topics: new Set<string>(),
      };

      existing.count++;
      existing.students.add(grade.studentId);
      const subjectName = grade.subject?.name || 'Unknown';
      existing.topics.add(subjectName);

      errorsBySubject.set(key, existing);
    }

    // Convert to patterns
    const patterns: ErrorPattern[] = Array.from(errorsBySubject.entries()).map(
      ([topic, data]) => ({
        topic,
        errorCount: data.count,
        commonMistakes: Array.from(data.topics),
        studentIds: Array.from(data.students),
        suggestedAction: this.getSuggestedAction(
          data.count,
          data.students.size,
        ),
      }),
    );

    return patterns.sort((a, b) => b.errorCount - a.errorCount);
  }

  /**
   * Predict student performance
   */
  async predictPerformance(studentId: string): Promise<PerformancePrediction> {
    // Get student's performance history
    const grades = await this.prisma.grade.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const attendance = await this.prisma.attendance.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
      take: 30,
    });

    const submissions = await this.prisma.submission.findMany({
      where: { studentId },
      include: { assignment: true },
    });

    // Calculate metrics
    const avgGrade =
      grades.length > 0
        ? grades.reduce((sum, g) => sum + (Number(g.grade) / Number(g.maxScore)) * 100, 0) /
        grades.length
        : 0;

    const attendanceRate =
      attendance.length > 0
        ? (attendance.filter(
          (a) => a.status === 'PRESENT' || a.status === 'LATE',
        ).length /
          attendance.length) *
        100
        : 0;

    const lateSubmissions = submissions.filter(
      (s) =>
        s.assignment.dueDate &&
        s.submittedAt &&
        s.submittedAt > s.assignment.dueDate,
    ).length;

    // Simple prediction model
    const riskFactors: string[] = [];
    const recommendations: string[] = [];
    let confidence = 80;

    if (avgGrade < 60) {
      riskFactors.push('متوسط الدرجات منخفض');
      recommendations.push('حضور دروس تقوية');
      confidence -= 10;
    }
    if (attendanceRate < 80) {
      riskFactors.push('نسبة حضور ضعيفة');
      recommendations.push('تحسين الانتظام في الحضور');
      confidence -= 10;
    }
    if (lateSubmissions > 3) {
      riskFactors.push('تأخر متكرر في تسليم الواجبات');
      recommendations.push('تنظيم الوقت وتسليم الواجبات في موعدها');
      confidence -= 5;
    }

    // Trend analysis
    const recentGrades = grades.slice(0, 5);
    const olderGrades = grades.slice(5, 10);

    if (recentGrades.length > 0 && olderGrades.length > 0) {
      const recentAvg =
        recentGrades.reduce((sum, g) => sum + (Number(g.grade) / Number(g.maxScore)) * 100, 0) /
        recentGrades.length;
      const olderAvg =
        olderGrades.reduce(
          (sum, g) => sum + (Number(g.grade) / Number(g.maxScore)) * 100,
          0,
        ) /
        olderGrades.length;

      if (recentAvg < olderAvg - 10) {
        riskFactors.push('تراجع ملحوظ في المستوى');
        recommendations.push('مراجعة مع المدرس لتحديد سبب التراجع');
      } else if (recentAvg > olderAvg + 10) {
        recommendations.push('استمر في هذا التقدم الممتاز!');
        confidence += 5;
      }
    }

    if (riskFactors.length === 0) {
      recommendations.push('أداء ممتاز! استمر هكذا');
    }

    return {
      studentId,
      predictedGrade: Math.min(
        100,
        Math.max(
          0,
          Math.round(
            avgGrade * 0.6 +
            attendanceRate * 0.2 +
            (100 - lateSubmissions * 5) * 0.2,
          ),
        ),
      ),
      confidence: Math.min(100, Math.max(50, confidence)),
      riskFactors,
      recommendations,
    };
  }

  /**
   * Generate lesson summary
   */
  async generateLessonSummary(lessonId: string): Promise<LessonSummary> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { subject: true },
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // In production, this would use an LLM to analyze the lesson content
    // For now, return a structured template
    return {
      title: lesson.title,
      keyPoints: [
        `النقطة الرئيسية الأولى من درس ${lesson.title}`,
        `النقطة الرئيسية الثانية من درس ${lesson.title}`,
        `النقطة الرئيسية الثالثة من درس ${lesson.title}`,
      ],
      concepts: ['المفهوم الأول', 'المفهوم الثاني', 'المفهوم الثالث'],
      practiceQuestions: await this.suggestQuestions(
        lesson.subjectId,
        lesson.title,
        3,
      ),
    };
  }

  /**
   * General Q&A Assistant
   */
  async ask(question: string, subject?: string): Promise<{ answer: string; isMock: boolean }> {
    this.logger.log(`AI Q&A: ${question}`);

    // In production, use Gemini/OpenAI
    // For now, simulated intelligent responses in Arabic
    await new Promise(resolve => setTimeout(resolve, 1000));

    let answer = "أنا مساعدك الذكي NEXUS. كيف يمكنني مساعدتك في مجال التعليم اليوم؟";

    const questionLower = question.toLowerCase();

    if (questionLower.includes('واجب') || questionLower.includes('assignment')) {
      answer = "يمكنني مساعدتك في شرح الواجبات أو تصحيحها. هل تود أن أقوم بمراجعة مسودة إجابتك؟";
    } else if (questionLower.includes('خطة') || questionLower.includes('plan')) {
      answer = "بالتأكيد! لتنظيم وقتك، أنصحك بتخصيص 45 دقيقة لكل مادة مع استراحة 10 دقائق. هل تريد مني تصميم جدول دراسي مخصص لك؟";
    } else if (questionLower.includes('شرح') || questionLower.includes('explain')) {
      answer = "بالطبع، أي مفهوم تود مني شرحه؟ يمكنني تبسيط أصعب المفاهيم باستخدام أمثلة من حياتنا اليومية.";
    } else if (questionLower.includes('مرحبا') || questionLower.includes('hello')) {
      answer = "أهلاً بك! أنا مساعدك الذكي في منصة مليون التعليمية. أنا هنا لدعمك في رحلتك الدراسية. بماذا تود أن نبدأ اليوم؟";
    }

    return {
      answer,
      isMock: true
    };
  }

  /**
   * AI Automated Grading for Assignments
   */
  async gradeSubmission(submissionId: string): Promise<{
    score: number;
    feedback: string;
    criteria_breakdown: Record<string, number>;
  }> {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: true,
        student: { select: { name: true } }
      }
    });

    if (!submission) throw new Error('Submission not found');

    this.logger.log(`AI Auto-grading submission for ${submission.student.name}`);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulated evaluation logic
    // In real app, we would send submission.content to an LLM
    const score = Math.floor(Math.random() * 5) + 15; // 15-20 range

    const feedbacks = [
      "إجابة نموذجية وممتازة! لقد أظهرت فهماً عميقاً للموضوع. استمر في هذا المستوى الرائع.",
      "عمل جيد جداً. إجابتك منظمة ومنطقية، ولكن حاول التوسع أكثر في شرح النقاط الأساسية في المرة القادمة.",
      "إجابة جيدة، ولكن هناك بعض النقاط التي تحتاج إلى توضيح أكثر. أنصحك بمراجعة الدرس الأخير المتعلق بهذا الموضوع."
    ];

    return {
      score,
      feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)],
      criteria_breakdown: {
        "الدقة العلمية": Math.floor(Math.random() * 5) + 5,
        "التنظيم": Math.floor(Math.random() * 5) + 5,
        "اللغة والأسلوب": Math.floor(Math.random() * 5) + 5
      }
    };
  }

  private getQuestionTemplates(
    topic: string,
    difficulty: 'EASY' | 'MEDIUM' | 'HARD',
  ) {
    // ... existing templates ...
    const templates = [
      {
        question: `ما هو تعريف ${topic}؟`,
        options: [
          'التعريف الصحيح',
          'تعريف خاطئ 1',
          'تعريف خاطئ 2',
          'تعريف خاطئ 3',
        ],
        correctAnswer: 0,
        explanation: `${topic} هو...`,
      },
      {
        question: `أي مما يلي يعتبر من خصائص ${topic}؟`,
        options: [
          'الخاصية الصحيحة',
          'خاصية خاطئة 1',
          'خاصية خاطئة 2',
          'خاصية خاطئة 3',
        ],
        correctAnswer: 0,
        explanation: 'من خصائص هذا المفهوم...',
      },
      {
        question: `كيف يمكن تطبيق ${topic} في الحياة العملية؟`,
        options: [
          'التطبيق الصحيح',
          'تطبيق خاطئ 1',
          'تطبيق خاطئ 2',
          'تطبيق خاطئ 3',
        ],
        correctAnswer: 0,
        explanation: 'يمكن تطبيق هذا المفهوم عن طريق...',
      },
      {
        question: `ما الفرق بين ${topic} والمفاهيم المشابهة؟`,
        options: ['الفرق الصحيح', 'فرق خاطئ 1', 'فرق خاطئ 2', 'فرق خاطئ 3'],
        correctAnswer: 0,
        explanation: 'الفرق الأساسي هو...',
      },
      {
        question: `اذكر أهمية ${topic}`,
        options: [
          'الأهمية الصحيحة',
          'أهمية خاطئة 1',
          'أهمية خاطئة 2',
          'أهمية خاطئة 3',
        ],
        correctAnswer: 0,
        explanation: 'تكمن أهمية هذا المفهوم في...',
      },
    ];

    return templates;
  }

  private getSuggestedAction(errorCount: number, studentCount: number): string {
    if (errorCount > 10 && studentCount > 5) {
      return 'يُنصح بإعادة شرح الموضوع للفصل بالكامل';
    } else if (studentCount > 3) {
      return 'يُنصح بعمل حصة مراجعة مع الطلاب المتعثرين';
    } else {
      return 'يُنصح بمتابعة فردية مع الطلاب المتعثرين';
    }
  }
}

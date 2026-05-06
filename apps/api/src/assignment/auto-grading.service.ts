import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option (0-based)
  points: number;
}

export interface MCQSubmission {
  questionId: string;
  selectedAnswer: number;
}

export interface MCQAssignment {
  questions: MCQQuestion[];
  totalPoints: number;
}

export interface MCQResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  correctCount: number;
  totalQuestions: number;
  details: {
    questionId: string;
    isCorrect: boolean;
    selectedAnswer: number;
    correctAnswer: number;
    pointsEarned: number;
  }[];
}

export type RubricLevel =
  | 'EXCELLENT'
  | 'GOOD'
  | 'NEEDS_IMPROVEMENT'
  | 'UNSATISFACTORY';

export interface RubricCriteria {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
}

export interface RubricGrade {
  criteriaId: string;
  level: RubricLevel;
  comment?: string;
}

export interface RubricResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  overallLevel: RubricLevel;
  details: {
    criteriaId: string;
    criteriaName: string;
    level: RubricLevel;
    levelArabic: string;
    pointsEarned: number;
    maxPoints: number;
    comment?: string;
  }[];
}

@Injectable()
export class AutoGradingService {
  constructor(private prisma: PrismaService) { }

  /**
   * Auto-grade MCQ assignment
   */
  gradeMCQ(questions: MCQQuestion[], answers: MCQSubmission[]): MCQResult {
    let totalScore = 0;
    let correctCount = 0;
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0);

    const details = questions.map((question) => {
      const submission = answers.find((a) => a.questionId === question.id);
      const selectedAnswer = submission?.selectedAnswer ?? -1;
      const isCorrect = selectedAnswer === question.correctAnswer;
      const pointsEarned = isCorrect ? question.points : 0;

      if (isCorrect) {
        correctCount++;
        totalScore += question.points;
      }

      return {
        questionId: question.id,
        isCorrect,
        selectedAnswer,
        correctAnswer: question.correctAnswer,
        pointsEarned,
      };
    });

    return {
      totalScore,
      maxScore,
      percentage: Math.round((totalScore / maxScore) * 100),
      correctCount,
      totalQuestions: questions.length,
      details,
    };
  }

  /**
   * Grade using simple rubric (Excellent/Good/Needs Improvement/Unsatisfactory)
   */
  gradeWithRubric(
    criteria: RubricCriteria[],
    grades: RubricGrade[],
  ): RubricResult {
    const levelPoints: Record<RubricLevel, number> = {
      EXCELLENT: 1.0,
      GOOD: 0.75,
      NEEDS_IMPROVEMENT: 0.5,
      UNSATISFACTORY: 0.25,
    };

    const levelArabic: Record<RubricLevel, string> = {
      EXCELLENT: 'ممتاز',
      GOOD: 'جيد',
      NEEDS_IMPROVEMENT: 'يحتاج تحسين',
      UNSATISFACTORY: 'غير مرضٍ',
    };

    let totalScore = 0;
    const maxScore = criteria.reduce((sum, c) => sum + c.maxPoints, 0);

    const details = criteria.map((criterion) => {
      const grade = grades.find((g) => g.criteriaId === criterion.id);
      const level = grade?.level || 'UNSATISFACTORY';
      const pointsEarned = Math.round(criterion.maxPoints * levelPoints[level]);
      totalScore += pointsEarned;

      return {
        criteriaId: criterion.id,
        criteriaName: criterion.name,
        level,
        levelArabic: levelArabic[level],
        pointsEarned,
        maxPoints: criterion.maxPoints,
        comment: grade?.comment,
      };
    });

    // Calculate overall level
    const percentage = (totalScore / maxScore) * 100;
    let overallLevel: RubricLevel = 'UNSATISFACTORY';
    if (percentage >= 90) overallLevel = 'EXCELLENT';
    else if (percentage >= 75) overallLevel = 'GOOD';
    else if (percentage >= 50) overallLevel = 'NEEDS_IMPROVEMENT';

    return {
      totalScore,
      maxScore,
      percentage: Math.round(percentage),
      overallLevel,
      details,
    };
  }

  /**
   * Quick grade with simple level selection
   */
  quickGrade(
    level: RubricLevel,
    maxScore: number = 100,
  ): { score: number; feedback: string } {
    const levelPoints: Record<RubricLevel, number> = {
      EXCELLENT: 0.95,
      GOOD: 0.8,
      NEEDS_IMPROVEMENT: 0.6,
      UNSATISFACTORY: 0.4,
    };

    const feedbackTemplates: Record<RubricLevel, string[]> = {
      EXCELLENT: [
        'عمل ممتاز! استمر على هذا المستوى المتميز.',
        'أداء رائع! أنت من أفضل الطلاب في هذه المهمة.',
        'تميز واضح في الإجابات. أحسنت!',
      ],
      GOOD: [
        'عمل جيد جداً! مع القليل من الجهد ستصل للتميز.',
        'أداء جيد! هناك مجال للتحسين في بعض النقاط.',
        'إجابات جيدة بشكل عام. استمر في التطوير.',
      ],
      NEEDS_IMPROVEMENT: [
        'تحتاج لمراجعة بعض النقاط. لا تتردد في طلب المساعدة.',
        'هناك بعض الأخطاء التي يمكن تجنبها. راجع الدرس مرة أخرى.',
        'المستوى مقبول لكن يحتاج تحسين. تواصل مع المدرس للمساعدة.',
      ],
      UNSATISFACTORY: [
        'يبدو أنك تحتاج لمراجعة شاملة للمادة. تواصل مع المدرس.',
        'هناك صعوبات واضحة. ننصح بحضور دروس إضافية.',
        'المستوى أقل من المطلوب. نحتاج للعمل معاً على تحسينه.',
      ],
    };

    const score = Math.round(maxScore * levelPoints[level]);
    const templates = feedbackTemplates[level];
    const feedback =
      templates[Math.floor(Math.random() * templates.length)] || '';

    return { score, feedback };
  }

  /**
   * Save auto-graded submission
   */
  async saveAutoGrade(
    submissionId: string,
    score: number,
    feedback: string,
    autoGradeDetails?: MCQResult | RubricResult,
  ) {
    return this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: score,
        feedback: `${feedback}\n\n[تصحيح تلقائي]`,
        gradedAt: new Date(),
      },
    });
  }

  /**
   * Generate default rubric criteria
   */
  getDefaultRubricCriteria(): RubricCriteria[] {
    return [
      {
        id: 'completeness',
        name: 'اكتمال الإجابة',
        description: 'هل أجاب الطالب على جميع أجزاء السؤال؟',
        maxPoints: 25,
      },
      {
        id: 'accuracy',
        name: 'دقة المعلومات',
        description: 'هل المعلومات المقدمة صحيحة ودقيقة؟',
        maxPoints: 35,
      },
      {
        id: 'organization',
        name: 'تنظيم الإجابة',
        description: 'هل الإجابة منظمة ومرتبة بشكل جيد؟',
        maxPoints: 20,
      },
      {
        id: 'presentation',
        name: 'العرض والتقديم',
        description: 'هل الخط واضح والإجابة مقروءة؟',
        maxPoints: 20,
      },
    ];
  }
}

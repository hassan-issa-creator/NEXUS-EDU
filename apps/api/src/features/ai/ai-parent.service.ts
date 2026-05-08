import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../../core/database/prisma.service';

export interface ParentAdviceResult {
  summary: string;
  positives: string[];
  concerns: string[];
  actionableAdvice: string[];
  overallStatus: 'excellent' | 'good' | 'needsAttention' | 'urgent';
}

export interface LearningRiskResult {
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number; // 0-100
  indicators: {
    attendance: { score: number; detail: string };
    gradesTrend: { score: number; detail: string };
    assignmentCompletion: { score: number; detail: string };
  };
  recommendation: string;
}

@Injectable()
export class AiParentService {
  private openai: OpenAI | null = null;
  private readonly logger = new Logger(AiParentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private configService: ConfigService
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey && apiKey !== 'sk_placeholder') {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('AiParentService: OpenAI initialized');
    } else {
      this.logger.warn('AiParentService: No valid OpenAI key — mock mode active');
    }
  }

  /**
   * Generate AI-powered advice for a parent about their child
   */
  async generateParentAdvice(
    studentId: string,
    parentQuestion?: string,
  ): Promise<ParentAdviceResult> {
    // Fetch student data
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: {
        studentGrades: {
          include: { subject: true },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        attendance: {
          take: 30,
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!student) {
      return this.getMockAdvice('طالب غير معروف');
    }

    const presentCount = (student.attendance || []).filter((a: any) => a.status === 'PRESENT').length;
    const absentCount = (student.attendance || []).filter((a: any) => a.status === 'ABSENT').length;
    const attendanceRate = (student.attendance || []).length > 0
      ? Math.round((presentCount / (student.attendance || []).length) * 100)
      : 100;

    const gradeSummary = (student.studentGrades || []).map((g: any) => ({
      subject: g.subject?.name || 'Unknown',
      score: g.score,
      max: g.maxScore || 100,
      pct: Math.round((g.score / (g.maxScore || 100)) * 100),
    }));

    const missingAssignments = await this.prisma.submission.count({
      where: { studentId, grade: null },
    });

    const studentName = student.name || student.firstName || 'الطالب';

    if (!this.openai) {
      return this.getMockAdvice(studentName);
    }

    const systemPrompt = `أنت مستشار تعليمي خبير متخصص في التواصل مع أولياء الأمور بالعربية الفصحى.
    مهمتك: تحليل أداء الطالب وتقديم تقرير واضح ومبسط لولي الأمر.
    
    بيانات الطالب "${studentName}":
    - نسبة الحضور: ${attendanceRate}% (حضر ${presentCount} يوم، غاب ${absentCount} يوم)
    - الواجبات المعلقة غير المسلمة: ${missingAssignments}
    - آخر الدرجات: ${gradeSummary.map(g => `${g.subject}: ${g.score}/${g.max} (${g.pct}%)`).join('، ')}
    
    ${parentQuestion ? `سؤال ولي الأمر: "${parentQuestion}"` : ''}
    
    أجب بـ JSON فقط بهذا الشكل الدقيق:
    {
      "summary": "فقرة قصيرة تلخص الوضع العام بأسلوب دافئ ومطمئن",
      "positives": ["نقطة إيجابية 1", "نقطة إيجابية 2"],
      "concerns": ["نقطة تحتاج اهتمام 1 (إن وجدت)"],
      "actionableAdvice": ["نصيحة عملية يمكن لولي الأمر تطبيقها 1", "نصيحة 2"],
      "overallStatus": "excellent|good|needsAttention|urgent"
    }`;

    try {
      const completion = await this.openai.chat.completions.create({
        messages: [{ role: 'system', content: systemPrompt }],
        model: 'gpt-4o',
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      return {
        summary: result.summary || '',
        positives: result.positives || [],
        concerns: result.concerns || [],
        actionableAdvice: result.actionableAdvice || [],
        overallStatus: result.overallStatus || 'good',
      };
    } catch (error) {
      this.logger.error('AiParentService: Failed to generate advice', error);
      return this.getMockAdvice(studentName);
    }
  }

  /**
   * Detect early learning risk indicators for a student
   */
  async detectLearningRiskIndicators(studentId: string): Promise<LearningRiskResult> {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: {
        studentGrades: {
          take: 20,
          orderBy: { createdAt: 'asc' },
        },
        attendance: {
          take: 30,
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!student) {
      return { riskLevel: 'low', riskScore: 10, indicators: { attendance: { score: 10, detail: 'لا توجد بيانات' }, gradesTrend: { score: 10, detail: 'لا توجد بيانات' }, assignmentCompletion: { score: 10, detail: 'لا توجد بيانات' } }, recommendation: '' };
    }

    // Attendance Risk (0-100, higher = more risk)
    const attendanceList = (student.attendance || []) as any[];
    const absentCount = attendanceList.filter((a: any) => a.status === 'ABSENT').length;
    const attendanceRisk = Math.min(100, Math.round((absentCount / Math.max(attendanceList.length, 1)) * 200));
    const attendanceDetail = absentCount > 5
      ? `غاب ${absentCount} مرة من آخر ${attendanceList.length} يوم — يحتاج متابعة`
      : `نسبة حضور ممتازة`;

    // Grades Trend Risk (are grades declining?)
    const gradeList = (student.studentGrades || []) as any[];
    const pcts = gradeList.map((g: any) => Math.round((g.score / (g.maxScore || 100)) * 100));
    let gradesTrendRisk = 20;
    if (pcts.length >= 3) {
      const recent = pcts.slice(-3).reduce((a: number, b: number) => a + b, 0) / 3;
      const earlier = pcts.slice(0, 3).reduce((a: number, b: number) => a + b, 0) / 3;
      const decline = earlier - recent;
      gradesTrendRisk = Math.min(100, Math.max(0, decline * 3));
    }
    const avgPct = pcts.length > 0 ? Math.round(pcts.reduce((a: number, b: number) => a + b, 0) / pcts.length) : 70;
    const gradesTrendDetail = gradesTrendRisk > 40
      ? `الدرجات في تراجع — المتوسط ${avgPct}%`
      : `الأداء الأكاديمي مستقر أو في تحسن — المتوسط ${avgPct}%`;

    // Assignment Completion Risk
    const missingCount = await this.prisma.submission.count({
      where: { studentId, grade: null },
    });
    const assignmentRisk = Math.min(100, missingCount * 15);
    const assignmentDetail = missingCount > 3
      ? `${missingCount} واجب غير مسلم — هذا يؤثر على درجات التقديم`
      : missingCount > 0 ? `${missingCount} واجب معلق` : `جميع الواجبات مسلمة`;

    // Overall risk score (weighted)
    const riskScore = Math.round(
      (attendanceRisk * 0.3) + (gradesTrendRisk * 0.4) + (assignmentRisk * 0.3)
    );
    const riskLevel: 'low' | 'medium' | 'high' =
      riskScore > 60 ? 'high' : riskScore > 30 ? 'medium' : 'low';

    const recommendation =
      riskLevel === 'high'
        ? 'يُنصح بالتواصل المباشر مع المعلم وتخصيص وقت مراجعة يومي للطالب'
        : riskLevel === 'medium'
        ? 'يُنصح بمتابعة الواجبات يومياً وتشجيع الطالب على المشاركة'
        : 'الطالب في وضع ممتاز — استمر في التشجيع والمتابعة الإيجابية';

    return {
      riskLevel,
      riskScore,
      indicators: {
        attendance: { score: attendanceRisk, detail: attendanceDetail },
        gradesTrend: { score: gradesTrendRisk, detail: gradesTrendDetail },
        assignmentCompletion: { score: assignmentRisk, detail: assignmentDetail },
      },
      recommendation,
    };
  }

  private getMockAdvice(studentName: string): ParentAdviceResult {
    return {
      summary: `ابنك ${studentName} يُحقق أداءً جيداً بشكل عام. هناك فرص للتحسين في بعض المواد لكن الصورة العامة إيجابية.`,
      positives: ['نسبة الحضور منتظمة', 'يُبدي اهتمامًا بالمواد العلمية'],
      concerns: ['بعض الواجبات تحتاج اهتمامًا أكبر'],
      actionableAdvice: [
        'خصص 30 دقيقة يوميًا لمراجعة الواجبات مع ابنك',
        'تواصل مع معلم الرياضيات لتحديد نقاط الضعف',
      ],
      overallStatus: 'good',
    };
  }
}

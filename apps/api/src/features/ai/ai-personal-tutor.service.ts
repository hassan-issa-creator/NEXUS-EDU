import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../../core/database/prisma.service';

export interface WeaknessTopic {
  topic: string;
  score: number;
  description: string;
}

export interface WeaknessMapResult {
  topics: WeaknessTopic[];
  recommendations: string[];
  learningPath: string;
}

@Injectable()
export class AiPersonalTutorService {
  private openai: OpenAI | null = null;
  private readonly logger = new Logger(AiPersonalTutorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private configService: ConfigService
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey && apiKey !== 'sk_placeholder') {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * Builds a personalized weakness map based on student's past performance
   */
  async buildWeaknessMap(studentId: string): Promise<WeaknessMapResult> {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: {
        studentGrades: {
          include: {
            subject: true,
          },
          take: 30,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const failedGrades = (student.studentGrades || []).filter((g: any) => {
      const pct = (g.score / (g.maxScore || 100)) * 100;
      return pct < 70;
    });

    if (failedGrades.length === 0) {
      return {
        topics: [],
        recommendations: [
          'أداؤك ممتاز! استمر في التركيز على الواجبات القادمة لتحافظ على مستواك.',
          'حاول مراجعة الدروس بشكل استباقي لتكون مستعدًا دائماً.'
        ],
        learningPath: 'تطوير المهارات المتقدمة والحفاظ على التفوق.'
      };
    }

    const failedContext = (failedGrades as any[]).map((g: any) => 
      `${g.subject?.name || 'مادة'}: تقييم - الدرجة: ${g.score}/${g.maxScore || 100}`
    ).join(' | ');

    if (!this.openai) {
      return this.getMockWeaknessMap();
    }

    const systemPrompt = `أنت معلم شخصي ذكي (AI Personal Tutor). مهمتك بناء "خريطة نقاط ضعف" لطالب وتحليل الدرجات الضعيفة التي حصل عليها مؤخراً لاستنتاج المفاهيم أو المواضيع التي يحتاج التركيز عليها.

بيانات الإخفاقات الأخيرة للطالب:
${failedContext}

أخرج ردك كـ JSON يحتوي على:
{
  "topics": [
    { "topic": "اسم المفهوم أو المادة", "score": رقم_يعبر_عن_مستوى_الضعف_من_100 (مثلا 40 يعني ضعيف جدا), "description": "وصف قصير للمشكلة" }
  ],
  "recommendations": [
    "توصية عملية 1 للبدء فوراً",
    "توصية 2"
  ],
  "learningPath": "جملة تلخص المسار التعليمي المقترح لهذا الأسبوع بناء على التحليل"
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
        topics: result.topics || [],
        recommendations: result.recommendations || [],
        learningPath: result.learningPath || '',
      };
    } catch (error) {
      this.logger.error('Failed to generate weakness map', error);
      return this.getMockWeaknessMap();
    }
  }

  private getMockWeaknessMap(): WeaknessMapResult {
    return {
      topics: [
        { topic: 'المعادلات الجبرية', score: 45, description: 'صعوبة في حل المعادلات من الدرجة الثانية.' },
        { topic: 'الفيزياء - الحركة', score: 50, description: 'أخطاء في تطبيق قوانين نيوتن.' }
      ],
      recommendations: [
        'راجع أمثلة الكتاب في الوحدة الثالثة للرياضيات.',
        'تدرب على 3 مسائل يومياً عن الحركة قبل البدء بالواجب الجديد.'
      ],
      learningPath: 'التركيز على الأساسيات الرياضية وتطبيق القوانين الفيزيائية خطوة بخطوة.'
    };
  }
}

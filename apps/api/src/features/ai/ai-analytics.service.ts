import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface StudentInsight {
  strengths: string[];
  weaknesses: string[];
  recommendedTopics: string[];
  encouragementMessage: string;
}

@Injectable()
export class AiAnalyticsService {
  private openai: OpenAI | null = null;
  private readonly logger = new Logger(AiAnalyticsService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey && apiKey !== 'sk_placeholder') {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI Service initialized for Analytics');
    } else {
      this.logger.warn('OPENAI_API_KEY not found or invalid. Using Mock AI Service for Analytics.');
    }
  }

  async generateStudentInsights(studentData: any): Promise<StudentInsight> {
    if (!this.openai) {
      return this.getMockResponse(studentData);
    }

    try {
      const systemPrompt = `You are an expert Arabic educational counselor.
      Analyze the following student performance data and provide actionable insights.
      
      Student Name: ${studentData.name}
      Grades: ${JSON.stringify(studentData.grades)}
      Missing Assignments: ${studentData.missingAssignments}
      Attendance Rate: ${studentData.attendanceRate}%

      Respond ONLY with a valid JSON object matching this structure (in Arabic):
      {
        "strengths": ["string", "string"],
        "weaknesses": ["string", "string"],
        "recommendedTopics": ["string", "string"],
        "encouragementMessage": "A short, positive message to the student"
      }`;

      const completion = await this.openai.chat.completions.create({
        messages: [{ role: 'system', content: systemPrompt }],
        model: 'gpt-4o',
        temperature: 0.6,
        response_format: { type: 'json_object' },
      });

      const responseContent = completion.choices[0].message.content || '{}';
      
      try {
        const parsed = JSON.parse(responseContent);
        return {
          strengths: parsed.strengths || [],
          weaknesses: parsed.weaknesses || [],
          recommendedTopics: parsed.recommendedTopics || [],
          encouragementMessage: parsed.encouragementMessage || 'أنت تقوم بعمل رائع، استمر!'
        };
      } catch (e) {
        this.logger.error('Failed to parse AI JSON response', e);
        return this.getMockResponse(studentData);
      }

    } catch (error) {
      this.logger.error('OpenAI API Error during analytics generation', error);
      return this.getMockResponse(studentData);
    }
  }

  private getMockResponse(studentData: any): StudentInsight {
    return {
      strengths: ['المشاركة في الفصل', 'تسليم الواجبات في الوقت المحدد أحياناً'],
      weaknesses: ['تأخير في تسليم بعض الواجبات', 'درجات الرياضيات تحتاج للتحسين'],
      recommendedTopics: ['مراجعة جداول الضرب', 'تنظيم الوقت'],
      encouragementMessage: `نحن نؤمن بقدراتك يا ${studentData.name}! قليل من التركيز وسوف تحقق أعلى الدرجات.`
    };
  }
}

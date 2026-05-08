import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface ExamGenerationRequest {
  topic: string;
  subject: string;
  gradeLevel: string;
  questionCount: number;
  questionType: 'multiple_choice' | 'true_false' | 'mixed';
}

export interface GeneratedQuestion {
  question: string;
  type: 'multiple_choice' | 'true_false';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

@Injectable()
export class AiExamService {
  private openai: OpenAI | null = null;
  private readonly logger = new Logger(AiExamService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey && apiKey !== 'sk_placeholder') {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI Service initialized for Exam Generation');
    } else {
      this.logger.warn('OPENAI_API_KEY not found or invalid. Using Mock AI Service for Exams.');
    }
  }

  async generateExam(request: ExamGenerationRequest): Promise<GeneratedQuestion[]> {
    if (!this.openai) {
      return this.getMockResponse(request);
    }

    try {
      const systemPrompt = `You are an expert Arabic educational assistant for teachers.
      Your task is to generate exam questions in Arabic based on the following criteria:
      - Subject: ${request.subject}
      - Grade Level: ${request.gradeLevel}
      - Topic: ${request.topic}
      - Number of questions: ${request.questionCount}
      - Question type: ${request.questionType}
      
      You MUST respond ONLY with a valid JSON array of question objects. Do not include markdown formatting or backticks around the JSON.
      Each object must follow this format:
      {
        "question": "The question text in Arabic",
        "type": "multiple_choice" or "true_false",
        "options": ["option 1", "option 2", "option 3", "option 4"], // only for multiple_choice
        "correctAnswer": "The exact string of the correct option, or 'صحيح'/'خطأ' for true_false",
        "explanation": "Brief explanation of the answer in Arabic"
      }`;

      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please generate ${request.questionCount} questions about ${request.topic}.` },
        ],
        model: 'gpt-4o', // Using GPT-4o for better JSON adherence and Arabic reasoning
        temperature: 0.7,
        response_format: { type: 'json_object' }, // Enforce JSON
      });

      const responseContent = completion.choices[0].message.content || '{"questions":[]}';
      
      // Handle the case where the model returns {"questions": [...]} instead of just the array
      try {
        const parsed = JSON.parse(responseContent);
        if (parsed.questions && Array.isArray(parsed.questions)) {
           return parsed.questions as GeneratedQuestion[];
        }
        if (Array.isArray(parsed)) {
            return parsed as GeneratedQuestion[];
        }
        return [];
      } catch (e) {
        this.logger.error('Failed to parse AI JSON response', e);
        return this.getMockResponse(request);
      }

    } catch (error) {
      this.logger.error('OpenAI API Error during exam generation', error);
      return this.getMockResponse(request);
    }
  }

  private getMockResponse(request: ExamGenerationRequest): GeneratedQuestion[] {
    this.logger.debug('Returning mock exam questions');
    const questions: GeneratedQuestion[] = [];
    
    for (let i = 1; i <= request.questionCount; i++) {
        if (request.questionType === 'multiple_choice' || (request.questionType === 'mixed' && i % 2 !== 0)) {
            questions.push({
                question: `سؤال تجريبي رقم ${i} عن موضوع: ${request.topic}؟`,
                type: 'multiple_choice',
                options: ['الخيار الأول', 'الخيار الثاني (الصحيح)', 'الخيار الثالث', 'الخيار الرابع'],
                correctAnswer: 'الخيار الثاني (الصحيح)',
                explanation: 'هذا مجرد سؤال تجريبي نظراً لعدم توفر اتصال بخدمة الذكاء الاصطناعي حالياً.'
            });
        } else {
            questions.push({
                question: `هل هذه العبارة التجريبية رقم ${i} صحيحة أم خاطئة بخصوص ${request.topic}؟`,
                type: 'true_false',
                correctAnswer: 'صحيح',
                explanation: 'هذا مجرد سؤال تجريبي.'
            });
        }
    }
    
    return questions;
  }
}

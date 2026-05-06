import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AiTutorService {
  private openai: OpenAI | null = null;
  private readonly logger = new Logger(AiTutorService.name);

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI Service initialized');
    } else {
      this.logger.warn('OPENAI_API_KEY not found. Using Mock AI Service.');
    }
  }

  async askTutor(
    question: string,
    context?: { subject?: string; grade?: string },
  ): Promise<string> {
    if (!this.openai) {
      return this.getMockResponse(question, context);
    }

    try {
      const systemPrompt = `You are an intelligent and helpful AI tutor for students. 
      Subject: ${context?.subject || 'General'}
      Grade Level: ${context?.grade || 'Unknown'}
      
      Instructions:
      - Explain concepts simply and clearly.
      - Do not just give the answer; explain the "Why" and "How".
      - Be encouraging and positive.
      - Answer in the same language as the question (likely Arabic or English).`;

      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        model: 'gpt-3.5-turbo', // Use 3.5 for cost / speed, or gpt-4o if available
      });

      return (
        completion.choices[0].message.content ||
        'Sorry, I could not generate a response.'
      );
    } catch (error) {
      this.logger.error('OpenAI API Error', error);
      return 'Sorry, I am having trouble connecting to my brain right now. Please try again later.';
    }
  }

  private getMockResponse(question: string, context?: any): string {
    // Simple Keyword matching for mock with Arabic support
    const lowerQ = question.toLowerCase();

    if (lowerQ.includes('خطة') || lowerQ.includes('دراسة') || lowerQ.includes('plan')) {
      return 'بكل تأكيد! لإنشاء خطة دراسية فعالة، أنصحك بالبدء بتقسيم المواد حسب الأولوية. هل ترغب في أن أقوم بجدولة مهامك ومراجعاتك للأسبوع القادم بناءً على الواجبات المعلقة؟';
    }
    if (lowerQ.includes('واجب') || lowerQ.includes('سؤال') || lowerQ.includes('homework')) {
      return 'أنا هنا لمساعدتك! يمكنك تزويدي بالسؤال الذي تواجه صعوبة فيه وسأقوم بشرح الخطوات الأساسية للحل دون إعطائك الإجابة النهائية مباشرة لكي تستفيد من التجربة.';
    }
    if (lowerQ.includes('درس') || lowerQ.includes('اشرح') || lowerQ.includes('explain')) {
      return 'درس اليوم كان يركز على المفاهيم الأساسية. لتسهيل الفهم، تخيل أن الموضوع يشبه بناء منزل؛ يجب أن تضع الأساسات أولاً قبل بناء الجدران. هل هناك نقطة محددة لم تكن واضحة لك؟';
    }

    return `هذا سؤال مثير للاهتمام حقاً! كمساعد ذكي في NEXUS، أرى أنك تبحث عن مساعدة بخصوص "${question}". 
(ملاحظة: النظام حالياً يعمل في الوضع التجريبي الذكي لعدم توفر مفتاح OpenAI، سيتم ربط الذكاء الاصطناعي الكامل قريباً جداً!)`;
  }
}

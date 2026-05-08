import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../core/database/prisma.service';
import { EventsGateway } from '../../gateway/events.gateway';
import OpenAI from 'openai';
// Try importing pdf-parse safely
let pdfParse: any;
try {
  pdfParse = require('pdf-parse');
} catch (e) {
  console.warn('pdf-parse not installed yet');
}

@Injectable()
export class AiGradingService {
  private readonly logger = new Logger(AiGradingService.name);
  private openai: OpenAI;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private eventsGateway: EventsGateway,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async gradeSubmission(submissionId: string) {
    if (!this.openai) {
      this.logger.warn('OpenAI API key not configured. Skipping AI grading.');
      return;
    }

    try {
      const submission = await this.prisma.submission.findUnique({
        where: { id: submissionId },
        include: {
          assignment: true,
          student: {
            select: { id: true, name: true }
          }
        }
      });

      if (!submission) throw new Error('Submission not found');

      // Skip if already graded
      if (submission.gradedAt) return submission;

      let extractedText = submission.content || '';

      // We skip downloading/parsing attachments for this MVP, but we mock the logic
      if (submission.attachments && submission.attachments.length > 0) {
        extractedText += '\n[Student attached files which are not fully parsed in this MVP iteration.]';
      }

      const prompt = `
أنت معلم خبير ومتعاطف في مدرسة الإخلاص الأهلية. 
يرجى تصحيح إجابة الطالب التالية بناءً على وصف الواجب.

**بيانات الواجب:**
العنوان: ${submission.assignment.title}
الوصف: ${submission.assignment.description}
الدرجة القصوى: ${submission.assignment.maxScore}

**إجابة الطالب (${submission.student.name}):**
${extractedText}

يرجى إرجاع النتيجة كـ JSON حصراً بالصيغة التالية (بدون أي نصوص إضافية):
{
  "grade": <رقم من 0 إلى الدرجة القصوى>,
  "feedback_ar": "<رسالة تشجيعية ودافئة للطالب توضح له ما أبدع فيه وما يمكن تحسينه>",
  "strengths": ["نقطة قوة 1", "نقطة قوة 2"],
  "weaknesses": ["نقطة ضعف 1"]
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });

      const resultText = response.choices[0].message.content;
      if (!resultText) throw new Error('Empty response from OpenAI');

      const aiResult = JSON.parse(resultText);

      // Update submission with AI Grade
      const updatedSubmission = await this.prisma.submission.update({
        where: { id: submissionId },
        data: {
          grade: aiResult.grade,
          score: aiResult.grade,
          feedback: JSON.stringify({
            text: aiResult.feedback_ar,
            strengths: aiResult.strengths,
            weaknesses: aiResult.weaknesses,
            isAiGenerated: true,
          }),
          gradedAt: new Date(),
        },
      });

      // Award XP via GamificationService (triggers WebSocket + level-up detection)
      const percentage = (aiResult.grade / (submission.assignment.maxScore || 100)) * 100;
      let earnedXP = 0;
      if (percentage >= 90) earnedXP = 50;
      else if (percentage >= 75) earnedXP = 30;
      else if (percentage >= 60) earnedXP = 10;

      if (earnedXP > 0) {
        // Gracefully skip if GamificationService not injected
        try {
          // Note: XP is also handled by AutoGradingService; this is only if AiGradingService is called directly
          await this.prisma.user.update({
            where: { id: submission.studentId },
            data: { totalXP: { increment: earnedXP } },
          });
        } catch (xpErr) {
          this.logger.warn('Could not award XP from AiGradingService', xpErr);
        }
      }

      // Notify Teacher and Student
      this.eventsGateway.emitAssignmentGraded(submission.assignment.teacherId, {
        submissionId: submission.id,
        studentName: submission.student.name,
        grade: aiResult.grade,
      });

      this.eventsGateway.emitNotification(submission.studentId, {
        title: 'تم تصحيح الواجب',
        message: `تم تصحيح الواجب: ${submission.assignment.title}`,
        type: 'grade',
      });

      this.logger.log(`Submission ${submissionId} graded automatically.`);
      return updatedSubmission;

    } catch (error) {
      this.logger.error(`Failed to auto-grade submission ${submissionId}`, error);
      // Fallback
      await this.prisma.submission.update({
        where: { id: submissionId },
        data: {
          feedback: JSON.stringify({
            text: 'حدث خطأ أثناء التصحيح التلقائي. سيقوم المعلم بمراجعة الواجب قريباً.',
            isAiGenerated: false
          })
        }
      });
    }
  }
}

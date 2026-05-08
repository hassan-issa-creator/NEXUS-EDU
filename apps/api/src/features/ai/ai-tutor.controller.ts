import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AiTutorService } from './ai-tutor.service';
import { AiExamService } from './ai-exam.service';
import { AiAnalyticsService } from './ai-analytics.service';
import { AiParentService } from './ai-parent.service';
import { AiPersonalTutorService } from './ai-personal-tutor.service';
import { AiContentService } from './ai-content.service';
import { PrismaService } from '../../core/database/prisma.service';

@ApiTags('AI Tutor')
@Controller('ai')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class AiTutorController {
  constructor(
    private readonly aiService: AiTutorService,
    private readonly aiExamService: AiExamService,
    private readonly aiAnalyticsService: AiAnalyticsService,
    private readonly aiParentService: AiParentService,
    private readonly aiPersonalTutorService: AiPersonalTutorService,
    private readonly aiContentService: AiContentService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('ask')
  @ApiOperation({ summary: 'Ask the AI Tutor a question' })
  async ask(
    @Body() body: { question: string; subject?: string; history?: { role: 'user' | 'assistant'; content: string }[] },
    @Request() req: any,
  ) {
    // JWT payload: userId (primary), sub (fallback), id (last resort)
    const studentId = req.user?.userId || req.user?.sub || req.user?.id;
    const context = {
      subject: body.subject,
      grade: req.user?.grade || 'Unknown',
      studentId,
    };

    const answer = await this.aiService.askTutor(body.question, context, body.history || []);

    return {
      success: true,
      data: { answer, isMock: !process.env.OPENAI_API_KEY },
    };
  }

  @Post('generate-exam')
  @ApiOperation({ summary: 'Generate an exam using AI' })
  async generateExam(
    @Body() body: {
      topic: string;
      subject: string;
      gradeLevel?: string;
      questionCount?: number;
      questionType?: 'multiple_choice' | 'true_false' | 'mixed';
    },
  ) {
    const questions = await this.aiExamService.generateExam({
      topic: body.topic,
      subject: body.subject,
      gradeLevel: body.gradeLevel || 'الصف الأول',
      questionCount: body.questionCount || 5,
      questionType: body.questionType || 'mixed',
    });

    return { success: true, data: { questions } };
  }

  @Get('student-insights/:id')
  @ApiOperation({ summary: 'Generate AI insights for a student based on performance' })
  async getStudentInsights(@Param('id') id: string, @Request() req: any) {
    const studentId = id === 'me' ? (req.user?.userId || req.user?.sub || req.user?.id) : id;
    
    if (!studentId) {
       return { success: false, message: 'Unauthorized or missing ID' };
    }

    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: {
        studentGrades: { include: { subject: true } },
        attendance: true,
      },
    });

    if (!student) {
      return { success: false, message: 'Student not found' };
    }

    const missingAssignmentsCount = await this.prisma.submission.count({
      where: { studentId, grade: null },
    });

    const totalAttendance = (student.attendance || []).length;
    const presentAttendance = (student.attendance as any[] || []).filter((a: any) => a.status === 'PRESENT').length;
    const attendanceRate = totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 100;

    const gradesSummary = (student.studentGrades as any[] || []).slice(0, 10).map((g: any) => ({
      subject: g.subject?.name || 'Unknown',
      score: g.score,
      maxScore: g.maxScore || 100,
    }));

    const insights = await this.aiAnalyticsService.generateStudentInsights({
      name: student.name || student.firstName,
      grades: gradesSummary,
      missingAssignments: missingAssignmentsCount,
      attendanceRate,
    });

    return { success: true, data: insights };
  }

  @Post('parent-advice')
  @ApiOperation({ summary: 'Generate AI advice for a parent about their child' })
  async getParentAdvice(
    @Body() body: { studentId: string; question?: string }
  ) {
    const advice = await this.aiParentService.generateParentAdvice(body.studentId, body.question);
    return { success: true, data: advice };
  }

  @Get('learning-risk/:studentId')
  @ApiOperation({ summary: 'Detect early learning risk indicators for a student' })
  async getLearningRisk(@Param('studentId') studentId: string) {
    const riskReport = await this.aiParentService.detectLearningRiskIndicators(studentId);
    return { success: true, data: riskReport };
  }

  @Get('weakness-map/:id')
  @ApiOperation({ summary: 'Generate a weakness map and learning path for a student' })
  async getWeaknessMap(@Param('id') id: string, @Request() req: any) {
    const studentId = id === 'me' ? (req.user?.userId || req.user?.sub || req.user?.id) : id;
    if (!studentId) {
       return { success: false, message: 'Unauthorized or missing ID' };
    }

    try {
      const weaknessMap = await this.aiPersonalTutorService.buildWeaknessMap(studentId);
      return { success: true, data: weaknessMap };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  @Post('process-document')
  @ApiOperation({ summary: 'Generate interactive content from document text' })
  async processDocument(@Body() body: { text: string }) {
    if (!body.text) {
      return { success: false, message: 'Text is required' };
    }
    const content = await this.aiContentService.processContent(body.text);
    return { success: true, data: content };
  }

  @Post('generate-image')
  @ApiOperation({ summary: 'Generate an educational illustration' })
  async generateImage(@Body() body: { prompt: string }) {
    if (!body.prompt) {
      return { success: false, message: 'Prompt is required' };
    }
    const imageUrl = await this.aiContentService.generateImage(body.prompt);
    return { success: true, data: { url: imageUrl } };
  }
}

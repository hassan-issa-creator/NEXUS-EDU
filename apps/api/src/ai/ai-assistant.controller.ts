import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
  AIAssistantService,
  QuestionSuggestion,
  ErrorPattern,
  PerformancePrediction,
  LessonSummary,
} from './ai-assistant.service';

@ApiTags('AI Assistant')
@Controller('api/ai')
@ApiBearerAuth()
export class AIAssistantController {
  constructor(private readonly aiService: AIAssistantService) { }

  @Post('suggest-questions')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Generate question suggestions for a topic' })
  @ApiResponse({ status: 200, description: 'Question suggestions generated' })
  async suggestQuestions(
    @Body()
    body: {
      subjectId: string;
      topic: string;
      count?: number;
      difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    },
  ): Promise<QuestionSuggestion[]> {
    return this.aiService.suggestQuestions(
      body.subjectId,
      body.topic,
      body.count || 5,
      body.difficulty,
    );
  }

  @Get('analyze-errors')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Analyze common errors across students' })
  @ApiQuery({ name: 'classId', required: false })
  async analyzeErrors(
    @Query('classId') classId?: string,
  ): Promise<ErrorPattern[]> {
    return this.aiService.analyzeErrors(classId);
  }

  @Get('predict/:studentId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Predict student performance' })
  async predictPerformance(
    @Param('studentId') studentId: string,
  ): Promise<PerformancePrediction> {
    return this.aiService.predictPerformance(studentId);
  }

  @Post('ask')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Ask a question to the AI assistant' })
  async ask(
    @Body() body: { question: string; subject?: string },
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.aiService.ask(body.question, body.subject);
    return { success: true, data: result };
  }

  @Post('grade/:submissionId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Auto-grade an assignment submission' })
  async gradeSubmission(
    @Param('submissionId') submissionId: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.aiService.gradeSubmission(submissionId);
    return { success: true, data: result };
  }
}

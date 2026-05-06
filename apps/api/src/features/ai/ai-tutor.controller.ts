import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AiTutorService } from './ai-tutor.service';

@ApiTags('AI Tutor')
@Controller('ai')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class AiTutorController {
  constructor(private readonly aiService: AiTutorService) {}

  @Post('ask')
  @ApiOperation({ summary: 'Ask the AI Tutor a question' })
  async ask(
    @Body() body: { question: string; subject?: string },
    @Request() req: any,
  ) {
    // Enhance context with user info (e.g. grade from user profile if available)
    const context = {
      subject: body.subject,
      grade: req.user?.grade || 'Unknown', // Assuming user object has grade or similar
    };

    const answer = await this.aiService.askTutor(body.question, context);

    return {
      success: true,
      data: {
        answer,
        isMock: !process.env.OPENAI_API_KEY,
      },
    };
  }
}

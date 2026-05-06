import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ClassSessionService } from './class-session.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Class Sessions')
@Controller('classes/:classId/sessions')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ClassSessionController {
  constructor(private readonly sessionService: ClassSessionService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a live session' })
  async startSession(
    @Param('classId') classId: string,
    @Request() req: any,
    @Body() body: { title?: string },
  ) {
    // In real app, verify user is Teacher of this class
    return this.sessionService.startSession(classId, req.user.id, body.title);
  }

  @Post(':sessionId/end')
  @ApiOperation({ summary: 'End a live session' })
  async endSession(@Param('sessionId') sessionId: string) {
    return this.sessionService.endSession(sessionId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active session for class' })
  async getActiveSession(@Param('classId') classId: string) {
    return this.sessionService.getActiveSession(classId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get session history' })
  async getHistory(@Param('classId') classId: string) {
    return this.sessionService.getSessionHistory(classId);
  }
}

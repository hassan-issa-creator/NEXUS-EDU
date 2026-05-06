import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SmartNotificationService } from './smart-notification.service';

@ApiTags('Notifications')
@Controller('api/notifications')
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: SmartNotificationService) {}

  @Post('absence')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Send absence notification to parents' })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  async notifyAbsence(@Body() body: { studentId: string; date: string }) {
    return this.notificationService.notifyStudentAbsence(
      body.studentId,
      new Date(body.date),
    );
  }

  @Post('exam-reminder')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Send exam reminder to student' })
  async notifyExamReminder(
    @Body()
    body: {
      studentId: string;
      examTitle: string;
      examDate: string;
      subjectName: string;
    },
  ) {
    return this.notificationService.notifyExamReminder(
      body.studentId,
      body.examTitle,
      new Date(body.examDate),
      body.subjectName,
    );
  }

  @Post('late-assignment')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Notify about late assignment' })
  async notifyLateAssignment(
    @Body()
    body: {
      studentId: string;
      assignmentTitle: string;
      assignmentId: string;
      daysLate: number;
    },
  ) {
    return this.notificationService.notifyLateAssignment(
      body.studentId,
      body.assignmentTitle,
      body.assignmentId,
      body.daysLate,
    );
  }

  @Post('grade')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Notify about new grade' })
  async notifyGrade(
    @Body()
    body: {
      studentId: string;
      subjectName: string;
      score: number;
      maxScore: number;
      assignmentTitle?: string;
    },
  ) {
    return this.notificationService.notifyGradePosted(
      body.studentId,
      body.subjectName,
      body.score,
      body.maxScore,
      body.assignmentTitle,
    );
  }

  @Post('check-late-assignments')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Check and notify all late assignments (cron)' })
  async checkLateAssignments() {
    return this.notificationService.checkLateAssignments();
  }
}

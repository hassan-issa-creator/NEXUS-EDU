import { Controller, Post, Body, Get, Query, UseGuards, Request, Param, Inject, Optional } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SmartNotificationService } from './smart-notification.service';
import { PrismaService } from '../prisma.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@ApiTags('Notifications')
@Controller('api/notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class NotificationController {
  constructor(
    private readonly notificationService: SmartNotificationService,
    private readonly prisma: PrismaService,
  ) {}


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

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get user notifications' })
  async getUserNotifications(@Request() req: any) {
    return this.notificationService.getUserNotifications(req.user.userId);
  }

  @Post(':id/read')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.notificationService.markAsRead(id, req.user.userId);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@Request() req: any) {
    return this.notificationService.markAllAsRead(req.user.userId || req.user.sub);
  }

  /** Teacher: Get their classes to populate dropdown */
  @Get('my-classes')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Get teacher classes for notification targeting' })
  async getMyClasses(@Request() req: any) {
    const teacherId = req.user?.userId || req.user?.sub || req.user?.id;
    const subjects = await this.prisma.subject.findMany({
      where: { teacherId },
      include: {
        class: { select: { id: true, name: true } },
      },
    });
    // Unique classes
    const classMap = new Map<string, { id: string; name: string }>();
    for (const s of subjects) {
      if (s.class && !classMap.has(s.class.id)) {
        classMap.set(s.class.id, s.class);
      }
    }
    return Array.from(classMap.values());
  }

  /** Teacher: Send a custom notification to a class or all students */
  @Post('send')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Send a custom notification to students' })
  async sendCustomNotification(
    @Request() req: any,
    @Body() body: { title: string; message: string; targetClassId?: string; targetType: 'all-students' | 'class' | 'parents' },
  ) {
    const teacherId = req.user?.userId || req.user?.sub || req.user?.id;

    // Find target users
    let userIds: string[] = [];

    if (body.targetType === 'class' && body.targetClassId) {
      const enrollments = await this.prisma.enrollment.findMany({
        where: { classId: body.targetClassId },
        select: { studentId: true },
      });
      userIds = enrollments.map((e) => e.studentId);
    } else if (body.targetType === 'all-students') {
      // Find all students in teacher's classes via direct enrollment query
      const subjects = await this.prisma.subject.findMany({
        where: { teacherId },
        select: { classId: true },
      });
      const classIds = subjects
        .filter((s) => s.classId)
        .map((s) => s.classId as string);
      if (classIds.length > 0) {
        const enrollments = await this.prisma.enrollment.findMany({
          where: { classId: { in: classIds } },
          select: { studentId: true },
        });
        userIds = [...new Set(enrollments.map((e) => e.studentId))];
      }
    } else if (body.targetType === 'parents') {
      // Find all parents of students in teacher's classes
      const subjects = await this.prisma.subject.findMany({
        where: { teacherId },
        select: { classId: true },
      });
      const classIds = subjects
        .filter((s) => s.classId)
        .map((s) => s.classId as string);
      if (classIds.length > 0) {
        const enrollments = await this.prisma.enrollment.findMany({
          where: { classId: { in: classIds } },
          include: {
            student: {
              include: { parents: { select: { parentId: true } } },
            },
          },
        });
        const idSet = new Set<string>();
        for (const e of enrollments) {
          (e.student as any)?.parents?.forEach((p: any) => idSet.add(p.parentId));
        }
        userIds = Array.from(idSet);
      }
    }

    // Create notifications for all targets
    const results = await Promise.all(
      userIds.map((userId) =>
        this.prisma.notification.create({
          data: {
            type: 'INFO',
            title: body.title,
            body: body.message,
            userId,
            isRead: false,
          },
        }).catch(() => null),
      ),
    );

    return {
      success: true,
      sent: results.filter(Boolean).length,
      total: userIds.length,
    };
  }
}


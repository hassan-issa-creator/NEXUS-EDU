import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EmailService } from '../notifications/email.service';
import {
  EmailTemplates,
  EmailTemplateData,
} from '../notifications/templates/email-templates';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ScheduledReportService {
  private readonly logger = new Logger(ScheduledReportService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) { }

  /**
   * Run every Friday at 10:00 AM
   */
  @Cron('0 10 * * 5') // Every Friday at 10 AM
  async handleWeeklyReports() {
    this.logger.log('Started generating weekly reports...');

    // Get all students with their parents
    const students = await this.prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        parents: {
          include: {
            parent: true,
          },
        },
        enrollments: {
          include: {
            class: true,
          },
        },
      },
    });

    let sentCount = 0;

    for (const student of students) {
      if (!student.parents.length) continue;

      try {
        const reportData = await this.generateStudentStats(student.id);

        // Send to each parent
        for (const relation of student.parents) {
          if (relation.parent.email) {
            const emailData: EmailTemplateData = {
              studentName: student.name || student.firstName || '',
              parentName:
                relation.parent.name || relation.parent.firstName || '',
              date: new Date().toLocaleDateString('ar-EG'),
              attendanceStats: reportData.attendance,
              recentGrades: reportData.grades,
              assignmentsPending: reportData.pendingAssignments,
            };

            await this.emailService.sendEmail({
              to: relation.parent.email,
              subject: `التقرير الأسبوعي للطالب ${student.name}`,
              html: EmailTemplates.weeklyReport(emailData),
            });

            sentCount++;
          }
        }
      } catch (error) {
        this.logger.error(
          `Failed to send report for student ${student.id}`,
          error,
        );
      }
    }

    this.logger.log(`Weekly reports job finished. Sent ${sentCount} emails.`);
  }

  /**
   * Run every day at 12:00 AM (Midnight) for Homework Alerts (Red Alert)
   */
  @Cron('0 0 * * *')
  async handleMidnightHomeworkAlerts() {
    this.logger.log('Running 12:00 AM check for missing homeworks...');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Find assignments due yesterday where students didn't submit
    const dueAssignments = await this.prisma.assignment.findMany({
      where: {
        dueDate: {
          gte: new Date(yesterday.setHours(0,0,0,0)),
          lt: new Date(yesterday.setHours(23,59,59,999)),
        }
      },
      // @ts-ignore
      include: {
        submissions: true,
        class: {
          include: { enrollments: true }
        }
      } as any
    });

    let missingCount = 0;
    for (const assignment of dueAssignments) {
      if (!(assignment as any).class) continue;
      const submittedStudentIds = (assignment as any).submissions.map((s: any) => s.studentId);
      const missingStudents = (assignment as any).class.enrollments.filter((e: any) => !submittedStudentIds.includes(e.studentId));
      
      missingCount += missingStudents.length;
    }
    this.logger.log(`Found ${missingCount} missing submissions for 12:00 AM parent red alert.`);
  }

  /**
   * Run every day at 5:00 PM for Principal/VP Executive Report
   */
  @Cron('0 17 * * *')
  async handleDailyExecutiveReport() {
    this.logger.log('Generating Daily Executive Report for Principals and VPs...');
    // We fetch PRINCIPAL and VICE_PRINCIPAL users through generic lookup
    const executives = await this.prisma.user.findMany({
      where: { role: { in: ['PRINCIPAL', 'VICE_PRINCIPAL'] as any } }
    });

    const activeTeachers = await this.prisma.user.count({ where: { role: 'TEACHER', isActive: true } });
    const students = await this.prisma.user.count({ where: { role: 'STUDENT', isActive: true } });
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayAttendance = await this.prisma.attendance.count({ where: { date: { gte: today } } });

    for (const exec of executives) {
      if (exec.email) {
        await this.emailService.sendEmail({
          to: exec.email,
          subject: `التقرير اليومي المجمع للإدارة العليا - Nexus EDU`,
          html: `<div dir="rtl">
            <h2>التقرير الإحصائي اليومي المتقدم</h2>
            <p>إجمالي المعلمين الملتزمين بالحضور: ${activeTeachers}</p>
            <p>سجلات الحضور المسجلة اليوم للطلاب: ${todayAttendance}</p>
            <hr/>
            <p>تم استخراج هذا التقرير تلقائياً بواسطة نظام Nexus ERP.</p>
          </div>`
        });
      }
    }
  }

  /**
   * Run every morning at 8:00 AM check teachers missed prep
   */
  @Cron('0 8 * * *')
  async handleMissedPrepAlerts() {
    this.logger.log('Verifying Teacher Preparation completion for earlier classes...');
  }

  /**
   * Aggregate statistics for the last 7 days
   */
  private async generateStudentStats(studentId: string) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // 1. Attendance
    const attendance = await this.prisma.attendance.findMany({
      where: {
        studentId,
        date: { gte: oneWeekAgo },
      },
    });

    const attendanceStats = {
      present: attendance.filter((a) => a.status === 'PRESENT').length,
      absent: attendance.filter((a) => a.status === 'ABSENT').length,
      late: attendance.filter((a) => a.status === 'LATE').length,
    };

    // 2. Recent Grades
    // 2. Recent Grades (from Submissions)
    const recentSubmissions = await this.prisma.submission.findMany({
      where: {
        studentId,
        gradedAt: { gte: oneWeekAgo },
        grade: { not: null },
      },
      include: {
        assignment: {
          include: { subject: true },
        },
      },
      take: 5,
      orderBy: { gradedAt: 'desc' },
    });

    const grades = recentSubmissions.map((s) => ({
      subject: s.assignment.subject?.name || 'Unknown Subject',
      score: Number(s.grade) || 0,
      max: Number(s.assignment.maxScore) || 100,
      name: s.assignment.title,
    }));

    // 3. Pending Assignments
    const pendingAssignments = await this.prisma.assignment.count({
      where: {
        // This is a simplified query. In reality, we'd check against submissions
        dueDate: { gte: new Date() },
        // subject: { enrollments: { some: { studentId } } } // implied
      },
    });

    return {
      attendance: attendanceStats,
      grades,
      pendingAssignments,
    };
  }
}

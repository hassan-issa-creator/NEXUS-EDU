import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { EventsGateway } from '../gateway/events.gateway';

@Injectable()
export class EarlyInterventionService {
  private readonly logger = new Logger(EarlyInterventionService.name);

  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  // Run every day at 8PM (EVERY_FRIDAY_AT_8PM doesn't exist in this version)
  @Cron(CronExpression.EVERY_DAY_AT_8PM)
  async analyzeStudentPerformance() {
    this.logger.log('Starting weekly Early Intervention analysis...');

    try {
      // 1. Fetch all active students
      const students = await this.prisma.user.findMany({
        where: { role: 'STUDENT', isActive: true },
        select: { id: true, name: true, firstName: true, schoolId: true },
      });

      for (const student of students) {
        // 2. Fetch recent grades (last 14 days) vs previous 14 days
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

        // Fetch grades for the last 2 weeks
        const recentGrades = await this.prisma.grade.findMany({
          where: {
            studentId: student.id,
            createdAt: { gte: twoWeeksAgo },
          },
          include: { subject: true },
        });

        // Fetch grades for the 2 weeks before that
        const previousGrades = await this.prisma.grade.findMany({
          where: {
            studentId: student.id,
            createdAt: { gte: fourWeeksAgo, lt: twoWeeksAgo },
          },
          include: { subject: true },
        });

        const droppedSubjects = new Set<string>();

        // Group by subject and calculate averages
        const recentAverages = this.calculateSubjectAverages(recentGrades);
        const previousAverages = this.calculateSubjectAverages(previousGrades);

        // Compare
        for (const [subjectId, recentAvg] of Object.entries(recentAverages)) {
          const previousAvg = previousAverages[subjectId];
          if (previousAvg !== undefined) {
            // Drop of more than 15%
            if (previousAvg.avg - recentAvg.avg > 15) {
              droppedSubjects.add(recentAvg.name);
            }
          }
        }

        // 3. Intervention Logic
        if (droppedSubjects.size > 0) {
          const subjectNames = Array.from(droppedSubjects).join(', ');
          const studentName = student.name || student.firstName;
          
          if (droppedSubjects.size >= 3) {
            // Alert Principal and Parent
            this.logger.warn(`HIGH RISK: ${studentName} dropped in 3+ subjects (${subjectNames})`);
            
            // In a real app, find parent and admin IDs and notify them
            this.eventsGateway.server.emit('intervention.alert', {
              type: 'HIGH_RISK',
              studentId: student.id,
              message: `تنبيه: لاحظنا انخفاضاً ملحوظاً في أداء الطالب ${studentName} في المواد التالية: ${subjectNames}.`,
            });
          } else {
            // Alert Teacher
            this.logger.log(`MODERATE RISK: ${studentName} dropped in ${droppedSubjects.size} subject(s) (${subjectNames})`);
            
            this.eventsGateway.server.emit('intervention.alert', {
              type: 'MODERATE_RISK',
              studentId: student.id,
              message: `تنبيه للمعلم: أداء الطالب ${studentName} انخفض مؤخراً في ${subjectNames}.`,
            });
          }

          // Save alert to database for dashboard display
          // Notify the principal (in a real app we'd fetch the actual principal ID)
          // For now we'll just save it globally or for the teacher
          if (student.schoolId) {
            // Find teacher/principal to notify
            // For MVP, we'll assume we can just create a notification for the Teacher or Admin
            // For simplicity in this service, we just create a system notification without a specific user target,
            // or we'd target the specific teacher. Let's just emit it.
            // Actually, we'll fetch teachers in the school and notify them.
            const teachers = await this.prisma.user.findMany({
              where: { role: 'TEACHER', schoolId: student.schoolId }
            });
            for (const t of teachers) {
              await this.prisma.notification.create({
                data: {
                  userId: t.id,
                  title: 'نظام التدخل المبكر',
                  body: `الطالب ${studentName} يعاني من انخفاض في: ${subjectNames}`,
                  type: 'EARLY_INTERVENTION',
                  data: JSON.stringify({ studentId: student.id, subjects: Array.from(droppedSubjects) })
                }
              });
            }
          }
        }
      }

      this.logger.log('Early Intervention analysis completed successfully.');
    } catch (error) {
      this.logger.error('Error during Early Intervention analysis', error);
    }
  }

  private calculateSubjectAverages(grades: any[]) {
    const subjectMap: Record<string, { name: string; totalScore: number; count: number; avg: number }> = {};
    
    for (const g of grades) {
      if (!subjectMap[g.subjectId]) {
        subjectMap[g.subjectId] = { name: g.subject.name, totalScore: 0, count: 0, avg: 0 };
      }
      subjectMap[g.subjectId].totalScore += (g.score / (g.maxScore || 100)) * 100;
      subjectMap[g.subjectId].count += 1;
    }

    for (const key in subjectMap) {
      subjectMap[key].avg = subjectMap[key].totalScore / subjectMap[key].count;
    }

    return subjectMap;
  }
}

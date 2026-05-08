import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  async getClassSchedule(classId: string) {
    const events = await this.prisma.scheduleEvent.findMany({
      where: { classId },
      include: {
        subject: { select: { id: true, name: true, code: true } },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });
    
    // Group by dayOfWeek
    const grouped = events.reduce((acc, event) => {
      const day = event.dayOfWeek;
      if (!acc[day]) acc[day] = [];
      acc[day].push(event);
      return acc;
    }, {} as Record<number, any[]>);

    return grouped;
  }

  async getStudentSchedule(studentId: string) {
    // Find the student's primary class
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId },
      include: { class: true }
    });

    if (!enrollments.length) {
      throw new NotFoundException('Student is not enrolled in any class');
    }

    // Usually students have one main class, taking the first one
    const classId = enrollments[0].classId;
    return this.getClassSchedule(classId);
  }

  async getTeacherSchedule(teacherId: string) {
    const events = await this.prisma.scheduleEvent.findMany({
      where: {
        subject: {
          teacherId
        }
      },
      include: {
        class: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true, code: true } },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    // Group by dayOfWeek
    const grouped = events.reduce((acc, event) => {
      const day = event.dayOfWeek;
      if (!acc[day]) acc[day] = [];
      acc[day].push(event);
      return acc;
    }, {} as Record<number, any[]>);

    return grouped;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ClassSessionService {
  constructor(private prisma: PrismaService) {}

  async startSession(classId: string, teacherId: string, title?: string) {
    // End any active sessions for this class to ensure only one is live
    await this.prisma.classSession.updateMany({
      where: { classId, isActive: true },
      data: { isActive: false },
    });

    return this.prisma.classSession.create({
      data: {
        classId,
        teacherId,
        title: title || 'Live Class Session',
        startTime: new Date(),
        duration: 60, // Default duration placeholder
        isActive: true,
        meetingUrl: `https://meet.jit.si/MillionPlatform-${classId}`,
      },
      include: {
        teacher: { select: { name: true, avatar: true } },
      },
    });
  }

  async endSession(sessionId: string) {
    return this.prisma.classSession.update({
      where: { id: sessionId },
      data: { isActive: false },
    });
  }

  async getActiveSession(classId: string) {
    return this.prisma.classSession.findFirst({
      where: { classId, isActive: true },
      include: {
        teacher: { select: { name: true } },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async getSessionHistory(classId: string) {
    return this.prisma.classSession.findMany({
      where: { classId },
      orderBy: { startTime: 'desc' },
      take: 20,
    });
  }

  async markAttendance(sessionId: string, studentId: string) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) return;

    // Check if attendance already exists specific to this date/session?
    // The Attendance model uses `date`. We should use session date.

    // Create or update Attendance record
    // We need to map session to Attendance model.
    // Schema: Attendance has [studentId, classId, date] unique.

    const date = new Date(session.startTime);
    date.setHours(0, 0, 0, 0); // Normalize to day

    // Upsert attendance
    return this.prisma.attendance.upsert({
      where: {
        studentId_classId_date: {
          studentId,
          classId: session.classId,
          date,
        },
      },
      update: {
        status: 'PRESENT',
        notes: `Joined Online Session: ${session.title}`,
      },
      create: {
        studentId,
        classId: session.classId,
        date,
        status: 'PRESENT',
        notes: `Joined Online Session: ${session.title}`,
      },
    });
  }
}

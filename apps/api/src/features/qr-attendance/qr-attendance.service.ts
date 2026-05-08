import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QrAttendanceService {
  constructor(private prisma: PrismaService) {}

  async createSession(teacherId: string, classId: string, durationMinutes: number = 30) {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + durationMinutes);

    return this.prisma.qrSession.create({
      data: {
        teacherId,
        classId,
        qrCode: uuidv4(), // Generate unique token
        expiresAt,
        isActive: true,
      }
    });
  }

  async getTeacherSessions(teacherId: string) {
    return this.prisma.qrSession.findMany({
      where: { teacherId },
      include: {
        class: { select: { id: true, name: true } },
        _count: { select: { scans: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getSessionDetails(sessionId: string, teacherId: string) {
    const session = await this.prisma.qrSession.findUnique({
      where: { id: sessionId },
      include: {
        scans: {
          include: { student: { select: { id: true, name: true, email: true } } }
        }
      }
    });

    if (!session || session.teacherId !== teacherId) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }

  async deactivateSession(sessionId: string, teacherId: string) {
    const session = await this.prisma.qrSession.findUnique({ where: { id: sessionId } });
    if (!session || session.teacherId !== teacherId) {
      throw new NotFoundException('Session not found');
    }

    return this.prisma.qrSession.update({
      where: { id: sessionId },
      data: { isActive: false }
    });
  }

  async scanQrCode(studentId: string, qrCode: string) {
    const session = await this.prisma.qrSession.findUnique({
      where: { qrCode }
    });

    if (!session) {
      throw new NotFoundException('Invalid QR code');
    }

    if (!session.isActive || session.expiresAt < new Date()) {
      throw new BadRequestException('QR code has expired or is inactive');
    }

    // Verify student is in this class
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_classId: { studentId, classId: session.classId } }
    });

    if (!enrollment) {
      throw new BadRequestException('You are not enrolled in this class');
    }

    // Check if already scanned
    const existing = await this.prisma.qrScan.findUnique({
      where: { sessionId_studentId: { sessionId: session.id, studentId } }
    });

    if (existing) {
      return { message: 'Already marked as present', scan: existing };
    }

    // Create scan
    const scan = await this.prisma.qrScan.create({
      data: {
        sessionId: session.id,
        studentId,
        status: 'VALID'
      }
    });

    // Automatically mark attendance in standard attendance system
    await this.prisma.attendance.upsert({
      where: {
        studentId_classId_date: {
          studentId,
          classId: session.classId,
          date: new Date(new Date().setHours(0, 0, 0, 0)) // start of today
        }
      },
      update: { status: 'PRESENT' },
      create: {
        studentId,
        classId: session.classId,
        date: new Date(new Date().setHours(0, 0, 0, 0)),
        status: 'PRESENT',
        notes: 'Scanned QR Code'
      }
    });

    return { message: 'Attendance marked successfully', scan };
  }
}

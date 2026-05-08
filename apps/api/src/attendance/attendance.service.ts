import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async getMyAttendance(studentId: string) {
    const attendanceRecords = await this.prisma.attendance.findMany({
      where: { studentId },
      include: {
        class: {
          select: { name: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    const totalDays = attendanceRecords.length;
    const present = attendanceRecords.filter(a => a.status === 'PRESENT').length;
    const absent = attendanceRecords.filter(a => a.status === 'ABSENT').length;
    const late = attendanceRecords.filter(a => a.status === 'LATE').length;

    const attendanceRate = totalDays > 0 ? (present / totalDays) * 100 : 0;

    // Get last 5 records for weekly overview
    const weeklyOverview = attendanceRecords.slice(0, 5).map(a => ({
      day: new Date(a.date).toLocaleDateString('en-US', { weekday: 'short' }),
      status: a.status.charAt(0) + a.status.slice(1).toLowerCase(),
      date: a.date.toISOString().split('T')[0]
    }));

    const history = attendanceRecords.map(a => ({
      date: a.date.toISOString().split('T')[0],
      status: a.status.charAt(0) + a.status.slice(1).toLowerCase(),
      subject: a.class?.name || 'Class'
    }));

    return {
      summary: {
        present,
        absent,
        late,
        totalDays,
        attendanceRate: Number(attendanceRate.toFixed(1)),
      },
      weeklyOverview,
      history
    };
  }
}

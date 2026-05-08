import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Grade } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) { }

  async getOverview() {
    const [
      totalUsers,
      students,
      teachers,
      parents,
      totalClasses,
      totalSubjects,
      totalEnrollments,
      recentUsers,
    ] = await Promise.all([
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { role: 'STUDENT', isActive: true } }),
      this.prisma.user.count({ where: { role: 'TEACHER', isActive: true } }),
      this.prisma.user.count({ where: { role: 'PARENT', isActive: true } }),
      this.prisma.class.count(),
      this.prisma.subject.count(),
      this.prisma.enrollment.count(),
      this.prisma.user.findMany({
        where: { isActive: true },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          name: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        students,
        teachers,
        parents,
      },
      classes: {
        total: totalClasses,
      },
      subjects: {
        total: totalSubjects,
      },
      enrollments: {
        total: totalEnrollments,
      },
      recentActivity: recentUsers.map((user) => ({
        type: 'user_created',
        description: `New ${user.role.toLowerCase()} registered: ${user.firstName || user.name || user.email}`,
        timestamp: user.createdAt,
      })),
    };
  }

  async getUserGrowth(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const users = await this.prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
        role: true,
      },
    });

    // Group by date
    const growth: Record<
      string,
      { students: number; teachers: number; total: number }
    > = {};

    users.forEach((user) => {
      const date = user.createdAt.toISOString().split('T')[0];
      if (!growth[date]) {
        growth[date] = { students: 0, teachers: 0, total: 0 };
      }
      growth[date].total++;
      if (user.role === 'STUDENT') growth[date].students++;
      if (user.role === 'TEACHER') growth[date].teachers++;
    });

    return Object.entries(growth).map(([date, data]) => ({
      date,
      ...data,
    }));
  }
  async getStudentStats(studentId: string) {
    const [enrollments, grades, attendance, assignments] = await Promise.all([
      // Get enrollments to count subjects
      this.prisma.enrollment.findMany({
        where: { studentId },
        include: {
          class: {
            include: {
              subjects: {
                include: {
                  assignments: true,
                },
              },
            },
          },
        },
      }),
      // Get grades for average calculation
      this.prisma.grade.findMany({
        where: { studentId },
      }),
      // Get attendance for percentage
      this.prisma.attendance.findMany({
        where: { studentId },
      }),
      // Get assignments count directly if needed, or derive from enrollments
      // We'll derive from enrollments to ensure they are relevant to current classes
      Promise.resolve([]),
    ]);

    // Calculate Total Assignments
    let totalAssignments = 0;
    enrollments.forEach((enrollment) => {
      enrollment.class.subjects.forEach((subject) => {
        totalAssignments += subject.assignments.length;
      });
    });

    // Calculate Average Grade
    let averageGrade = 0;
    const gradesList: Grade[] = grades;
    if (gradesList.length > 0) {
      const totalScore = gradesList.reduce(
        (sum, grade) =>
          sum + (Number(grade.grade) / Number(grade.maxScore)) * 100,
        0,
      );
      averageGrade = totalScore / gradesList.length;
    }

    // Calculate Attendance Percentage
    let attendancePercentage = 0;
    if (attendance.length > 0) {
      const presentCount = attendance.filter(
        (a) => a.status === 'PRESENT' || a.status === 'LATE',
      ).length;
      attendancePercentage = (presentCount / attendance.length) * 100;
    }

    return {
      totalAssignments,
      averageGrade,
      attendancePercentage,
    };
  }

  async getGradeTrends(studentId: string, limit: number = 10) {
    // Fetch recent grades ordered by creation date
    const grades = await this.prisma.grade.findMany({
      where: { studentId },
      include: {
        subject: true,
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    return grades.map(g => ({
      date: g.createdAt.toISOString().split('T')[0],
      subject: g.subject?.name || 'Unknown',
      assignmentTitle: g.subject?.name || 'Unknown',
      score: g.score,
      maxScore: g.maxScore || 100,
      percentage: Math.round((g.score / (g.maxScore || 100)) * 100),
    }));
  }
}

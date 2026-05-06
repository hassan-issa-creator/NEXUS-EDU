import { Injectable, NotFoundException } from '@nestjs/common';
import { AttendanceStatus, InvoiceStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma.service';

type ChartPoint = { label: string; value: number };

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private getSchoolWhere(schoolId?: string | null) {
    return schoolId ? { schoolId } : {};
  }

  private round(value: number) {
    return Math.round(value * 10) / 10;
  }

  private monthLabel(date: Date) {
    return date.toLocaleString('en-US', { month: 'short' });
  }

  private buildSeries<T extends { createdAt?: Date; paidAt?: Date }>(
    items: T[],
    dateField: 'createdAt' | 'paidAt',
  ) {
    const monthly = new Map<string, number>();

    items.forEach((item) => {
      const value = item[dateField];
      if (!value) {
        return;
      }

      const label = this.monthLabel(value);
      monthly.set(label, (monthly.get(label) ?? 0) + 1);
    });

    return Array.from(monthly.entries()).map(([label, value]) => ({ label, value }));
  }

  private buildRevenueSeries(items: Array<{ paidAt: Date | null; amount: number }>) {
    const monthly = new Map<string, number>();

    items.forEach((item) => {
      if (!item.paidAt) {
        return;
      }

      const label = this.monthLabel(item.paidAt);
      monthly.set(label, (monthly.get(label) ?? 0) + Number(item.amount));
    });

    return Array.from(monthly.entries()).map(([label, value]) => ({
      label,
      value: this.round(value),
    }));
  }

  async getStudentDashboard(userId: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrollments: {
          include: {
            class: {
              include: {
                subjects: {
                  include: {
                    teacher: {
                      select: { id: true, name: true, email: true },
                    },
                    lessons: true,
                    assignments: {
                      include: {
                        submissions: {
                          where: { studentId: userId },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        studentGrades: {
          include: {
            subject: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        attendance: {
          orderBy: { date: 'desc' },
          take: 60,
        },
        submissions: {
          include: {
            assignment: {
              include: {
                subject: {
                  select: { id: true, name: true },
                },
              },
            },
          },
          orderBy: { submittedAt: 'desc' },
        },
        achievements: {
          include: {
            achievement: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const subjects = student.enrollments.flatMap((enrollment) => enrollment.class.subjects);
    const subjectMap = new Map<string, (typeof subjects)[number]>();
    subjects.forEach((subject) => subjectMap.set(subject.id, subject));
    const uniqueSubjects = Array.from(subjectMap.values());

    const allAssignments = uniqueSubjects.flatMap((subject) =>
      subject.assignments.map((assignment) => {
        const submission = assignment.submissions[0] ?? null;
        const status = submission?.gradedAt
          ? 'graded'
          : submission
            ? 'submitted'
            : 'pending';

        return {
          id: assignment.id,
          title: assignment.title,
          description: assignment.description,
          dueDate: assignment.dueDate,
          subject: {
            id: subject.id,
            name: subject.name,
          },
          status,
          grade: submission?.grade ?? submission?.score ?? null,
        };
      }),
    );

    const pendingAssignments = allAssignments.filter((assignment) => assignment.status === 'pending');
    const completedAssignments = allAssignments.filter((assignment) => assignment.status !== 'pending');

    const attendanceBreakdown = {
      present: student.attendance.filter((entry) => entry.status === AttendanceStatus.PRESENT).length,
      absent: student.attendance.filter((entry) => entry.status === AttendanceStatus.ABSENT).length,
      late: student.attendance.filter((entry) => entry.status === AttendanceStatus.LATE).length,
      excused: student.attendance.filter((entry) => entry.status === AttendanceStatus.EXCUSED).length,
    };

    const attendanceCount = student.attendance.length || 1;
    const attendanceRate =
      ((attendanceBreakdown.present + attendanceBreakdown.late + attendanceBreakdown.excused) /
        attendanceCount) *
      100;

    const averageGrade =
      student.studentGrades.length > 0
        ? student.studentGrades.reduce(
            (sum, grade) => sum + (Number(grade.grade) / Number(grade.maxScore)) * 100,
            0,
          ) / student.studentGrades.length
        : 0;

    const weeklyActivity = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const label = date.toLocaleString('en-US', { weekday: 'short' });
      const submissions = student.submissions.filter(
        (submission) =>
          submission.submittedAt.toDateString() === date.toDateString(),
      ).length;
      const attendanceEntry = student.attendance.find(
        (entry) => entry.date.toDateString() === date.toDateString(),
      );
      return {
        label,
        submissions,
        attended:
          attendanceEntry?.status === AttendanceStatus.PRESENT ||
          attendanceEntry?.status === AttendanceStatus.LATE
            ? 1
            : 0,
      };
    });

    const subjectPerformance = uniqueSubjects.map((subject) => {
      const grades = student.studentGrades.filter((grade) => grade.subjectId === subject.id);
      const average =
        grades.length > 0
          ? grades.reduce((sum, grade) => sum + (Number(grade.grade) / Number(grade.maxScore)) * 100, 0) /
            grades.length
          : 0;

      const totalAssignments = subject.assignments.length;
      const submitted = subject.assignments.filter((assignment) => assignment.submissions.length > 0).length;
      const progress = totalAssignments > 0 ? (submitted / totalAssignments) * 100 : 0;

      return {
        id: subject.id,
        name: subject.name,
        teacher: subject.teacher?.name ?? subject.teacher?.email ?? 'Unassigned',
        averageGrade: this.round(average),
        progress: this.round(progress),
        totalLessons: subject.lessons.length,
        totalAssignments,
        submittedAssignments: submitted,
      };
    });

    return {
      student: {
        id: student.id,
        name: student.name ?? student.email,
        schoolId: student.schoolId,
      },
      summary: {
        totalSubjects: uniqueSubjects.length,
        pendingAssignments: pendingAssignments.length,
        completedAssignments: completedAssignments.length,
        attendanceRate: this.round(attendanceRate),
        averageGrade: this.round(averageGrade),
      },
      upcomingAssignments: pendingAssignments
        .sort((a, b) => {
          const first = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          const second = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          return first - second;
        })
        .slice(0, 5),
      attendance: attendanceBreakdown,
      weeklyActivity,
      subjectPerformance,
      gamification: {
        level: student.level,
        totalXP: student.totalXP,
        streakDays: student.streakDays,
        achievementsUnlocked: student.achievements.length,
      },
    };
  }

  async getTeacherDashboard(userId: string) {
    const teacher = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        taughtClasses: {
          include: {
            students: true,
            subjects: true,
          },
        },
        taughtSubjects: {
          include: {
            lessons: true,
            assignments: {
              include: {
                submissions: true,
              },
            },
            grades: true,
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const classIds = teacher.taughtClasses.map((item) => item.id);
    const recentAttendance = await this.prisma.attendance.findMany({
      where: {
        classId: { in: classIds.length > 0 ? classIds : ['__none__'] },
        date: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const gradingQueue = await this.prisma.submission.findMany({
      where: {
        assignment: {
          teacherId: userId,
        },
        gradedAt: null,
      },
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
        assignment: {
          select: { id: true, title: true, dueDate: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: 8,
    });

    const recentAssignments = await this.prisma.assignment.findMany({
      where: { teacherId: userId },
      include: {
        subject: {
          select: { id: true, name: true },
        },
        _count: {
          select: { submissions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    const totalStudents = teacher.taughtClasses.reduce(
      (sum, classItem) => sum + classItem.students.length,
      0,
    );
    const totalAssignments = teacher.taughtSubjects.reduce(
      (sum, subject) => sum + subject.assignments.length,
      0,
    );
    const totalLessons = teacher.taughtSubjects.reduce(
      (sum, subject) => sum + subject.lessons.length,
      0,
    );

    const presentAttendance = recentAttendance.filter(
      (entry) => entry.status === AttendanceStatus.PRESENT || entry.status === AttendanceStatus.LATE,
    ).length;
    const attendanceRate =
      recentAttendance.length > 0
        ? (presentAttendance / recentAttendance.length) * 100
        : 0;

    const classPerformance = teacher.taughtClasses.map((classItem) => {
      const classGrades = teacher.taughtSubjects
        .filter((subject) => subject.classId === classItem.id)
        .flatMap((subject) => subject.grades);
      const averageGrade =
        classGrades.length > 0
          ? classGrades.reduce(
              (sum, grade) => sum + (Number(grade.grade) / Number(grade.maxScore)) * 100,
              0,
            ) / classGrades.length
          : 0;

      return {
        id: classItem.id,
        name: classItem.name,
        studentCount: classItem.students.length,
        subjectCount: classItem.subjects.length,
        averageGrade: this.round(averageGrade),
      };
    });

    return {
      teacher: {
        id: teacher.id,
        name: teacher.name ?? teacher.email,
        schoolId: teacher.schoolId,
      },
      summary: {
        totalClasses: teacher.taughtClasses.length,
        totalStudents,
        totalAssignments,
        totalLessons,
        pendingSubmissions: gradingQueue.length,
        attendanceRate: this.round(attendanceRate),
      },
      classPerformance,
      recentAssignments: recentAssignments.map((assignment) => ({
        id: assignment.id,
        title: assignment.title,
        subject: assignment.subject?.name ?? 'Unknown subject',
        dueDate: assignment.dueDate,
        submissions: assignment._count.submissions,
      })),
      gradingQueue: gradingQueue.map((submission) => ({
        id: submission.id,
        submittedAt: submission.submittedAt,
        assignment: submission.assignment,
        student: submission.student,
      })),
      attendanceSummary: {
        totalRecords: recentAttendance.length,
        present: recentAttendance.filter((entry) => entry.status === AttendanceStatus.PRESENT).length,
        late: recentAttendance.filter((entry) => entry.status === AttendanceStatus.LATE).length,
        absent: recentAttendance.filter((entry) => entry.status === AttendanceStatus.ABSENT).length,
      },
    };
  }

  async getAdminDashboard(userId: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        schoolId: true,
        role: true,
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const scope = this.getSchoolWhere(admin.schoolId);
    const [users, classes, subjects, invoices, auditLogs] = await Promise.all([
      this.prisma.user.findMany({
        where: scope,
        select: { id: true, role: true, createdAt: true, isActive: true },
      }),
      this.prisma.class.findMany({
        where: scope,
        include: {
          students: true,
        },
      }),
      this.prisma.subject.findMany({
        where: scope,
        select: { id: true },
      }),
      this.prisma.invoice.findMany({
        where: scope,
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          paidAt: true,
        },
      }),
      this.prisma.auditLog.findMany({
        where: scope,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const students = users.filter((user) => user.role === Role.STUDENT);
    const teachers = users.filter((user) => user.role === Role.TEACHER);
    const activeUsers = users.filter((user) => user.isActive).length;
    const paidInvoices = invoices.filter((invoice) => invoice.status === InvoiceStatus.PAID);
    const totalRevenue = paidInvoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0);
    const failedInvoices = invoices.filter((invoice) => invoice.status === InvoiceStatus.FAILED).length;

    return {
      admin: {
        id: admin.id,
        name: admin.name ?? admin.email,
        schoolId: admin.schoolId,
      },
      kpis: {
        totalUsers: users.length,
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalClasses: classes.length,
        totalSubjects: subjects.length,
        activeUsers,
        totalRevenue: this.round(totalRevenue),
      },
      enrollmentSeries: this.buildSeries(students, 'createdAt'),
      revenueSeries: this.buildRevenueSeries(
        paidInvoices.map((invoice) => ({
          paidAt: invoice.paidAt,
          amount: Number(invoice.amount),
        })),
      ),
      invoiceSummary: {
        total: invoices.length,
        paid: paidInvoices.length,
        pending: invoices.filter((invoice) => invoice.status === InvoiceStatus.PENDING).length,
        requiresAction: invoices.filter((invoice) => invoice.status === InvoiceStatus.REQUIRES_ACTION).length,
        failed: failedInvoices,
        refunded: invoices.filter((invoice) => invoice.status === InvoiceStatus.REFUNDED).length,
      },
      recentActivity: auditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        actor: log.user?.name ?? log.user?.email ?? 'System',
        createdAt: log.createdAt,
      })),
      systemHealth: [
        {
          name: 'Users',
          status: activeUsers > 0 ? 'healthy' : 'warning',
          value: activeUsers,
          detail: `${activeUsers} active users`,
        },
        {
          name: 'Payments',
          status: failedInvoices > 0 ? 'warning' : 'healthy',
          value: paidInvoices.length,
          detail: `${paidInvoices.length} paid invoices`,
        },
        {
          name: 'Classes',
          status: classes.length > 0 ? 'healthy' : 'warning',
          value: classes.length,
          detail: `${classes.reduce((sum, item) => sum + item.students.length, 0)} enrollments`,
        },
      ],
    };
  }
}

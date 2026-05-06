import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Grade, AttendanceStatus } from '@prisma/client';

export interface StudentProgressPoint {
  date: string;
  averageGrade: number;
  attendanceRate: number;
  assignmentsCompleted: number;
  overallScore: number;
}

export interface ClassComparison {
  studentAverage: number;
  classAverage: number;
  studentRank: number;
  totalStudents: number;
  percentile: number;
}

export interface EarlyWarning {
  studentId: string;
  studentName: string;
  alerts: {
    type: 'GRADE_DROP' | 'LOW_ATTENDANCE' | 'MISSING_ASSIGNMENTS' | 'BEHAVIOR';
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    message: string;
    value: number;
    threshold: number;
  }[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ParentReport {
  studentInfo: {
    name: string;
    class: string;
    period: string;
  };
  summary: {
    overallGrade: number;
    attendanceRate: number;
    assignmentsCompleted: number;
    totalAssignments: number;
    behaviorScore: number;
    rank: number;
    totalStudents: number;
  };
  subjects: {
    name: string;
    grade: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
  }[];
  attendance: {
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
  recentGrades: {
    subject: string;
    assignment: string;
    score: number;
    maxScore: number;
    date: Date;
  }[];
  recommendations: string[];
}

@Injectable()
export class StudentAnalyticsService {
  constructor(private prisma: PrismaService) { }

  /**
   * Get student progress over time (for charts)
   */
  async getStudentProgress(
    studentId: string,
    days: number = 30,
  ): Promise<StudentProgressPoint[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all grades in the period
    const grades = await this.prisma.grade.findMany({
      where: {
        studentId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Get all attendance in the period
    const attendance = await this.prisma.attendance.findMany({
      where: {
        studentId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    // Get submissions in the period
    const submissions = await this.prisma.submission.findMany({
      where: {
        studentId,
        submittedAt: { gte: startDate },
      },
      orderBy: { submittedAt: 'asc' },
    });

    // Group by week
    const progressMap = new Map<
      string,
      {
        grades: number[];
        presentDays: number;
        totalDays: number;
        submissions: number;
      }
    >();

    // Process grades
    grades.forEach((grade) => {
      const weekStart = this.getWeekStart(grade.createdAt);
      const existing = progressMap.get(weekStart) || {
        grades: [],
        presentDays: 0,
        totalDays: 0,
        submissions: 0,
      };
      existing.grades.push((Number(grade.grade) / Number(grade.maxScore)) * 100);
      progressMap.set(weekStart, existing);
    });

    // Process attendance
    attendance.forEach((record) => {
      const weekStart = this.getWeekStart(record.date);
      const existing = progressMap.get(weekStart) || {
        grades: [],
        presentDays: 0,
        totalDays: 0,
        submissions: 0,
      };
      existing.totalDays++;
      if (record.status === 'PRESENT' || record.status === 'LATE') {
        existing.presentDays++;
      }
      progressMap.set(weekStart, existing);
    });

    // Process submissions
    submissions.forEach((submission) => {
      const weekStart = this.getWeekStart(submission.submittedAt);
      const existing = progressMap.get(weekStart) || {
        grades: [],
        presentDays: 0,
        totalDays: 0,
        submissions: 0,
      };
      existing.submissions++;
      progressMap.set(weekStart, existing);
    });

    // Convert to progress points
    const progressPoints: StudentProgressPoint[] = [];
    progressMap.forEach((data, date) => {
      const averageGrade =
        data.grades.length > 0
          ? data.grades.reduce((a, b) => a + b, 0) / data.grades.length
          : 0;
      const attendanceRate =
        data.totalDays > 0 ? (data.presentDays / data.totalDays) * 100 : 100;

      progressPoints.push({
        date,
        averageGrade: Math.round(averageGrade * 10) / 10,
        attendanceRate: Math.round(attendanceRate * 10) / 10,
        assignmentsCompleted: data.submissions,
        overallScore:
          Math.round(
            (averageGrade * 0.6 + attendanceRate * 0.3 + data.submissions * 2) *
            10,
          ) / 10,
      });
    });

    return progressPoints.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Compare student with their class
   */
  async getClassComparison(studentId: string): Promise<ClassComparison> {
    // Get student's class
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { studentId },
      include: { class: true },
    });

    if (!enrollment) {
      return {
        studentAverage: 0,
        classAverage: 0,
        studentRank: 0,
        totalStudents: 0,
        percentile: 0,
      };
    }

    // Get all students in the class
    const classEnrollments = await this.prisma.enrollment.findMany({
      where: { classId: enrollment.classId },
      select: { studentId: true },
    });

    const studentIds = classEnrollments.map((e) => e.studentId);

    // Get grades for all students
    const allGrades = await this.prisma.grade.findMany({
      where: { studentId: { in: studentIds } },
    });

    // Calculate averages per student
    const studentAverages: { studentId: string; average: number }[] = [];

    for (const sid of studentIds) {
      const studentGrades = allGrades.filter((g) => g.studentId === sid);
      if (studentGrades.length > 0) {
        const avg =
          studentGrades.reduce(
            (sum, g) => sum + (Number(g.grade) / Number(g.maxScore)) * 100,
            0,
          ) / studentGrades.length;
        studentAverages.push({ studentId: sid, average: avg });
      } else {
        studentAverages.push({ studentId: sid, average: 0 });
      }
    }

    // Sort by average
    studentAverages.sort((a, b) => b.average - a.average);

    // Find student's position
    const studentData = studentAverages.find((s) => s.studentId === studentId);
    const studentRank =
      studentAverages.findIndex((s) => s.studentId === studentId) + 1;
    const classAverage =
      studentAverages.reduce((sum, s) => sum + s.average, 0) /
      studentAverages.length;

    return {
      studentAverage: Math.round((studentData?.average || 0) * 10) / 10,
      classAverage: Math.round(classAverage * 10) / 10,
      studentRank,
      totalStudents: studentAverages.length,
      percentile: Math.round(
        ((studentAverages.length - studentRank + 1) / studentAverages.length) *
        100,
      ),
    };
  }

  /**
   * Early Warning System - Detect at-risk students
   */
  async getEarlyWarnings(classId?: string): Promise<EarlyWarning[]> {
    // Get students (either all or from specific class)
    let studentIds: string[] = [];

    if (classId) {
      const enrollments = await this.prisma.enrollment.findMany({
        where: { classId },
        select: { studentId: true },
      });
      studentIds = enrollments.map((e) => e.studentId);
    } else {
      const students = await this.prisma.user.findMany({
        where: { role: 'STUDENT', isActive: true },
        select: { id: true },
      });
      studentIds = students.map((s) => s.id);
    }

    const warnings: EarlyWarning[] = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const studentId of studentIds) {
      const student = await this.prisma.user.findUnique({
        where: { id: studentId },
        select: {
          name: true,
          firstName: true,
          lastName: true,
          behaviorScore: true,
        },
      });

      const alerts: EarlyWarning['alerts'] = [];

      // Check grades
      const recentGrades = await this.prisma.grade.findMany({
        where: { studentId, createdAt: { gte: thirtyDaysAgo } },
      });

      if (recentGrades.length > 0) {
        const avgGrade =
          recentGrades.reduce(
            (sum, g) => sum + (Number(g.grade) / Number(g.maxScore)) * 100,
            0,
          ) / recentGrades.length;

        if (avgGrade < 50) {
          alerts.push({
            type: 'GRADE_DROP',
            severity: avgGrade < 30 ? 'HIGH' : 'MEDIUM',
            message: `متوسط الدرجات ${avgGrade.toFixed(1)}% أقل من الحد الأدنى`,
            value: avgGrade,
            threshold: 50,
          });
        }
      }

      // Check attendance
      const attendance = await this.prisma.attendance.findMany({
        where: { studentId, date: { gte: thirtyDaysAgo } },
      });

      if (attendance.length > 0) {
        const presentCount = attendance.filter(
          (a) => a.status === 'PRESENT' || a.status === 'LATE',
        ).length;
        const attendanceRate = (presentCount / attendance.length) * 100;

        if (attendanceRate < 80) {
          alerts.push({
            type: 'LOW_ATTENDANCE',
            severity: attendanceRate < 60 ? 'HIGH' : 'MEDIUM',
            message: `نسبة الحضور ${attendanceRate.toFixed(1)}% أقل من المطلوب`,
            value: attendanceRate,
            threshold: 80,
          });
        }
      }

      // Check missing assignments
      const enrollment = await this.prisma.enrollment.findFirst({
        where: { studentId },
        include: {
          class: {
            include: {
              subjects: {
                include: {
                  assignments: {
                    where: { dueDate: { lte: new Date() } },
                  },
                },
              },
            },
          },
        },
      });

      if (enrollment) {
        let totalAssignments = 0;
        enrollment.class.subjects.forEach((subject) => {
          totalAssignments += subject.assignments.length;
        });

        const submissions = await this.prisma.submission.count({
          where: { studentId },
        });

        const missingCount = totalAssignments - submissions;
        if (missingCount > 2) {
          alerts.push({
            type: 'MISSING_ASSIGNMENTS',
            severity: missingCount > 5 ? 'HIGH' : 'MEDIUM',
            message: `${missingCount} واجبات غير مسلمة`,
            value: missingCount,
            threshold: 2,
          });
        }
      }

      // Check behavior
      if (student?.behaviorScore && student.behaviorScore < 60) {
        alerts.push({
          type: 'BEHAVIOR',
          severity: student.behaviorScore < 40 ? 'HIGH' : 'MEDIUM',
          message: `درجة السلوك ${student.behaviorScore} تحتاج متابعة`,
          value: student.behaviorScore,
          threshold: 60,
        });
      }

      // Only add if there are alerts
      if (alerts.length > 0) {
        const highCount = alerts.filter((a) => a.severity === 'HIGH').length;
        const mediumCount = alerts.filter(
          (a) => a.severity === 'MEDIUM',
        ).length;

        let riskLevel: EarlyWarning['riskLevel'] = 'LOW';
        if (highCount >= 2) riskLevel = 'CRITICAL';
        else if (highCount >= 1) riskLevel = 'HIGH';
        else if (mediumCount >= 2) riskLevel = 'MEDIUM';

        warnings.push({
          studentId,
          studentName:
            student?.name ||
            `${student?.firstName || ''} ${student?.lastName || ''}`.trim() ||
            'Unknown',
          alerts,
          riskLevel,
        });
      }
    }

    // Sort by risk level
    const riskOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return warnings.sort(
      (a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel],
    );
  }

  /**
   * Generate Parent Report
   */
  async getParentReport(
    studentId: string,
    period: 'week' | 'month' = 'month',
  ): Promise<ParentReport> {
    const days = period === 'week' ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get student info
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          include: { class: true },
        },
      },
    });

    // Get grades
    const grades = await this.prisma.grade.findMany({
      where: { studentId },
      include: { subject: true },
      orderBy: { createdAt: 'desc' },
    });

    // Get recent grades
    const recentGrades = grades.filter((g) => g.createdAt >= startDate);

    // Get attendance
    const attendance = await this.prisma.attendance.findMany({
      where: { studentId, date: { gte: startDate } },
    });

    // Get submissions
    const submissions = await this.prisma.submission.findMany({
      where: { studentId, submittedAt: { gte: startDate } },
      include: { assignment: { include: { subject: true } } },
    });

    // Get class comparison for rank
    const comparison = await this.getClassComparison(studentId);

    // Calculate subject grades
    const subjectGrades = new Map<
      string,
      { grades: number[]; previous: number[] }
    >();

    grades.forEach((g) => {
      const subjectName = g.subject?.name || 'Unknown';
      const existing = subjectGrades.get(subjectName) || {
        grades: [],
        previous: [],
      };
      const score = (Number(g.grade) / Number(g.maxScore)) * 100;

      if (g.createdAt >= startDate) {
        existing.grades.push(score);
      } else {
        existing.previous.push(score);
      }
      subjectGrades.set(subjectName, existing);
    });

    const subjects: ParentReport['subjects'] = [];
    subjectGrades.forEach((data, name) => {
      const currentAvg =
        data.grades.length > 0
          ? data.grades.reduce((a, b) => a + b, 0) / data.grades.length
          : 0;
      const previousAvg =
        data.previous.length > 0
          ? data.previous.reduce((a, b) => a + b, 0) / data.previous.length
          : currentAvg;

      let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
      if (currentAvg > previousAvg + 5) trend = 'UP';
      else if (currentAvg < previousAvg - 5) trend = 'DOWN';

      subjects.push({
        name,
        grade: Math.round(currentAvg * 10) / 10,
        trend,
      });
    });

    // Calculate attendance stats
    const attendanceStats = {
      present: attendance.filter((a) => a.status === 'PRESENT').length,
      absent: attendance.filter((a) => a.status === 'ABSENT').length,
      late: attendance.filter((a) => a.status === 'LATE').length,
      excused: attendance.filter((a) => a.status === 'EXCUSED').length,
    };

    // Get total assignments for the period
    const enrollment = student?.enrollments[0];
    let totalAssignments = 0;
    if (enrollment) {
      const classSubjects = await this.prisma.subject.findMany({
        where: { classId: enrollment.classId },
        include: {
          assignments: {
            where: {
              createdAt: { gte: startDate },
            },
          },
        },
      });
      classSubjects.forEach((s) => {
        totalAssignments += s.assignments.length;
      });
    }

    // Generate recommendations
    const recommendations: string[] = [];
    const overallGrade =
      recentGrades.length > 0
        ? recentGrades.reduce(
          (sum, g) => sum + (Number(g.grade) / Number(g.maxScore)) * 100,
          0,
        ) / recentGrades.length
        : 0;
    const attendanceRate =
      attendance.length > 0
        ? ((attendanceStats.present + attendanceStats.late) /
          attendance.length) *
        100
        : 100;

    if (overallGrade < 60) {
      recommendations.push(
        'يُنصح بمتابعة الطالب في الدروس الخصوصية لتحسين المستوى الأكاديمي',
      );
    }
    if (attendanceStats.absent > 3) {
      recommendations.push(
        'يُرجى متابعة انتظام الحضور، الغياب المتكرر يؤثر على التحصيل',
      );
    }
    if (submissions.length < totalAssignments * 0.7) {
      recommendations.push('يُنصح بتشجيع الطالب على تسليم الواجبات في موعدها');
    }
    if (subjects.some((s) => s.trend === 'DOWN')) {
      const downSubjects = subjects
        .filter((s) => s.trend === 'DOWN')
        .map((s) => s.name);
      recommendations.push(
        `يحتاج الطالب لمتابعة في: ${downSubjects.join('، ')}`,
      );
    }
    if (recommendations.length === 0) {
      recommendations.push('أداء الطالب ممتاز! استمروا في التشجيع والمتابعة');
    }

    return {
      studentInfo: {
        name:
          student?.name ||
          `${student?.firstName || ''} ${student?.lastName || ''}`.trim() ||
          'Unknown',
        class: enrollment?.class.name || 'غير محدد',
        period: period === 'week' ? 'أسبوعي' : 'شهري',
      },
      summary: {
        overallGrade: Math.round(overallGrade * 10) / 10,
        attendanceRate: Math.round(attendanceRate * 10) / 10,
        assignmentsCompleted: submissions.length,
        totalAssignments,
        behaviorScore: student?.behaviorScore || 75,
        rank: comparison.studentRank,
        totalStudents: comparison.totalStudents,
      },
      subjects,
      attendance: attendanceStats,
      recentGrades: submissions.slice(0, 5).map((s) => ({
        subject: s.assignment.subject?.name || 'Unknown',
        assignment: s.assignment.title,
        score: Number(s.grade) || 0,
        maxScore: Number(s.assignment.maxScore),
        date: s.submittedAt,
      })),
      recommendations,
    };
  }

  // Helper function to get week start date
  private getWeekStart(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split('T')[0] || '';
  }
}

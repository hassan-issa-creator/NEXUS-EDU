import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as ExcelJS from 'exceljs';

export interface ExcelExportOptions {
  fileName: string;
  sheetName: string;
  headers: string[];
  data: any[][];
  rtl?: boolean;
}

@Injectable()
export class ExcelExportService {
  constructor(private prisma: PrismaService) { }

  /**
   * Create basic Excel file with data
   */
  async createExcel(options: ExcelExportOptions): Promise<any> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(options.sheetName, {
      properties: { tabColor: { argb: '667eea' } },
      views: [{ rightToLeft: options.rtl ?? true }],
    });

    // Add headers with styling
    const headerRow = worksheet.addRow(options.headers);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 12 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '667eea' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 30;

    // Add data rows
    options.data.forEach((row) => {
      const dataRow = worksheet.addRow(row);
      dataRow.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Auto-fit columns
    // worksheet.columns.forEach((column) => {
    //   let maxLength = 0;
    //   if (column && column.eachCell) {
    //     column.eachCell({ includeEmpty: true }, (cell) => {
    //       const columnLength = cell.value ? String(cell.value).length : 10;
    //       if (columnLength > maxLength) {
    //         maxLength = columnLength;
    //       }
    //     });
    //     column.width = Math.min(maxLength + 5, 50);
    //   }
    // });

    // Add borders
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    return workbook.xlsx.writeBuffer();
  }

  /**
   * Export student grades (From Submissions)
   */
  async exportStudentGrades(studentId: string): Promise<any> {
    const submissions = await this.prisma.submission.findMany({
      where: {
        studentId,
        grade: { not: null },
      },
      include: {
        assignment: {
          include: { subject: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const headers = [
      'المادة',
      'التقييم',
      'الدرجة',
      'الدرجة العظمى',
      'النسبة المئوية',
      'التاريخ',
    ];
    const data = submissions.map((sub) => [
      sub.assignment.subject?.name || 'Unknown',
      sub.assignment.title,
      sub.grade || 0,
      sub.assignment.maxScore || 100,
      `${Math.round(((Number(sub.grade) || 0) / (Number(sub.assignment.maxScore) || 100)) * 100)}%`,
      new Date(sub.gradedAt || sub.submittedAt).toLocaleDateString('ar-EG'),
    ]);

    return this.createExcel({
      fileName: 'student_grades.xlsx',
      sheetName: 'الدرجات',
      headers,
      data,
      rtl: true,
    });
  }

  /**
   * Export class attendance report
   */
  async exportClassAttendance(
    classId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const attendanceRecords = await this.prisma.attendance.findMany({
      where: {
        student: {
          enrollments: {
            some: { classId },
          },
        },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        student: true,
      },
      orderBy: [{ date: 'asc' }, { student: { name: 'asc' } }],
    });

    const headers = ['اسم الطالب', 'التاريخ', 'الحالة', 'ملاحظات'];
    const data = attendanceRecords.map((record) => [
      record.student.name || record.student.firstName || '',
      new Date(record.date).toLocaleDateString('ar-EG'),
      record.status === 'PRESENT'
        ? 'حاضر'
        : record.status === 'ABSENT'
          ? 'غائب'
          : 'متأخر',
      record.notes || '-',
    ]);

    return this.createExcel({
      fileName: 'class_attendance.xlsx',
      sheetName: 'الحضور والغياب',
      headers,
      data,
      rtl: true,
    });
  }

  /**
   * Export comprehensive student report
   */
  async exportStudentReport(studentId: string): Promise<any> {
    const workbook = new ExcelJS.Workbook();

    // Sheet 1: Student Info
    const infoSheet = workbook.addWorksheet('معلومات الطالب', {
      views: [{ rightToLeft: true }],
    });

    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          include: { class: true },
        },
      },
    });

    if (student) {
      infoSheet.addRow(['الاسم', student.name || student.firstName || '']);
      infoSheet.addRow(['البريد الإلكتروني', student.email]);
      infoSheet.addRow(['الصف', student.enrollments[0]?.class.name || '-']);
      infoSheet.addRow([
        'تاريخ التسجيل',
        new Date(student.createdAt).toLocaleDateString('ar-EG'),
      ]);
    }

    // Sheet 2: Grades (Submissions)
    const submissions = await this.prisma.submission.findMany({
      where: {
        studentId,
        grade: { not: null },
      },
      include: { assignment: { include: { subject: true } } },
      orderBy: { submittedAt: 'desc' },
    });

    const gradesSheet = workbook.addWorksheet('الدرجات', {
      views: [{ rightToLeft: true }],
    });

    const gradeHeaders = gradesSheet.addRow([
      'المادة',
      'التقييم',
      'الدرجة',
      'النسبة المئوية',
      'التاريخ',
    ]);
    gradeHeaders.font = { bold: true };
    gradeHeaders.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '667eea' },
    };

    submissions.forEach((sub) => {
      gradesSheet.addRow([
        sub.assignment.subject?.name || 'Unknown',
        sub.assignment.title,
        `${sub.grade}/${sub.assignment.maxScore || 100}`,
        `${Math.round(((Number(sub.grade) || 0) / (Number(sub.assignment.maxScore) || 100)) * 100)}%`,
        new Date(sub.gradedAt || sub.submittedAt).toLocaleDateString('ar-EG'),
      ]);
    });

    // Sheet 3: Attendance
    const attendance = await this.prisma.attendance.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
      take: 50,
    });

    const attendanceSheet = workbook.addWorksheet('الحضور', {
      views: [{ rightToLeft: true }],
    });

    const attendanceHeaders = attendanceSheet.addRow([
      'التاريخ',
      'الحالة',
      'ملاحظات',
    ]);
    attendanceHeaders.font = { bold: true };
    attendanceHeaders.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '10b981' },
    };

    attendance.forEach((record) => {
      attendanceSheet.addRow([
        new Date(record.date).toLocaleDateString('ar-EG'),
        record.status === 'PRESENT'
          ? 'حاضر'
          : record.status === 'ABSENT'
            ? 'غائب'
            : 'متأخر',
        record.notes || '-',
      ]);
    });

    return workbook.xlsx.writeBuffer();
  }

  /**
   * Export all students grades for a subject
   */
  async exportSubjectGrades(subjectId: string): Promise<any> {
    const submissions = await this.prisma.submission.findMany({
      where: {
        assignment: { subjectId },
        grade: { not: null },
      },
      include: {
        student: true,
        assignment: true,
      },
      orderBy: [{ student: { name: 'asc' } }, { submittedAt: 'desc' }],
    });

    const headers = [
      'اسم الطالب',
      'التقييم',
      'الدرجة',
      'الدرجة العظمى',
      'النسبة المئوية',
      'التاريخ',
    ];
    const data = submissions.map((sub) => [
      sub.student.name || sub.student.firstName || '',
      sub.assignment.title,
      sub.grade,
      sub.assignment.maxScore || 100,
      `${Math.round(((Number(sub.grade) || 0) / (Number(sub.assignment.maxScore) || 100)) * 100)}%`,
      new Date(sub.gradedAt || sub.submittedAt).toLocaleDateString('ar-EG'),
    ]);

    return this.createExcel({
      fileName: 'subject_grades.xlsx',
      sheetName: 'درجات المادة',
      headers,
      data,
      rtl: true,
    });
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(studentId: string): Promise<any> {
    const headers = [
      'المادة',
      'المعدل',
      'أعلى درجة',
      'أقل درجة',
      'عدد التقييمات',
    ];

    // Aggregate data by subject (Using Submissions)
    const subjects = await this.prisma.subject.findMany({
      include: {
        assignments: {
          include: {
            submissions: {
              where: { studentId, grade: { not: null } },
            },
          },
        },
      },
    });

    const data = subjects
      .map((subject) => {
        // Flatten submissions for this subject
        const scores = subject.assignments.flatMap((a) =>
          a.submissions.map((s) => Number(s.grade) || 0),
        );

        if (scores.length === 0) return null;

        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        const max = Math.max(...scores);
        const min = Math.min(...scores);

        return [subject.name, Math.round(avg), max, min, scores.length];
      })
      .filter((row) => row !== null);

    return this.createExcel({
      fileName: 'student_analytics.xlsx',
      sheetName: 'التحليلات',
      headers,
      data: data as any[][],
      rtl: true,
    });
  }
}

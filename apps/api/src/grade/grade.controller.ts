import { Controller, Get, UseGuards, Request, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response, Request as ExpressRequest } from 'express';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { RolesGuard } from '../auth/roles.guard';

interface RequestWithUser extends ExpressRequest {
  user: {
    id: string;
    sub?: string;
    email: string;
    role: Role;
  };
}

@Controller('grades')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class GradesController {
  @Get()
  @Roles(Role.STUDENT, Role.TEACHER, Role.PARENT)
  getGrades() {
    // Mock data - in production, fetch from database
    const grades = [
      {
        id: '1',
        subjectId: '101',
        subjectName: 'Mathematics',
        subjectCode: 'MATH101',
        grade: 92,
        maxGrade: 100,
        percentage: 92,
        letterGrade: 'A',
        teacherName: 'Dr. Ahmed Hassan',
        semester: 'Fall 2024',
        lastUpdated: new Date('2024-12-01'),
        assignments: [
          { name: 'Homework 1', grade: 95 },
          { name: 'Quiz 1', grade: 88 },
          { name: 'Midterm', grade: 92 },
        ],
      },
      {
        id: '2',
        subjectId: '102',
        subjectName: 'Physics',
        subjectCode: 'PHYS101',
        grade: 88,
        maxGrade: 100,
        percentage: 88,
        letterGrade: 'B+',
        teacherName: 'Prof. Sarah Ali',
        semester: 'Fall 2024',
        lastUpdated: new Date('2024-11-28'),
        assignments: [
          { name: 'Lab Report 1', grade: 90 },
          { name: 'Quiz 1', grade: 85 },
          { name: 'Midterm', grade: 88 },
        ],
      },
      {
        id: '3',
        subjectId: '103',
        subjectName: 'Chemistry',
        subjectCode: 'CHEM101',
        grade: 85,
        maxGrade: 100,
        percentage: 85,
        letterGrade: 'B',
        teacherName: 'Dr. Mohammed Khalil',
        semester: 'Fall 2024',
        lastUpdated: new Date('2024-11-30'),
        assignments: [
          { name: 'Lab 1', grade: 88 },
          { name: 'Quiz 1', grade: 82 },
          { name: 'Midterm', grade: 85 },
        ],
      },
      {
        id: '4',
        subjectId: '104',
        subjectName: 'English Literature',
        subjectCode: 'ENG101',
        grade: 90,
        maxGrade: 100,
        percentage: 90,
        letterGrade: 'A-',
        teacherName: 'Ms. Fatima Ibrahim',
        semester: 'Fall 2024',
        lastUpdated: new Date('2024-12-02'),
        assignments: [
          { name: 'Essay 1', grade: 92 },
          { name: 'Presentation', grade: 88 },
          { name: 'Midterm', grade: 90 },
        ],
      },
      {
        id: '5',
        subjectId: '105',
        subjectName: 'Computer Science',
        subjectCode: 'CS101',
        grade: 95,
        maxGrade: 100,
        percentage: 95,
        letterGrade: 'A',
        teacherName: 'Eng. Omar Youssef',
        semester: 'Fall 2024',
        lastUpdated: new Date('2024-12-03'),
        assignments: [
          { name: 'Project 1', grade: 98 },
          { name: 'Quiz 1', grade: 92 },
          { name: 'Midterm', grade: 95 },
        ],
      },
    ];

    return {
      grades,
      summary: {
        totalSubjects: grades.length,
        averageGrade:
          grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length,
        letterGrade: 'A-',
        semester: 'Fall 2024',
      },
    };
  }

  @Get('report')
  @Roles(Role.STUDENT, Role.TEACHER, Role.PARENT)
  downloadReport(@Request() req: RequestWithUser, @Res() res: Response) {
    // Mock PDF content
    const mockPdfContent = `
Grade Report - Fall 2024
========================
Student: ${req.user.email}
Generated: ${new Date().toLocaleDateString()}

Mathematics: 92% (A)
Physics: 88% (B+)
Chemistry: 85% (B)
English Literature: 90% (A-)
Computer Science: 95% (A)

Overall Average: 90% (A-)
========================
    `.trim();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=grade-report.pdf',
    );

    res.send(Buffer.from(mockPdfContent));
  }
}

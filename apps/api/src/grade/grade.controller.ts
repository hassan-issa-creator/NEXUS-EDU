import { Controller, Get, UseGuards, Request, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response, Request as ExpressRequest } from 'express';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { RolesGuard } from '../auth/roles.guard';
import { GradeService } from './grade.service';

interface RequestWithUser extends ExpressRequest {
  user: {
    id: string;
    userId: string;
    sub?: string;
    email: string;
    role: Role;
  };
}

@Controller('grades')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class GradesController {
  constructor(private readonly gradeService: GradeService) {}

  @Get()
  @Roles(Role.STUDENT, Role.TEACHER, Role.PARENT)
  async getGrades(@Request() req: RequestWithUser) {
    const grades = await this.gradeService.findMyGrades(req.user.userId || req.user.sub || req.user.id);

    const mappedGrades = grades.map(g => {
      const percentage = (g.grade / (g.maxScore || 100)) * 100;
      let letterGrade = 'F';
      if (percentage >= 90) letterGrade = 'A';
      else if (percentage >= 80) letterGrade = 'B';
      else if (percentage >= 70) letterGrade = 'C';
      else if (percentage >= 60) letterGrade = 'D';

      return {
        id: g.id,
        subjectName: g.subject?.name || 'مادة غير معروفة',
        subjectCode: g.subject?.code || '---',
        grade: g.grade,
        maxGrade: g.maxScore || 100,
        percentage: Math.round(percentage),
        letterGrade,
        teacherName: 'غير محدد', // Can be fetched if needed
        semester: 'الفصل الأول 1446',
        assignments: [
          { name: 'الدرجة الكلية', grade: g.grade } // Fallback for assignments
        ]
      };
    });

    return {
      grades: mappedGrades,
      summary: {
        totalSubjects: grades.length,
        averageGrade: grades.length > 0 
          ? grades.reduce((sum, g) => sum + (g.grade / (g.maxScore || 100)) * 100, 0) / grades.length 
          : 0,
        letterGrade: grades.length > 0 ? (
          grades.reduce((sum, g) => sum + (g.grade / (g.maxScore || 100)) * 100, 0) / grades.length >= 90 ? 'A' :
          grades.reduce((sum, g) => sum + (g.grade / (g.maxScore || 100)) * 100, 0) / grades.length >= 80 ? 'B' :
          grades.reduce((sum, g) => sum + (g.grade / (g.maxScore || 100)) * 100, 0) / grades.length >= 70 ? 'C' : 'F'
        ) : '-',
        semester: 'الفصل الأول 1446'
      },
    };
  }

  @Get('report')
  @Roles(Role.STUDENT, Role.TEACHER, Role.PARENT)
  async downloadReport(@Request() req: RequestWithUser, @Res() res: Response) {
    const grades = await this.gradeService.findMyGrades(req.user.userId || req.user.sub || req.user.id);
    
    // Generate simple text report based on real data
    const gradesText = grades.map(g => `${g.subject?.name || 'Subject'}: ${g.grade}/${g.maxScore}`).join('\n');
    const average = grades.length > 0 
      ? grades.reduce((sum, g) => sum + (g.grade / g.maxScore) * 100, 0) / grades.length 
      : 0;

    const reportContent = `
Grade Report
========================
Student: ${req.user.email}
Generated: ${new Date().toLocaleDateString()}

${gradesText}

Overall Average: ${average.toFixed(2)}%
========================
    `.trim();

    res.setHeader('Content-Type', 'application/pdf'); // We can change this to text/plain if needed, but keeping pdf as mock implementation
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=grade-report.pdf',
    );

    res.send(Buffer.from(reportContent));
  }
}

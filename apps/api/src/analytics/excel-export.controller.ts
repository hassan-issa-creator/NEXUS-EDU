import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { ExcelExportService } from './excel-export.service';

@ApiTags('Excel Export')
@Controller('api/export')
@ApiBearerAuth()
export class ExcelExportController {
  constructor(private readonly excelService: ExcelExportService) {}

  @Get('student/:studentId/grades')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Export student grades as Excel' })
  @ApiResponse({ status: 200, description: 'Excel file generated' })
  async exportStudentGrades(
    @Param('studentId') studentId: string,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.excelService.exportStudentGrades(studentId);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=student_grades_${studentId}.xlsx`,
    );

    res.send(buffer);
  }

  @Get('student/:studentId/report')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Export comprehensive student report' })
  async exportStudentReport(
    @Param('studentId') studentId: string,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.excelService.exportStudentReport(studentId);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=student_report_${studentId}.xlsx`,
    );

    res.send(buffer);
  }

  @Get('student/:studentId/analytics')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Export student analytics' })
  async exportAnalytics(
    @Param('studentId') studentId: string,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.excelService.exportAnalytics(studentId);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=student_analytics_${studentId}.xlsx`,
    );

    res.send(buffer);
  }

  @Get('subject/:subjectId/grades')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Export all grades for a subject' })
  async exportSubjectGrades(
    @Param('subjectId') subjectId: string,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.excelService.exportSubjectGrades(subjectId);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=subject_grades_${subjectId}.xlsx`,
    );

    res.send(buffer);
  }

  @Get('class/:classId/attendance')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Export class attendance report' })
  async exportClassAttendance(
    @Param('classId') classId: string,
    @Res() res: Response,
  ): Promise<void> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1); // Last month
    const endDate = new Date();

    const buffer = await this.excelService.exportClassAttendance(
      classId,
      startDate,
      endDate,
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=class_attendance_${classId}.xlsx`,
    );

    res.send(buffer);
  }
}

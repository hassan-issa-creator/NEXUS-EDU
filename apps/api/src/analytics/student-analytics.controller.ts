import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
  StudentAnalyticsService,
  StudentProgressPoint,
  ClassComparison,
  EarlyWarning,
  ParentReport,
} from './student-analytics.service';

@ApiTags('Student Analytics')
@Controller('api/analytics/student')
@ApiBearerAuth()
export class StudentAnalyticsController {
  constructor(
    private readonly studentAnalyticsService: StudentAnalyticsService,
  ) {}

  @Get(':studentId/progress')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get student progress over time' })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Number of days to analyze (default: 30)',
  })
  @ApiResponse({ status: 200, description: 'Student progress data for charts' })
  async getStudentProgress(
    @Param('studentId') studentId: string,
    @Query('days') days?: number,
  ): Promise<StudentProgressPoint[]> {
    return this.studentAnalyticsService.getStudentProgress(
      studentId,
      days || 30,
    );
  }

  @Get(':studentId/comparison')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Compare student with their class' })
  @ApiResponse({
    status: 200,
    description: 'Class comparison data including rank and percentile',
  })
  async getClassComparison(
    @Param('studentId') studentId: string,
  ): Promise<ClassComparison> {
    return this.studentAnalyticsService.getClassComparison(studentId);
  }

  @Get(':studentId/parent-report')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Generate parent report for student' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['week', 'month'],
    description: 'Report period (default: month)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Comprehensive parent report with grades, attendance, and recommendations',
  })
  async getParentReport(
    @Param('studentId') studentId: string,
    @Query('period') period?: 'week' | 'month',
  ): Promise<ParentReport> {
    return this.studentAnalyticsService.getParentReport(
      studentId,
      period || 'month',
    );
  }

  @Get('early-warnings')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get early warning alerts for at-risk students' })
  @ApiQuery({
    name: 'classId',
    required: false,
    type: String,
    description: 'Filter by class ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of students with warning alerts sorted by risk level',
  })
  async getEarlyWarnings(
    @Query('classId') classId?: string,
  ): Promise<EarlyWarning[]> {
    return this.studentAnalyticsService.getEarlyWarnings(classId);
  }
}

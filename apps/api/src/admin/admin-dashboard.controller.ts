import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import {
  AdminDashboardService,
  AdminOverview,
  TeacherPerformance,
  ClassActivity,
} from './admin-dashboard.service';

@ApiTags('Admin Dashboard')
@Controller('admin/dashboard')
@ApiBearerAuth()
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get('overview')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get admin dashboard overview' })
  @ApiResponse({ status: 200, description: 'Dashboard overview with stats' })
  async getOverview(): Promise<AdminOverview> {
    return this.dashboardService.getOverview();
  }

  @Get('teachers')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get teacher performance metrics' })
  @ApiResponse({
    status: 200,
    description: 'List of teachers with performance stats',
  })
  async getTeacherPerformance(): Promise<TeacherPerformance[]> {
    return this.dashboardService.getTeacherPerformance();
  }

  @Get('classes')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get class activity report' })
  @ApiResponse({
    status: 200,
    description: 'List of classes with activity metrics',
  })
  async getClassActivity(): Promise<ClassActivity[]> {
    return this.dashboardService.getClassActivity();
  }

  @Get('export/pdf')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Export admin report as PDF' })
  @ApiQuery({ name: 'type', enum: ['overview', 'teachers', 'classes', 'full'] })
  async exportPDF(
    @Query('type') type: 'overview' | 'teachers' | 'classes' | 'full',
    @Res() res: Response,
  ) {
    // For now, return JSON data that can be converted to PDF on frontend
    // Later: integrate with PDFKit for server-side PDF generation
    let data: any;

    switch (type) {
      case 'overview':
        data = await this.dashboardService.getOverview();
        break;
      case 'teachers':
        data = await this.dashboardService.getTeacherPerformance();
        break;
      case 'classes':
        data = await this.dashboardService.getClassActivity();
        break;
      case 'full':
        data = {
          overview: await this.dashboardService.getOverview(),
          teachers: await this.dashboardService.getTeacherPerformance(),
          classes: await this.dashboardService.getClassActivity(),
          generatedAt: new Date().toISOString(),
        };
        break;
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="admin-report-${type}-${Date.now()}.json"`,
    );
    res.json(data);
  }

  @Get('stats/financial')
  @UseGuards(AuthGuard('jwt'))
  async getFinancialStats() {
    return this.dashboardService.getFinancialStats();
  }

  @Get('stats/enrollment')
  @UseGuards(AuthGuard('jwt'))
  async getEnrollmentStats() {
    return this.dashboardService.getEnrollmentStats();
  }
}

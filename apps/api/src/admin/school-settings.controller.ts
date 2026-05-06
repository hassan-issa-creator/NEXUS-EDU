import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
  SchoolSettingsService,
  SchoolSettings,
} from './school-settings.service';

@ApiTags('School Settings')
@Controller('api/admin/settings')
@ApiBearerAuth()
export class SchoolSettingsController {
  constructor(private readonly settingsService: SchoolSettingsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all school settings' })
  @ApiResponse({ status: 200, description: 'School settings retrieved' })
  async getSettings(): Promise<SchoolSettings> {
    return this.settingsService.getSettings();
  }

  @Put()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update school settings' })
  async updateSettings(
    @Body() updates: Partial<SchoolSettings>,
  ): Promise<SchoolSettings> {
    return this.settingsService.updateSettings(updates);
  }

  @Put('grading')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update grading system settings' })
  async updateGradingSystem(
    @Body() config: Partial<SchoolSettings['gradingSystem']>,
  ): Promise<SchoolSettings> {
    return this.settingsService.updateGradingSystem(config);
  }

  @Put('periods')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update periods configuration' })
  async updatePeriodsConfig(
    @Body() config: Partial<SchoolSettings['periodsConfig']>,
  ): Promise<SchoolSettings> {
    return this.settingsService.updatePeriodsConfig(config);
  }

  @Put('attendance')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update attendance policy' })
  async updateAttendancePolicy(
    @Body() config: Partial<SchoolSettings['attendancePolicy']>,
  ): Promise<SchoolSettings> {
    return this.settingsService.updateAttendancePolicy(config);
  }

  @Put('reports')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update report settings' })
  async updateReportSettings(
    @Body() config: Partial<SchoolSettings['reportSettings']>,
  ): Promise<SchoolSettings> {
    return this.settingsService.updateReportSettings(config);
  }
}

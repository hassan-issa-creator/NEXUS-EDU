import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { StudentAnalyticsController } from './student-analytics.controller';
import { StudentAnalyticsService } from './student-analytics.service';
import { PrismaService } from '../prisma.service';

import { ExcelExportService } from './excel-export.service';
import { ExcelExportController } from './excel-export.controller';

@Module({
  controllers: [
    AnalyticsController,
    StudentAnalyticsController,
    ExcelExportController,
  ],
  providers: [
    AnalyticsService,
    StudentAnalyticsService,
    ExcelExportService,
    PrismaService,
  ],
  exports: [AnalyticsService, StudentAnalyticsService, ExcelExportService],
})
export class AnalyticsModule {}

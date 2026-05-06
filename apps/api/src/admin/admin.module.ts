import { Module } from '@nestjs/common';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { PrismaService } from '../prisma.service';

import { SchoolSettingsController } from './school-settings.controller';
import { SchoolSettingsService } from './school-settings.service';

@Module({
  controllers: [AdminDashboardController, SchoolSettingsController],
  providers: [AdminDashboardService, SchoolSettingsService, PrismaService],
  exports: [AdminDashboardService, SchoolSettingsService],
})
export class AdminModule {}

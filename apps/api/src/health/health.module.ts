import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { MetricsService } from './metrics.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [HealthController],
  providers: [MetricsService, PrismaService],
  exports: [MetricsService],
})
export class HealthModule {}

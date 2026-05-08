import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiTutorService } from './ai-tutor.service';
import { AiTutorController } from './ai-tutor.controller';
import { AiExamService } from './ai-exam.service';
import { AiAnalyticsService } from './ai-analytics.service';
import { AiParentService } from './ai-parent.service';
import { AiPersonalTutorService } from './ai-personal-tutor.service';
import { AiContentService } from './ai-content.service';
import { AiGradingService } from './ai-grading.service';
import { PrismaModule } from '../../core/database/prisma.module';
import { EventsModule } from '../../gateway/events.module';
import { GamificationModule } from '../../gamification/gamification.module';

@Module({
  imports: [PrismaModule, ConfigModule, EventsModule, GamificationModule],
  controllers: [AiTutorController],
  providers: [AiTutorService, AiExamService, AiAnalyticsService, AiParentService, AiPersonalTutorService, AiContentService, AiGradingService],
  exports: [AiTutorService, AiExamService, AiAnalyticsService, AiParentService, AiPersonalTutorService, AiContentService, AiGradingService],
})
export class AiModule {}

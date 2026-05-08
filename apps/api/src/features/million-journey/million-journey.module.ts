import { Module } from '@nestjs/common';
import { MillionJourneyController } from './million-journey.controller';
import { MillionJourneyService } from './million-journey.service';
import { PrismaService } from '../../prisma.service';

/**
 * Million Journey Module
 * Handles the gamified roadmap, milestones, and XP progression
 */
@Module({
  controllers: [MillionJourneyController],
  providers: [MillionJourneyService, PrismaService],
  exports: [MillionJourneyService],
})
export class MillionJourneyModule {}

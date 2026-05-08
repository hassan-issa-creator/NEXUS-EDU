import { Module } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { GamificationController } from './gamification.controller';
import { PrismaService } from '../prisma.service';
import { EventsModule } from '../gateway/events.module';

@Module({
  imports: [EventsModule],
  controllers: [GamificationController],
  providers: [GamificationService, PrismaService],
  exports: [GamificationService],
})
export class GamificationModule {}

import { Module } from '@nestjs/common';
import { AIAssistantController } from './ai-assistant.controller';
import { AIAssistantService } from './ai-assistant.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [AIAssistantController],
  providers: [AIAssistantService, PrismaService],
  exports: [AIAssistantService],
})
export class AIModule {}

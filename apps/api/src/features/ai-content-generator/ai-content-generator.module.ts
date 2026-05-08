import { Module } from '@nestjs/common';
import { AiContentGeneratorController } from './ai-content-generator.controller';
import { AiContentGeneratorService } from './ai-content-generator.service';
import { PrismaService } from '../../prisma.service';

/**
 * AI Content Generator Module
 * Handles generated templates and question banks
 */
@Module({
  controllers: [AiContentGeneratorController],
  providers: [AiContentGeneratorService, PrismaService],
  exports: [AiContentGeneratorService],
})
export class AiContentGeneratorModule {}

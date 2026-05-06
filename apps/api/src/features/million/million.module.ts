import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

/**
 * Million Dialogue Module
 * Provides Million multiplayer quiz functionality
 */
@Module({
  imports: [],
  controllers: [],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class MillionModule {}

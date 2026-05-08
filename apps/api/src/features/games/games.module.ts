import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { PrismaService } from '../../prisma.service';

/**
 * Games Module
 * Handles educational games functionality
 */
@Module({
  controllers: [GamesController],
  providers: [GamesService, PrismaService],
  exports: [GamesService],
})
export class GamesModule {}

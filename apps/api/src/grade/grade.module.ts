import { Module } from '@nestjs/common';
import { GradeService } from './grade.service';
import { GradesController } from './grade.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [GradesController],
  providers: [GradeService, PrismaService],
  exports: [GradeService],
})
export class GradeModule {}

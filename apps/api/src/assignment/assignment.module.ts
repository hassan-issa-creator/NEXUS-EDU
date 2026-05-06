import { Module } from '@nestjs/common';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { AutoGradingService } from './auto-grading.service';
import { PrismaService } from '../prisma.service';

import { AssignmentTemplateService } from './assignment-template.service';
import { AssignmentTemplateController } from './assignment-template.controller';

@Module({
  controllers: [AssignmentController, AssignmentTemplateController],
  providers: [
    AssignmentService,
    AutoGradingService,
    AssignmentTemplateService,
    PrismaService,
  ],
  exports: [AssignmentService, AutoGradingService, AssignmentTemplateService],
})
export class AssignmentModule {}

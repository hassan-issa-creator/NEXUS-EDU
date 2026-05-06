import { Module } from '@nestjs/common';
import { examService } from './exam.service';

/**
 * Exam Module
 * Handles all exam-related functionality
 * Note: ExamController is Express-style (not NestJS), so it's not registered here.
 * It should be mounted via Express router if needed.
 */
@Module({
  controllers: [],
  providers: [
    {
      provide: 'ExamService',
      useValue: examService,
    },
  ],
  exports: ['ExamService'],
})
export class ExamModule {}

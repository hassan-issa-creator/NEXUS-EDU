import { Module } from '@nestjs/common';
import { ClassService } from './class.service';
import { ClassController } from './class.controller';
import { PrismaService } from '../prisma.service';

import { ClassSessionController } from './class-session.controller';
import { ClassSessionAttendanceController } from './class-session-attendance.controller';
import { ClassSessionService } from './class-session.service';

@Module({
  controllers: [
    ClassController,
    ClassSessionController,
    ClassSessionAttendanceController,
  ],
  providers: [ClassService, ClassSessionService, PrismaService],
})
export class ClassModule {}

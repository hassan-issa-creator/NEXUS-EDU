import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './core/database/prisma.module';
import { AuthModule } from './features/auth/auth.module';
import { CommonModule, CustomThrottlerGuard } from './common';
// import { ClassModule } from './class/class.module';
import { SubjectModule } from './subject/subject.module';
import { UserModule } from './user/user.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { UploadModule } from './upload/upload.module';
import { GradeModule } from './grade/grade.module';
import { LessonModule } from './lesson/lesson.module';
import { AssignmentModule } from './assignment/assignment.module';
import { MillionModule } from './features/million/million.module';
import { ExamModule } from './features/exams/exam.module';
import { ChatModule } from './features/chat/chat.module';
import { ContentModule } from './features/content/content.module';
import { GamesModule } from './features/games/games.module';
import { QRAttendanceModule } from './features/qr-attendance/qr-attendance.module';
import { ParentPortalModule } from './features/parent-portal/parent-portal.module';
import { AdminPortalModule } from './features/admin-portal/admin-portal.module';
import { AttendanceModule } from './attendance/attendance.module';
// Temporarily comment out to fix compilation errors
// import { MillionAchieverModule } from './features/million-achiever/million-achiever.module';
import { MillionSimpleModule } from './features/million-simple/million-simple.module';
import { HealthModule } from './health/health.module';
import { QueueModule } from './queue/queue.module'; // Disabled - requires Redis
import { GamificationModule } from './gamification/gamification.module';
import { ReportModule } from './report/report.module';
import { NotificationModule } from './notifications/notification.module';
import { AdminModule } from './admin/admin.module';
import { AiModule } from './features/ai/ai.module';
import { ClassModule } from './class/class.module';
import { PaymentModule } from './payment/payment.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule, // Global database access
    // Rate Limiting - 3 tiers for different protection levels
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 10, // 10 requests per second
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 50, // 50 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 200, // 200 requests per minute
      },
    ]),
    AuthModule,
    CommonModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 300000, // 5 minutes default TTL
      max: 1000, // Maximum number of items in cache
    }),
    ClassModule,
    SubjectModule,
    UserModule,
    EnrollmentModule,
    AnalyticsModule,
    UploadModule,
    GradeModule,
    LessonModule,
    AssignmentModule,
    MillionModule,
    ExamModule,
    ChatModule,
    ContentModule,
    GamesModule,
    QRAttendanceModule,
    ParentPortalModule,
    AdminPortalModule,
    AttendanceModule,
    // Temporarily disabled to fix compilation errors
    // MillionAchieverModule,
    MillionSimpleModule,
    HealthModule,
    QueueModule, // Disabled - requires Redis
    GamificationModule,
    ReportModule,
    NotificationModule,
    AdminModule,
    AiModule,
    PaymentModule,
    DashboardModule,
  ],
  providers: [
    // Global throttler guard with role-based limits
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule { }

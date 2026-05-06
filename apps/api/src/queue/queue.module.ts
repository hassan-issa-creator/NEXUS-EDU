import { Module, Logger } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailProcessor } from './processors/email.processor';
import { ReportProcessor } from './processors/report.processor';

// Queue names as constants for type safety
export const QUEUE_NAMES = {
  EMAIL: 'email',
  REPORTS: 'reports',
  NOTIFICATIONS: 'notifications',
  ANALYTICS: 'analytics',
} as const;

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('QueueModule');
        const host = configService.get('REDIS_HOST', 'localhost');
        const port = configService.get('REDIS_PORT', 6379);

        logger.log(`Connecting to Redis at ${host}:${port}`);

        return {
          connection: {
            host,
            port,
            password: configService.get('REDIS_PASSWORD', '') || undefined,
            maxRetriesPerRequest: 3,
            retryStrategy: (times: number) => {
              if (times > 3) {
                logger.error('Redis connection failed after 3 retries');
                return null;
              }
              return Math.min(times * 200, 2000);
            },
          },
          defaultJobOptions: {
            attempts: 5,
            backoff: {
              type: 'exponential',
              delay: 1000,
            },
            removeOnComplete: {
              age: 3600, // Keep completed jobs for 1 hour
              count: 100,
            },
            removeOnFail: {
              age: 86400, // Keep failed jobs for 24 hours
              count: 50,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
    // Email Queue - High priority, fast processing
    BullModule.registerQueue({
      name: QUEUE_NAMES.EMAIL,
      defaultJobOptions: {
        priority: 1,
        attempts: 5,
      },
    }),
    // Reports Queue - Low priority, can take longer
    BullModule.registerQueue({
      name: QUEUE_NAMES.REPORTS,
      defaultJobOptions: {
        priority: 3,
        attempts: 3,
      },
    }),
    // Notifications Queue - Medium priority
    BullModule.registerQueue({
      name: QUEUE_NAMES.NOTIFICATIONS,
      defaultJobOptions: {
        priority: 2,
        attempts: 3,
      },
    }),
    // Analytics Queue - Background processing
    BullModule.registerQueue({
      name: QUEUE_NAMES.ANALYTICS,
      defaultJobOptions: {
        priority: 5,
        attempts: 2,
        delay: 1000, // 1 second delay
      },
    }),
  ],
  providers: [EmailProcessor, ReportProcessor],
  exports: [BullModule],
})
export class QueueModule {}

import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { PrismaService } from '../prisma.service';
import { EventsModule } from '../gateway/events.module';

@Module({
  imports: [EventsModule],
  controllers: [MessagesController],
  providers: [MessagesService, PrismaService],
  exports: [MessagesService],
})
export class MessagesModule {}

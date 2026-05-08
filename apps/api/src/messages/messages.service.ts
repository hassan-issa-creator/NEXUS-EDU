import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EventsGateway } from '../gateway/events.gateway';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async getConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Get the latest message for preview
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async getMessages(conversationId: string, userId: string) {
    // Verify user is part of the conversation
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    // Mark as read
    await this.prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: { lastReadAt: new Date() },
    });

    return this.prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async sendMessage(senderId: string, conversationId: string, content: string, attachments?: string) {
    // Verify user is part of the conversation
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: senderId,
        },
      },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    // Create the message
    const message = await this.prisma.message.create({
      data: {
        senderId,
        conversationId,
        content,
        attachments,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
            avatar: true,
          },
        },
      },
    });

    // Update conversation timestamp
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Notify all other participants
    const participants = await this.prisma.conversationParticipant.findMany({
      where: { conversationId },
    });

    for (const p of participants) {
      if (p.userId !== senderId) {
        this.eventsGateway.emitMessage(p.userId, message);
      }
    }

    return message;
  }

  async startDirectConversation(initiatorId: string, targetUserId: string) {
    // Check if direct conversation already exists between these two users
    const existingConversation = await this.prisma.conversation.findFirst({
      where: {
        type: 'direct',
        participants: {
          every: {
            userId: {
              in: [initiatorId, targetUserId],
            },
          },
        },
      },
    });

    if (existingConversation) {
      return existingConversation;
    }

    // Create a new direct conversation
    return this.prisma.conversation.create({
      data: {
        type: 'direct',
        participants: {
          create: [
            { userId: initiatorId, role: 'admin' },
            { userId: targetUserId, role: 'member' },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, role: true, avatar: true },
            },
          },
        },
      },
    });
  }
}

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  CreateConversationRequest,
  SendMessageRequest,
  GetMessagesRequest,
} from '../../types/chat.types';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new conversation (Direct or Group)
   */
  async createConversation(userId: string, data: CreateConversationRequest) {
    // 1. Check for existing direct conversation
    if (data.type === 'direct' && data.participantIds.length === 1) {
      const existing = await this.findDirectConversation(
        userId,
        data.participantIds[0],
      );
      if (existing) return existing;
    }

    // 2. Create Conversation
    const conversation = await this.prisma.conversation.create({
      data: {
        type: data.type,
        title: data.title,
        description: data.description,
        participants: {
          create: [
            { userId, role: 'owner' },
            ...data.participantIds.map((id) => ({
              userId: id,
              role: 'member',
            })),
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return conversation;
  }

  /**
   * Find existing direct conversation between two users
   */
  private async findDirectConversation(userId1: string, userId2: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        type: 'direct',
        participants: {
          every: {
            userId: { in: [userId1, userId2] },
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
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    // Validates that it's exactly these two users
    return conversations.find((c) => c.participants.length === 2) || null;
  }

  /**
   * Get user's conversations
   */
  async getUserConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                createdAt: {
                  gt: await this.getLastRead(userId), // rough estimation, ideally per conv
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  private async getLastRead(userId: string): Promise<Date> {
    // Placeholder: In real app, querying ConversationParticipant.lastReadAt per conversation
    return new Date(0);
  }

  /**
   * Send a message
   */
  async sendMessage(senderId: string, data: SendMessageRequest) {
    // Verify participation
    await this.verifyParticipant(data.conversationId, senderId);

    const message = await this.prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderId,
        content: data.messageText || '',
        type: data.messageType || 'text',
        attachments: data.attachments
          ? JSON.stringify(data.attachments)
          : undefined,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Update conversation timestamp
    await this.prisma.conversation.update({
      where: { id: data.conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  /**
   * Get conversation messages
   */
  async getMessages(
    userId: string,
    conversationId: string,
    limit = 50,
    cursor?: string,
  ) {
    await this.verifyParticipant(conversationId, userId);

    return this.prisma.message.findMany({
      where: { conversationId },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        reactions: true,
      },
    });
  }

  /**
   * Verify if user is participant
   */
  private async verifyParticipant(conversationId: string, userId: string) {
    const count = await this.prisma.conversationParticipant.count({
      where: { conversationId, userId },
    });

    if (count === 0) {
      throw new ForbiddenException('Not a participant of this conversation');
    }
  }

  /**
   * Add Reaction
   */
  async addReaction(messageId: string, userId: string, emoji: string) {
    // Simplification: Check if message exists first
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!message) throw new NotFoundException('Message not found');

    return this.prisma.messageReaction.upsert({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji,
        },
      },
      update: {},
      create: {
        messageId,
        userId,
        emoji,
      },
    });
  }
}

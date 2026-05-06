import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { MessageType } from '../../types/chat.types';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        client.disconnect();
        return;
      }

      // Verify token (assumes JWT_SECRET is available in ENV or via module)
      const secret = process.env.JWT_SECRET || 'secret';
      const payload = this.jwtService.verify(token, { secret });
      client.data.user = payload;

      const userId = payload.sub || payload.id;
      client.join(`user:${userId}`); // Join user's personal room

      console.log(`Chat Client connected: ${userId} (${client.id})`);
    } catch (e) {
      console.error('Socket auth failed', e);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Chat Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.join(`conversation:${data.conversationId}`);
    return { event: 'joined', data: { conversationId: data.conversationId } };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { conversationId: string; content: string; type?: string },
  ) {
    const userId = client.data.user?.sub || client.data.user?.id;
    if (!userId) return;

    const message = await this.chatService.sendMessage(userId, {
      conversationId: data.conversationId,
      messageText: data.content,
      messageType: (data.type as MessageType) || 'text',
    });

    // Broadcast to room
    this.server
      .to(`conversation:${data.conversationId}`)
      .emit('newMessage', message);

    return message;
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; isTyping: boolean },
  ) {
    const userId = client.data.user?.sub || client.data.user?.id;
    client.broadcast
      .to(`conversation:${data.conversationId}`)
      .emit('userTyping', {
        userId,
        conversationId: data.conversationId,
        isTyping: data.isTyping,
      });
  }
}

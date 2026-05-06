import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Put,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import type {
  CreateConversationRequest,
  SendMessageRequest,
} from '../../types/chat.types';

@ApiTags('Chat')
@Controller('api/chat')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Create new conversation' })
  async createConversation(
    @Req() req: any,
    @Body() data: CreateConversationRequest,
  ) {
    return this.chatService.createConversation(req.user.id, data);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations' })
  async getConversations(@Req() req: any) {
    return this.chatService.getUserConversations(req.user.id);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get conversation messages' })
  async getMessages(
    @Req() req: any,
    @Param('id') id: string,
    @Query('limit') limit?: number,
    @Query('cursor') cursor?: string,
  ) {
    return this.chatService.getMessages(
      req.user.id,
      id,
      limit ? Number(limit) : 50,
      cursor,
    );
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send message' })
  async sendMessage(@Req() req: any, @Body() data: SendMessageRequest) {
    return this.chatService.sendMessage(req.user.id, data);
  }

  @Post('messages/:id/react')
  @ApiOperation({ summary: 'Add reaction' })
  async addReaction(
    @Req() req: any,
    @Param('id') id: string,
    @Body('emoji') emoji: string,
  ) {
    return this.chatService.addReaction(id, req.user.id, emoji);
  }
}

/**
 * Chat System Types
 * Type definitions for the messaging/chat system
 */

export type ConversationType = 'direct' | 'group' | 'class';
export type MessageType = 'text' | 'image' | 'file' | 'system' | 'voice';
export type ParticipantRole = 'member' | 'admin' | 'owner';

// ==================== CONVERSATION TYPES ====================

export interface ConversationSettings {
  allowFiles?: boolean;
  allowImages?: boolean;
  allowVoice?: boolean;
  maxFileSize?: number;
  onlyAdminsCanPost?: boolean;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  title?: string;
  description?: string;
  avatarUrl?: string;
  createdBy: string;
  classId?: string;
  lastMessageAt: Date;
  lastMessageText?: string;
  settings: ConversationSettings;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Extended fields (from joins)
  unreadCount?: number;
  participants?: ConversationParticipant[];
}

// ==================== PARTICIPANT TYPES ====================

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  role: ParticipantRole;
  joinedAt: Date;
  leftAt?: Date;
  isActive: boolean;
  lastReadAt: Date;
  lastReadMessageId?: string;
  isMuted: boolean;
  mutedUntil?: Date;
  isTyping: boolean;
  typingUpdatedAt?: Date;

  // Extended fields
  user?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    isOnline?: boolean;
  };
}

// ==================== MESSAGE TYPES ====================

export interface MessageAttachment {
  url: string;
  name: string;
  size: number;
  type: string;
  thumbnailUrl?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  messageText?: string;
  messageType: MessageType;
  attachments?: MessageAttachment[];
  replyToMessageId?: string;
  mentions?: string[];
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  isPinned: boolean;
  pinnedBy?: string;
  pinnedAt?: Date;
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;

  // Extended fields
  sender?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  replyToMessage?: Message;
  reactions?: MessageReaction[];
  reads?: MessageRead[];
  isRead?: boolean;
}

// ==================== REACTION TYPES ====================

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;

  // Extended fields
  user?: {
    id: string;
    fullName: string;
  };
}

export interface ReactionSummary {
  emoji: string;
  count: number;
  users: string[]; // User IDs
  hasReacted: boolean; // Current user
}

// ==================== READ RECEIPT TYPES ====================

export interface MessageRead {
  id: string;
  messageId: string;
  userId: string;
  readAt: Date;

  // Extended fields
  user?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
}

// ==================== TYPING INDICATOR TYPES ====================

export interface TypingIndicator {
  id: string;
  conversationId: string;
  userId: string;
  startedAt: Date;
  expiresAt: Date;

  // Extended fields
  user?: {
    id: string;
    fullName: string;
  };
}

// ==================== REQUEST/RESPONSE TYPES ====================

export interface CreateConversationRequest {
  type: ConversationType;
  title?: string;
  description?: string;
  participantIds: string[];
  classId?: string;
  settings?: ConversationSettings;
}

export interface SendMessageRequest {
  conversationId: string;
  messageText?: string;
  messageType?: MessageType;
  attachments?: MessageAttachment[];
  replyToMessageId?: string;
  mentions?: string[];
}

export interface EditMessageRequest {
  messageId: string;
  messageText: string;
}

export interface AddReactionRequest {
  messageId: string;
  emoji: string;
}

export interface MarkAsReadRequest {
  conversationId: string;
  upToMessageId?: string;
}

export interface GetMessagesRequest {
  conversationId: string;
  limit?: number;
  before?: string; // Message ID
  after?: string; // Message ID
}

export interface GetMessagesResponse {
  messages: Message[];
  hasMore: boolean;
  total?: number;
}

export interface ConversationWithDetails extends Conversation {
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount: number;
}

// ==================== WEBSOCKET EVENT TYPES ====================

export interface SocketMessage {
  event: string;
  data: any;
}

// Client → Server Events
export interface SendMessageEvent {
  conversationId: string;
  messageText?: string;
  messageType?: MessageType;
  attachments?: MessageAttachment[];
  replyToMessageId?: string;
  mentions?: string[];
}

export interface TypingStartEvent {
  conversationId: string;
}

export interface TypingStopEvent {
  conversationId: string;
}

export interface MarkAsReadEvent {
  conversationId: string;
  messageIds: string[];
}

export interface ReactToMessageEvent {
  messageId: string;
  emoji: string;
}

// Server → Client Events
export interface MessageReceivedEvent {
  conversationId: string;
  message: Message;
}

export interface UserTypingEvent {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface MessageEditedEvent {
  messageId: string;
  newText: string;
  editedAt: Date;
}

export interface MessageDeletedEvent {
  messageId: string;
  deletedAt: Date;
}

export interface ReactionAddedEvent {
  messageId: string;
  userId: string;
  userName: string;
  emoji: string;
}

export interface ReactionRemovedEvent {
  messageId: string;
  userId: string;
  emoji: string;
}

export interface MessagesReadEvent {
  conversationId: string;
  userId: string;
  messageIds: string[];
}

export interface ConversationUpdatedEvent {
  conversationId: string;
  updates: Partial<Conversation>;
}

export interface UserJoinedEvent {
  conversationId: string;
  user: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
}

export interface UserLeftEvent {
  conversationId: string;
  userId: string;
}

// ==================== ERROR TYPES ====================

export class ChatError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = 'ChatError';
  }
}

export const ChatErrorCodes = {
  CONVERSATION_NOT_FOUND: 'CONVERSATION_NOT_FOUND',
  MESSAGE_NOT_FOUND: 'MESSAGE_NOT_FOUND',
  NOT_PARTICIPANT: 'NOT_PARTICIPANT',
  NOT_AUTHORIZED: 'NOT_AUTHORIZED',
  INVALID_MESSAGE: 'INVALID_MESSAGE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  BLOCKED_USER: 'BLOCKED_USER',
} as const;

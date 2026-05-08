import { apiClient } from '../api/client';

export interface UserPreview {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface ConversationParticipant {
  id: string;
  userId: string;
  role: string;
  lastReadAt: string;
  user: UserPreview;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: string;
  attachments?: string;
  createdAt: string;
  sender: UserPreview;
}

export interface Conversation {
  id: string;
  type: string;
  title?: string;
  description?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
  messages: Message[];
}

export const messagingService = {
  getConversations: async (): Promise<Conversation[]> => {
    const res = await apiClient.get<Conversation[]>('/messages/conversations');
    // Extract actual data because of the global NestJS interceptor { data: ... }
    return (res.data as any)?.data || res.data || [];
  },

  startConversation: async (targetUserId: string): Promise<Conversation> => {
    const res = await apiClient.post<Conversation>('/messages/start', { targetUserId });
    return (res.data as any)?.data || res.data;
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    const res = await apiClient.get<Message[]>(`/messages/${conversationId}`);
    return (res.data as any)?.data || res.data || [];
  },

  sendMessage: async (conversationId: string, content: string, attachments?: string): Promise<Message> => {
    const res = await apiClient.post<Message>(`/messages/${conversationId}/send`, {
      content,
      attachments,
    });
    return (res.data as any)?.data || res.data;
  },
};

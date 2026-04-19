import { backendRequest } from './client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5150/api';
const API_BASE_URL_WITHOUT_API = API_BASE_URL.replace('/api', '');

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: number;
  receiver_id: number;
  message: string;
  read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  other_user_id: number;
  other_user_name: string;
  other_user_avatar: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

// Helper to format avatar URL
const formatAvatarUrl = (url: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL_WITHOUT_API}${url}`;
};

export const chatApi = {
  async sendMessage(receiverId: number, message: string, productId?: string): Promise<{ success: boolean; data: ChatMessage }> {
    const response = await backendRequest<ChatMessage>('/chat/send', {
      method: 'POST',
      body: JSON.stringify({
        receiver_id: receiverId,
        message,
        product_id: productId || null
      }),
    });
    return {
      success: true,
      data: response.data,
    };
  },

  async getConversations(): Promise<{ success: boolean; data: Conversation[] }> {
    const response = await backendRequest<Conversation[]>('/chat/conversations');
    // Format avatar URLs
    const formattedData = response.data.map(conv => ({
      ...conv,
      other_user_avatar: formatAvatarUrl(conv.other_user_avatar),
    }));
    return {
      success: true,
      data: formattedData,
    };
  },

  async getMessages(conversationId: string): Promise<{ success: boolean; data: ChatMessage[] }> {
    const response = await backendRequest<ChatMessage[]>(`/chat/messages/${conversationId}`);
    return {
      success: true,
      data: response.data,
    };
  },
};

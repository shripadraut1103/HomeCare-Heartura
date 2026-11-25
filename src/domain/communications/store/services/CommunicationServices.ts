import { callApi } from '@/config/ApiError';
import { del, get, post } from '@/config/AxiosConfig';
import type {
  ApiConversation,
  ApiConversationCreate,
  ApiDirectory,
  ApiMembers,
  ApiMessage,
  ApiMessageCreate,
  ApiMessagePage,
} from '@/domain/communications/interfaces/CommunicationApi';
import type { ServiceResult } from '@/types/ServiceInterfaces';

export const COMMUNICATION_ENDPOINTS = {
  conversations: '/api/communications/conversations/',
  conversation: (id: string) => `/api/communications/conversations/${id}/`,
  members: (id: string) => `/api/communications/conversations/${id}/members/`,
  messages: (id: string) => `/api/communications/conversations/${id}/messages/`,
  read: (id: string) => `/api/communications/conversations/${id}/read/`,
  directory: '/api/communications/directory/',
  message: (id: string) => `/api/communications/messages/${id}/`,
} as const;

export const MESSAGES_PAGE_SIZE = 50;

class CommunicationService {
  async getConversations(): Promise<ServiceResult<ApiConversation[]>> {
    return callApi(() => get<ApiConversation[]>(COMMUNICATION_ENDPOINTS.conversations));
  }

  async getConversation(id: string): Promise<ServiceResult<ApiConversation>> {
    return callApi(() => get<ApiConversation>(COMMUNICATION_ENDPOINTS.conversation(id)));
  }

  async createConversation(body: ApiConversationCreate): Promise<ServiceResult<ApiConversation>> {
    return callApi(() => post<ApiConversation>(COMMUNICATION_ENDPOINTS.conversations, body));
  }

  async getMembers(id: string): Promise<ServiceResult<ApiMembers>> {
    return callApi(() => get<ApiMembers>(COMMUNICATION_ENDPOINTS.members(id)));
  }

  async getMessages(id: string, before?: string): Promise<ServiceResult<ApiMessagePage>> {
    return callApi(() =>
      get<ApiMessagePage>(COMMUNICATION_ENDPOINTS.messages(id), {
        params: { limit: MESSAGES_PAGE_SIZE, ...(before ? { before } : {}) },
      })
    );
  }

  async sendMessage(id: string, body: ApiMessageCreate): Promise<ServiceResult<ApiMessage>> {
    return callApi(() => post<ApiMessage>(COMMUNICATION_ENDPOINTS.messages(id), body));
  }

  async markRead(id: string): Promise<ServiceResult<unknown>> {
    return callApi(() => post<unknown>(COMMUNICATION_ENDPOINTS.read(id)));
  }

  async getDirectory(): Promise<ServiceResult<ApiDirectory>> {
    return callApi(() => get<ApiDirectory>(COMMUNICATION_ENDPOINTS.directory));
  }

  async deleteMessage(id: string): Promise<ServiceResult<unknown>> {
    return callApi(() => del<unknown>(COMMUNICATION_ENDPOINTS.message(id)));
  }
}

export default new CommunicationService();

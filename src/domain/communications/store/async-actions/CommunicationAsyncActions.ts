import { createAsyncThunk } from '@reduxjs/toolkit';

import type {
  ApiConversation,
  ApiDirectory,
  ApiMembers,
  ApiMessage,
  ApiMessagePage,
} from '@/domain/communications/interfaces/CommunicationApi';
import CommunicationService from '@/domain/communications/store/services/CommunicationServices';
import { COMMUNICATIONS_REDUCER } from '@/store/constants/StoreConstants';
import type { RootState } from '@/store/storeConfig';
import type { ServiceResult } from '@/types/ServiceInterfaces';

type WithViewer<T> = ServiceResult<T> & { viewerId: string | null };

const viewerOf = (state: RootState) =>
  state.communications.viewerId ?? state.auth.me?.member?.id ?? null;

export const fetchConversationsAction = createAsyncThunk<
  WithViewer<ApiConversation[]>,
  void,
  { state: RootState }
>(
  COMMUNICATIONS_REDUCER + '/fetchConversations',
  async (_, { getState }) => ({
    ...(await CommunicationService.getConversations()),
    viewerId: viewerOf(getState()),
  }),
  { condition: (_, { getState }) => !getState().communications.listLoading }
);

export const fetchConversationAction = createAsyncThunk<
  WithViewer<ApiConversation>,
  { conversationId: string },
  { state: RootState }
>(COMMUNICATIONS_REDUCER + '/fetchConversation', async ({ conversationId }, { getState }) => ({
  ...(await CommunicationService.getConversation(conversationId)),
  viewerId: viewerOf(getState()),
}));

export const fetchMessagesAction = createAsyncThunk<
  WithViewer<ApiMessagePage>,
  { conversationId: string; older?: boolean },
  { state: RootState }
>(
  COMMUNICATIONS_REDUCER + '/fetchMessages',
  async ({ conversationId, older }, { getState }) => {
    const state = getState();
    const before = older ? state.communications.threads[conversationId]?.ids[0] : undefined;
    return {
      ...(await CommunicationService.getMessages(conversationId, before)),
      viewerId: viewerOf(state),
    };
  },
  {
    condition: ({ conversationId, older }, { getState }) => {
      const thread = getState().communications.threads[conversationId];
      if (!thread) return !older;
      if (older) return thread.hasMore && !thread.loadingOlder;
      return !thread.loading;
    },
  }
);

export const sendMessageAction = createAsyncThunk<
  WithViewer<ApiMessage>,
  { conversationId: string; body: string; tempId: string; sentAt: string },
  { state: RootState }
>(COMMUNICATIONS_REDUCER + '/sendMessage', async ({ conversationId, body }, { getState }) => ({
  ...(await CommunicationService.sendMessage(conversationId, { body, kind: 'message' })),
  viewerId: viewerOf(getState()),
}));

export const deleteMessageAction = createAsyncThunk<
  ServiceResult<unknown>,
  { messageId: string; conversationId: string },
  { state: RootState }
>(COMMUNICATIONS_REDUCER + '/deleteMessage', async ({ messageId }) =>
  CommunicationService.deleteMessage(messageId)
);

export const markConversationReadAction = createAsyncThunk<
  ServiceResult<unknown>,
  { conversationId: string },
  { state: RootState }
>(COMMUNICATIONS_REDUCER + '/markRead', async ({ conversationId }) =>
  CommunicationService.markRead(conversationId)
);

export const fetchMembersAction = createAsyncThunk<
  ServiceResult<ApiMembers>,
  { conversationId: string },
  { state: RootState }
>(COMMUNICATIONS_REDUCER + '/fetchMembers', async ({ conversationId }) =>
  CommunicationService.getMembers(conversationId)
);

export const fetchDirectoryAction = createAsyncThunk<
  ServiceResult<ApiDirectory>,
  void,
  { state: RootState }
>(COMMUNICATIONS_REDUCER + '/fetchDirectory', async () => CommunicationService.getDirectory(), {
  condition: (_, { getState }) => !getState().communications.directory.loading,
});

export const createConversationAction = createAsyncThunk<
  WithViewer<ApiConversation>,
  { providerId?: string; office?: boolean },
  { state: RootState }
>(COMMUNICATIONS_REDUCER + '/createConversation', async ({ providerId, office }, { getState }) => ({
  ...(await CommunicationService.createConversation(
    office ? { office: true } : { provider_ids: providerId ? [providerId] : [] }
  )),
  viewerId: viewerOf(getState()),
}));

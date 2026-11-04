import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';

import type {
  Attachment,
  CommunicationsState,
} from '@/domain/communications/interfaces/CommunicationInterfaces';
import {
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
  MOCK_PARTICIPANTS,
} from '@/domain/communications/mocks/CommunicationMocks';
import { COMMUNICATIONS_REDUCER } from '@/store/constants/StoreConstants';

const initialState: CommunicationsState = {
  participants: MOCK_PARTICIPANTS,
  conversations: MOCK_CONVERSATIONS,
  messages: MOCK_MESSAGES,
};

const CommunicationsReducer = createSlice({
  name: COMMUNICATIONS_REDUCER,
  initialState,
  reducers: {
    markConversationRead: (state, action: PayloadAction<{ conversationId: string }>) => {
      const conversation = state.conversations.find(
        (item) => item.id === action.payload.conversationId
      );
      if (conversation) conversation.unreadCount = 0;
    },
    // TEMPORARY: sends locally; replace with a send thunk once the API exists.
    sendMessage: {
      reducer: (
        state,
        action: PayloadAction<{
          id: string;
          conversationId: string;
          body: string;
          attachments?: Attachment[];
          sentAt: string;
        }>
      ) => {
        state.messages.push({ ...action.payload, senderId: null, saved: false });
      },
      prepare: (payload: { conversationId: string; body: string; attachments?: Attachment[] }) => ({
        payload: { ...payload, id: nanoid(), sentAt: new Date().toISOString() },
      }),
    },
    toggleMessageSaved: (state, action: PayloadAction<{ messageId: string }>) => {
      const message = state.messages.find((item) => item.id === action.payload.messageId);
      if (message) message.saved = !message.saved;
    },
    deleteMessage: (state, action: PayloadAction<{ messageId: string }>) => {
      state.messages = state.messages.filter((item) => item.id !== action.payload.messageId);
    },
  },
});

export default CommunicationsReducer.reducer;
export const { markConversationRead, sendMessage, toggleMessageSaved, deleteMessage } =
  CommunicationsReducer.actions;

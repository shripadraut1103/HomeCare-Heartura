import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import {
  toConversation,
  toDirectoryContact,
  toMessage,
  toParticipant,
} from '@/domain/communications/communicationMapper';
import type {
  CommunicationsState,
  Conversation,
  Message,
  MessageThread,
} from '@/domain/communications/interfaces/CommunicationInterfaces';
import {
  createConversationAction,
  deleteMessageAction,
  fetchConversationAction,
  fetchConversationsAction,
  fetchDirectoryAction,
  fetchMembersAction,
  fetchMessagesAction,
  markConversationReadAction,
  sendMessageAction,
} from '@/domain/communications/store/async-actions/CommunicationAsyncActions';
import { COMMUNICATIONS_REDUCER } from '@/store/constants/StoreConstants';

const initialState: CommunicationsState = {
  viewerId: null,
  conversations: {},
  order: [],
  listLoading: false,
  listLoaded: false,
  listError: null,
  messages: {},
  threads: {},
  members: {},
  directory: { contacts: [], loading: false, loaded: false, error: null },
  savedIds: [],
};

const emptyThread = (): MessageThread => ({
  ids: [],
  hasMore: false,
  loading: false,
  loaded: false,
  loadingOlder: false,
  error: null,
});

const byActivity = (state: CommunicationsState) => (a: string, b: string) =>
  (state.conversations[b]?.lastActivityAt ?? '').localeCompare(
    state.conversations[a]?.lastActivityAt ?? ''
  );

function upsertConversation(state: CommunicationsState, conversation: Conversation) {
  state.conversations[conversation.id] = conversation;
  if (!state.order.includes(conversation.id)) state.order.push(conversation.id);
  state.order.sort(byActivity(state));
}

function sortThread(state: CommunicationsState, thread: MessageThread) {
  thread.ids = [...new Set(thread.ids)]
    .filter((id) => state.messages[id])
    .sort((a, b) => state.messages[a].sentAt.localeCompare(state.messages[b].sentAt));
}

function refreshLastMessage(state: CommunicationsState, conversationId: string) {
  const conversation = state.conversations[conversationId];
  const thread = state.threads[conversationId];
  if (!conversation || !thread) return;
  const last = thread.ids
    .map((id) => state.messages[id])
    .filter((item) => !item.sending)
    .at(-1);
  conversation.lastMessage = last
    ? {
        id: last.id,
        body: last.body,
        sentAt: last.sentAt,
        senderName: last.senderName,
        mine: last.mine,
      }
    : null;
  if (last) conversation.lastActivityAt = last.sentAt;
  state.order.sort(byActivity(state));
}

const CommunicationsReducer = createSlice({
  name: COMMUNICATIONS_REDUCER,
  initialState,
  reducers: {
    toggleMessageSaved: (state, action: PayloadAction<{ messageId: string }>) => {
      const { messageId } = action.payload;
      const message = state.messages[messageId];
      if (!message) return;
      message.saved = !message.saved;
      state.savedIds = message.saved
        ? [...state.savedIds, messageId]
        : state.savedIds.filter((id) => id !== messageId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversationsAction.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchConversationsAction.fulfilled, (state, action) => {
        state.listLoading = false;
        if ('error' in action.payload) {
          state.listError = action.payload.error;
          return;
        }
        const { viewerId } = action.payload;
        const conversations = action.payload.data.map((item) => toConversation(item, viewerId));
        state.conversations = Object.fromEntries(conversations.map((item) => [item.id, item]));
        state.order = conversations.map((item) => item.id);
        state.order.sort(byActivity(state));
        state.listLoaded = true;
      })
      .addCase(fetchConversationsAction.rejected, (state) => {
        state.listLoading = false;
        state.listError = 'Couldn’t load your conversations.';
      })
      .addCase(fetchConversationAction.fulfilled, (state, action) => {
        if ('error' in action.payload) return;
        upsertConversation(state, toConversation(action.payload.data, action.payload.viewerId));
      })
      .addCase(createConversationAction.fulfilled, (state, action) => {
        if ('error' in action.payload) return;
        upsertConversation(state, toConversation(action.payload.data, action.payload.viewerId));
      })
      .addCase(fetchMessagesAction.pending, (state, action) => {
        const { conversationId, older } = action.meta.arg;
        const thread = (state.threads[conversationId] ??= emptyThread());
        if (older) thread.loadingOlder = true;
        else thread.loading = true;
        thread.error = null;
      })
      .addCase(fetchMessagesAction.fulfilled, (state, action) => {
        const { conversationId, older } = action.meta.arg;
        const thread = (state.threads[conversationId] ??= emptyThread());
        thread.loading = false;
        thread.loadingOlder = false;
        if ('error' in action.payload) {
          thread.error = action.payload.error;
          return;
        }
        const { viewerId } = action.payload;
        const page = action.payload.data.results.map((item) =>
          toMessage(item, viewerId, state.savedIds.includes(item.id))
        );
        for (const message of page) state.messages[message.id] = message;
        if (!older && page.length > 0) {
          const pageIds = new Set(page.map((message) => message.id));
          const since = page[0].sentAt;
          thread.ids = thread.ids.filter((id) => {
            const message = state.messages[id];
            if (!message || message.sending || pageIds.has(id) || message.sentAt < since)
              return true;
            delete state.messages[id];
            return false;
          });
        }
        thread.ids = older
          ? [...page.map((message) => message.id), ...thread.ids]
          : [...thread.ids, ...page.map((message) => message.id)];
        if (older || !thread.loaded) thread.hasMore = action.payload.data.has_more;
        thread.loaded = true;
        sortThread(state, thread);
        if (!older) refreshLastMessage(state, conversationId);
      })
      .addCase(fetchMessagesAction.rejected, (state, action) => {
        const thread = (state.threads[action.meta.arg.conversationId] ??= emptyThread());
        thread.loading = false;
        thread.loadingOlder = false;
        thread.error = 'Couldn’t load messages.';
      })
      .addCase(sendMessageAction.pending, (state, action) => {
        const { conversationId, body, tempId, sentAt } = action.meta.arg;
        const message: Message = {
          id: tempId,
          conversationId,
          senderId: state.viewerId,
          senderName: 'You',
          senderType: 'provider',
          mine: true,
          body,
          sentAt,
          saved: false,
          sending: true,
        };
        state.messages[tempId] = message;
        const thread = (state.threads[conversationId] ??= emptyThread());
        thread.ids.push(tempId);
      })
      .addCase(sendMessageAction.fulfilled, (state, action) => {
        const { conversationId, tempId } = action.meta.arg;
        const thread = (state.threads[conversationId] ??= emptyThread());
        delete state.messages[tempId];
        thread.ids = thread.ids.filter((id) => id !== tempId);
        if ('error' in action.payload) return;
        const message = toMessage(action.payload.data, action.payload.viewerId, false);
        state.messages[message.id] = { ...message, mine: true };
        thread.ids.push(message.id);
        sortThread(state, thread);
        refreshLastMessage(state, conversationId);
      })
      .addCase(sendMessageAction.rejected, (state, action) => {
        const { conversationId, tempId } = action.meta.arg;
        delete state.messages[tempId];
        const thread = state.threads[conversationId];
        if (thread) thread.ids = thread.ids.filter((id) => id !== tempId);
      })
      .addCase(deleteMessageAction.fulfilled, (state, action) => {
        if ('error' in action.payload) return;
        const { messageId, conversationId } = action.meta.arg;
        delete state.messages[messageId];
        state.savedIds = state.savedIds.filter((id) => id !== messageId);
        const thread = state.threads[conversationId];
        if (thread) thread.ids = thread.ids.filter((id) => id !== messageId);
        refreshLastMessage(state, conversationId);
      })
      .addCase(markConversationReadAction.pending, (state, action) => {
        const conversation = state.conversations[action.meta.arg.conversationId];
        if (conversation) conversation.unreadCount = 0;
      })
      .addCase(fetchMembersAction.fulfilled, (state, action) => {
        if ('error' in action.payload) return;
        state.members[action.meta.arg.conversationId] =
          action.payload.data.members.map(toParticipant);
      })
      .addCase(fetchDirectoryAction.pending, (state) => {
        state.directory.loading = true;
        state.directory.error = null;
      })
      .addCase(fetchDirectoryAction.fulfilled, (state, action) => {
        state.directory.loading = false;
        if ('error' in action.payload) {
          state.directory.error = action.payload.error;
          return;
        }
        const { viewer, providers } = action.payload.data;
        state.viewerId = viewer.id;
        state.directory.contacts = providers
          .filter((provider) => provider.id !== viewer.id)
          .map(toDirectoryContact);
        state.directory.loaded = true;
      })
      .addCase(fetchDirectoryAction.rejected, (state) => {
        state.directory.loading = false;
        state.directory.error = 'Couldn’t load the people you can message.';
      });
  },
});

export default CommunicationsReducer.reducer;
export const { toggleMessageSaved } = CommunicationsReducer.actions;

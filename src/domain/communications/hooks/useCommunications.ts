import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';

import type {
  ConversationPreview,
  Message,
} from '@/domain/communications/interfaces/CommunicationInterfaces';
import {
  fetchConversationAction,
  fetchConversationsAction,
  fetchDirectoryAction,
  fetchMembersAction,
  fetchMessagesAction,
  markConversationReadAction,
} from '@/domain/communications/store/async-actions/CommunicationAsyncActions';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

// TEMPORARY: polling until the messaging websocket URL is available.
const LIST_POLL_MS = 30_000;
const THREAD_POLL_MS = 5_000;

function useInterval(callback: () => void, ms: number) {
  useEffect(() => {
    const timer = setInterval(() => {
      if (AppState.currentState === 'active') callback();
    }, ms);
    return () => clearInterval(timer);
  }, [callback, ms]);
}

export function useConversationsSync() {
  const dispatch = useAppDispatch();
  const refresh = useCallback(() => {
    void dispatch(fetchConversationsAction());
  }, [dispatch]);

  useEffect(() => {
    void dispatch(fetchDirectoryAction()).finally(refresh);
  }, [dispatch, refresh]);

  useInterval(refresh, LIST_POLL_MS);
}

export function useConversationPreviews(): ConversationPreview[] {
  const order = useAppSelector((state) => state.communications.order);
  const conversations = useAppSelector((state) => state.communications.conversations);
  return order.map((id) => conversations[id]).filter(Boolean);
}

export function useConversationList() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.communications.listLoading);
  const loaded = useAppSelector((state) => state.communications.listLoaded);
  const error = useAppSelector((state) => state.communications.listError);
  const reload = useCallback(() => {
    void dispatch(fetchConversationsAction());
  }, [dispatch]);
  return { loading, loaded, error, reload };
}

export function useConversation(conversationId: string) {
  const dispatch = useAppDispatch();
  const conversation = useAppSelector(
    (state) => state.communications.conversations[conversationId]
  );
  const thread = useAppSelector((state) => state.communications.threads[conversationId]);
  const allMessages = useAppSelector((state) => state.communications.messages);
  const members = useAppSelector((state) => state.communications.members[conversationId]);
  const messages = (thread?.ids ?? [])
    .map((id) => allMessages[id])
    .filter((message): message is Message => message !== undefined);

  const refresh = useCallback(() => {
    void dispatch(fetchMessagesAction({ conversationId }));
  }, [dispatch, conversationId]);

  useFocusEffect(
    useCallback(() => {
      void dispatch(fetchConversationAction({ conversationId }));
      void dispatch(fetchMembersAction({ conversationId }));
      refresh();
    }, [dispatch, conversationId, refresh])
  );

  useInterval(refresh, THREAD_POLL_MS);

  const unreadCount = conversation?.unreadCount ?? 0;
  useEffect(() => {
    if (unreadCount > 0) void dispatch(markConversationReadAction({ conversationId }));
  }, [dispatch, conversationId, unreadCount]);

  const loadOlder = useCallback(() => {
    void dispatch(fetchMessagesAction({ conversationId, older: true }));
  }, [dispatch, conversationId]);

  return {
    conversation,
    messages,
    members,
    loading: !thread?.loaded && (thread?.loading ?? true),
    loadingOlder: thread?.loadingOlder ?? false,
    hasMore: thread?.hasMore ?? false,
    error: thread?.loaded ? null : (thread?.error ?? null),
    retry: refresh,
    loadOlder,
  };
}

export function useDirectory() {
  const dispatch = useAppDispatch();
  const directory = useAppSelector((state) => state.communications.directory);
  const reload = useCallback(() => {
    void dispatch(fetchDirectoryAction());
  }, [dispatch]);
  return { ...directory, reload };
}

export function useUnreadMessageCount(): number {
  return useAppSelector((state) =>
    state.communications.order.reduce(
      (total, id) => total + (state.communications.conversations[id]?.unreadCount ?? 0),
      0
    )
  );
}

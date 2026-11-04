import { buildPreviews } from '@/domain/communications/conversationList';
import type {
  ConversationPreview,
  Participant,
} from '@/domain/communications/interfaces/CommunicationInterfaces';
import { useAppSelector } from '@/store/hooks';

export function useCommunications() {
  return useAppSelector((state) => state.communications);
}

export function useConversationPreviews(): ConversationPreview[] {
  const { conversations, messages } = useCommunications();
  return buildPreviews(conversations, messages);
}

export function useConversation(conversationId: string) {
  const { conversations, messages } = useCommunications();
  return {
    conversation: conversations.find((item) => item.id === conversationId),
    messages: messages.filter((message) => message.conversationId === conversationId),
  };
}

export function useParticipants(): Participant[] {
  return useAppSelector((state) => state.communications.participants);
}

export function useUnreadMessageCount(): number {
  return useAppSelector((state) =>
    state.communications.conversations.reduce((total, item) => total + item.unreadCount, 0)
  );
}

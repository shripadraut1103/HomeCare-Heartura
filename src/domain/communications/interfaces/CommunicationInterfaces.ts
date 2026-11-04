export type CareRole = 'office' | 'pt' | 'pta' | 'ot';

export type ConversationsTab = 'all' | 'unread' | 'groups';

export interface Participant {
  id: string;
  name: string;
  role: CareRole;
}

export interface Conversation {
  id: string;
  title: string;
  kind: 'direct' | 'group';
  avatarName?: string;
  roles: CareRole[];
  auto?: boolean;
  unreadCount: number;
}

export interface Attachment {
  id: string;
  kind: 'image' | 'file';
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string | null;
  body: string;
  sentAt: string;
  saved: boolean;
  attachments?: Attachment[];
}

export interface ConversationPreview extends Conversation {
  lastMessage: Message | null;
}

export interface CommunicationsState {
  participants: Participant[];
  conversations: Conversation[];
  messages: Message[];
}

export type CareRole = 'office' | 'pt' | 'pta' | 'ot' | 'cota' | 'speech' | 'dsp';

export type ConversationsTab = 'all' | 'unread' | 'groups';

export interface Participant {
  id: string;
  name: string;
  role?: CareRole;
}

export interface LastMessage {
  id: string;
  body: string;
  sentAt: string;
  senderName: string;
  mine: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  kind: 'direct' | 'group';
  avatarName?: string;
  roles: CareRole[];
  auto?: boolean;
  unreadCount: number;
  memberCount: number;
  patientName?: string;
  lastMessage: LastMessage | null;
  lastActivityAt: string;
}

export type ConversationPreview = Conversation;

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

export interface ReplyPreview {
  senderName?: string;
  body?: string;
  available: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string | null;
  senderName: string;
  senderType: string;
  mine: boolean;
  body: string;
  sentAt: string;
  saved: boolean;
  sending?: boolean;
  replyTo?: ReplyPreview;
  attachments?: Attachment[];
}

export interface MessageThread {
  ids: string[];
  hasMore: boolean;
  loading: boolean;
  loaded: boolean;
  loadingOlder: boolean;
  error: string | null;
}

export interface DirectoryContact {
  id: string;
  name: string;
  role?: CareRole;
  discipline: string;
}

export interface CommunicationsState {
  viewerId: string | null;
  conversations: Record<string, Conversation>;
  order: string[];
  listLoading: boolean;
  listLoaded: boolean;
  listError: string | null;
  messages: Record<string, Message>;
  threads: Record<string, MessageThread>;
  members: Record<string, Participant[]>;
  directory: {
    contacts: DirectoryContact[];
    loading: boolean;
    loaded: boolean;
    error: string | null;
  };
  savedIds: string[];
}

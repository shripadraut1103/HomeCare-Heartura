export interface ApiSender {
  type: string;
  id: string | null;
  name: string;
}

export interface ApiProviderRef {
  id: string;
  name: string;
  role_tag: string;
  discipline: string;
  credential: string;
}

export interface ApiPatientRef {
  id: string;
  name: string;
  mrn: string;
}

export interface ApiMessagePreview {
  id: string;
  kind: string;
  body: string;
  created_at: string;
  sender: ApiSender;
}

export interface ApiConversation {
  id: string;
  kind: string;
  name: string;
  title: string;
  discipline: string;
  provider: ApiProviderRef | null;
  patient: ApiPatientRef | null;
  unread_count: number;
  mentions_me: boolean;
  member_count: number;
  created_at: string;
  last_message_at: string | null;
  last_message: ApiMessagePreview | null;
}

export interface ApiReplyRef {
  id: string;
  state: string;
  kind: string;
  body: string;
  sender: ApiSender | null;
}

export interface ApiMessage {
  id: string;
  kind: string;
  body: string;
  created_at: string;
  sender: ApiSender;
  conversation: string;
  mentions: string[];
  reply_to: ApiReplyRef | null;
}

export interface ApiMessagePage {
  results: ApiMessage[];
  has_more: boolean;
}

export interface ApiMessageCreate {
  body: string;
  kind: 'message';
  reply_to?: string | null;
}

export interface ApiConversationCreate {
  provider_ids?: string[];
  title?: string;
  office?: boolean;
}

export interface ApiMember {
  type: string;
  id: string;
  name: string;
  role_tag: string;
  title: string;
}

export interface ApiMembers {
  members: ApiMember[];
  includes_office: boolean;
  office_staff_count: number;
}

export interface ApiDirectoryProvider {
  id: string;
  name: string;
  role_tag: string;
  discipline: string;
  credential: string;
  first_name: string;
  last_name: string;
  supervisor_id: string | null;
  patients: string[];
}

export interface ApiDirectory {
  viewer: { id: string; side: string; name: string };
  providers: ApiDirectoryProvider[];
  staff: { id: string; first_name: string; last_name: string; title: string }[];
}

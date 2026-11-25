import type {
  ApiConversation,
  ApiDirectoryProvider,
  ApiMember,
  ApiMessage,
  ApiSender,
} from '@/domain/communications/interfaces/CommunicationApi';
import type {
  CareRole,
  Conversation,
  DirectoryContact,
  Message,
  Participant,
} from '@/domain/communications/interfaces/CommunicationInterfaces';

const ROLE_TAGS: Record<string, CareRole> = {
  pt: 'pt',
  pta: 'pta',
  ot: 'ot',
  cota: 'cota',
  speech: 'speech',
  st: 'speech',
  dsp: 'dsp',
};

const GROUP_KINDS = new Set(['group', 'auto_group', 'patient']);

export const roleFromTag = (tag: string | undefined): CareRole | undefined =>
  tag ? ROLE_TAGS[tag.trim().toLowerCase()] : undefined;

const isOfficeSender = (sender: ApiSender) => sender.type === 'office' || sender.type === 'staff';

export const isMine = (sender: ApiSender, viewerId: string | null) =>
  !isOfficeSender(sender) && sender.id !== null && sender.id === viewerId;

export function toConversation(api: ApiConversation, viewerId: string | null): Conversation {
  const group = GROUP_KINDS.has(api.kind);
  const providerRole = roleFromTag(api.provider?.role_tag);
  const roles: CareRole[] = group
    ? []
    : api.provider
      ? providerRole
        ? [providerRole]
        : []
      : ['office'];
  return {
    id: api.id,
    title: api.name || api.title || 'Conversation',
    kind: group ? 'group' : 'direct',
    avatarName: api.provider?.name ?? api.name,
    roles,
    auto: api.kind === 'auto_group' || undefined,
    unreadCount: api.unread_count,
    memberCount: api.member_count,
    patientName: api.patient?.name,
    lastMessage: api.last_message
      ? {
          id: api.last_message.id,
          body: api.last_message.body,
          sentAt: api.last_message.created_at,
          senderName: api.last_message.sender.name,
          mine: isMine(api.last_message.sender, viewerId),
        }
      : null,
    lastActivityAt: api.last_message_at ?? api.created_at,
  };
}

export function toMessage(api: ApiMessage, viewerId: string | null, saved: boolean): Message {
  const reply = api.reply_to;
  return {
    id: api.id,
    conversationId: api.conversation,
    senderId: api.sender.id,
    senderName: api.sender.name,
    senderType: api.sender.type,
    mine: isMine(api.sender, viewerId),
    body: api.body,
    sentAt: api.created_at,
    saved,
    replyTo: reply
      ? {
          available: reply.state === 'ok',
          body: reply.state === 'ok' ? reply.body : undefined,
          senderName: reply.state === 'ok' ? reply.sender?.name : undefined,
        }
      : undefined,
  };
}

export const toParticipant = (member: ApiMember): Participant => ({
  id: member.id,
  name: member.name,
  role: member.type === 'staff' ? 'office' : roleFromTag(member.role_tag),
});

export const toDirectoryContact = (provider: ApiDirectoryProvider): DirectoryContact => ({
  id: provider.id,
  name: provider.name,
  role: roleFromTag(provider.role_tag),
  discipline: provider.discipline,
});

export function senderOf(
  message: Message,
  members: readonly Participant[] | undefined
): Participant {
  if (message.senderType === 'office' || message.senderType === 'staff') {
    return {
      id: message.senderId ?? 'office',
      name: message.senderName || 'Office',
      role: 'office',
    };
  }
  const member = members?.find((item) => item.id === message.senderId);
  return { id: message.senderId ?? '', name: message.senderName, role: member?.role };
}

import type {
  ConversationPreview,
  ConversationsTab,
  Message,
} from '@/domain/communications/interfaces/CommunicationInterfaces';
import { formatRelativeDay, formatTime } from '@/utils/dateFormat';
import { getFirstName } from '@/utils/nameFormat';

const DAY_MS = 86_400_000;
const RECENT_DAYS = 7;

const shortDateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' });
const dayStart = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

export function filterPreviews(
  previews: ConversationPreview[],
  tab: ConversationsTab,
  query: string
): ConversationPreview[] {
  const needle = query.trim().toLowerCase();
  return previews.filter((preview) => {
    if (tab === 'unread' && preview.unreadCount === 0) return false;
    if (tab === 'groups' && preview.kind !== 'group') return false;
    if (!needle) return true;
    return [preview.title, preview.patientName, preview.lastMessage?.body].some((text) =>
      text?.toLowerCase().includes(needle)
    );
  });
}

export function formatConversationTime(iso: string, now = new Date()) {
  const date = new Date(iso);
  const days = Math.round((dayStart(now) - dayStart(date)) / DAY_MS);
  if (days <= 0) return formatTime(date);
  if (days === 1) return 'Yesterday';
  if (days < RECENT_DAYS) return weekdayFormatter.format(date);
  return shortDateFormatter.format(date);
}

export function previewText(preview: ConversationPreview) {
  const message = preview.lastMessage;
  if (!message) return 'No messages yet';
  if (message.mine) return `You: ${message.body}`;
  if (preview.kind === 'direct' || !message.senderName) return message.body;
  return `${getFirstName(message.senderName)}: ${message.body}`;
}

export type ChatItem =
  { type: 'day'; key: string; label: string } | { type: 'message'; key: string; message: Message };

export function buildChatItems(messages: Message[], now = new Date()): ChatItem[] {
  const items: ChatItem[] = [];
  let currentDay: number | null = null;
  for (const message of [...messages].sort((a, b) => a.sentAt.localeCompare(b.sentAt))) {
    const date = new Date(message.sentAt);
    const day = dayStart(date);
    if (day !== currentDay) {
      currentDay = day;
      items.push({ type: 'day', key: `day-${day}`, label: formatRelativeDay(date, now) });
    }
    items.push({ type: 'message', key: message.id, message });
  }
  return items.reverse();
}

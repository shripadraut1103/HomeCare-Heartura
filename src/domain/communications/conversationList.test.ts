import {
  buildChatItems,
  filterPreviews,
  formatConversationTime,
  previewText,
} from '@/domain/communications/conversationList';
import type {
  Conversation,
  Message,
} from '@/domain/communications/interfaces/CommunicationInterfaces';

const conversation = (overrides: Partial<Conversation>): Conversation => ({
  id: 'c',
  title: 'Office',
  kind: 'direct',
  roles: ['office'],
  unreadCount: 0,
  memberCount: 2,
  lastMessage: null,
  lastActivityAt: '2026-09-03T10:00:00Z',
  ...overrides,
});

const office = conversation({
  id: 'c-office',
  unreadCount: 2,
  lastMessage: {
    id: 'm1',
    body: 'Booked for Friday',
    sentAt: '2026-09-03T10:00:00Z',
    senderName: 'Office',
    mine: false,
  },
});
const team = conversation({
  id: 'c-team',
  title: 'PT team',
  kind: 'group',
  roles: [],
  patientName: 'Gina Mancuso',
  lastMessage: {
    id: 'm2',
    body: 'I’ll check it Thursday',
    sentAt: '2026-09-02T10:00:00Z',
    senderName: 'Jamie Ortiz',
    mine: false,
  },
});

const message = (id: string, sentAt: string): Message => ({
  id,
  conversationId: 'c-office',
  senderId: 'office',
  senderName: 'Office',
  senderType: 'office',
  mine: false,
  body: id,
  sentAt,
  saved: false,
});

describe('conversationList', () => {
  it('filters by tab and by name, patient or last message', () => {
    const ids = (tab: 'all' | 'unread' | 'groups', query = '') =>
      filterPreviews([office, team], tab, query).map((preview) => preview.id);

    expect(ids('groups')).toEqual(['c-team']);
    expect(ids('unread')).toEqual(['c-office']);
    expect(ids('all', 'friday')).toEqual(['c-office']);
    expect(ids('all', 'mancuso')).toEqual(['c-team']);
  });

  it('prefixes group previews with the sender’s first name and mine with You', () => {
    expect(previewText(team)).toBe('Jamie: I’ll check it Thursday');
    expect(previewText(office)).toBe('Booked for Friday');
    expect(previewText({ ...office, lastMessage: { ...office.lastMessage!, mine: true } })).toBe(
      'You: Booked for Friday'
    );
    expect(previewText(conversation({}))).toBe('No messages yet');
  });

  it('labels times relative to today', () => {
    const now = new Date(2026, 8, 3, 12);
    expect(formatConversationTime(new Date(2026, 8, 3, 10, 7).toISOString(), now)).toBe('10:07 AM');
    expect(formatConversationTime(new Date(2026, 8, 2, 18).toISOString(), now)).toBe('Yesterday');
    expect(formatConversationTime(new Date(2026, 7, 20).toISOString(), now)).toBe('Aug 20');
  });

  it('adds a day label before each day, newest first', () => {
    const items = buildChatItems([
      message('m1', new Date(2026, 8, 2, 15).toISOString()),
      message('m2', new Date(2026, 8, 3, 8).toISOString()),
      message('m3', new Date(2026, 8, 3, 10).toISOString()),
    ]);
    expect(items.filter((item) => item.type === 'day')).toHaveLength(2);
    expect(items[items.length - 1].type).toBe('day');
    expect(items[0]).toMatchObject({ type: 'message', key: 'm3' });
  });
});

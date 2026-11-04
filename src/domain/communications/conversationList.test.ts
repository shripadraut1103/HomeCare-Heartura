import {
  buildChatItems,
  buildPreviews,
  filterPreviews,
  formatConversationTime,
  previewText,
} from '@/domain/communications/conversationList';
import {
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
  MOCK_PARTICIPANTS,
} from '@/domain/communications/mocks/CommunicationMocks';

const previews = buildPreviews(MOCK_CONVERSATIONS, MOCK_MESSAGES);

describe('conversationList', () => {
  it('orders by latest message and puts empty conversations last', () => {
    expect(previews.map((preview) => preview.id)).toEqual([
      'c-office',
      'c-jamie',
      'c-rollator',
      'c-pt-team',
    ]);
  });

  it('filters by tab and by title or message text', () => {
    const ids = (tab: 'all' | 'unread' | 'groups', query = '') =>
      filterPreviews(previews, MOCK_MESSAGES, tab, query).map((preview) => preview.id);

    expect(ids('groups')).toEqual(['c-rollator', 'c-pt-team']);
    expect(ids('unread')).not.toContain('c-pt-team');
    expect(ids('all', 'cpt code')).toEqual(['c-jamie']);
    expect(ids('all', 'pt team')).toEqual(['c-pt-team']);
  });

  it('prefixes group previews with the sender’s first name', () => {
    const rollator = previews.find((preview) => preview.id === 'c-rollator')!;
    expect(previewText(rollator, MOCK_PARTICIPANTS)).toBe(
      'Jamie: I’ll check it at Thursday’s visit.'
    );
  });

  it('summarizes attachment-only messages', () => {
    const jamie = previews.find((preview) => preview.id === 'c-jamie')!;
    const withPhoto = {
      ...jamie,
      lastMessage: {
        ...jamie.lastMessage!,
        senderId: null,
        body: '',
        attachments: [{ id: 'a1', kind: 'image' as const, uri: 'file:///a.jpg', name: 'a.jpg' }],
      },
    };
    expect(previewText(withPhoto, MOCK_PARTICIPANTS)).toBe('You: 📎 Photo');
  });

  it('labels times relative to today', () => {
    const now = new Date(2026, 8, 3, 12);
    expect(formatConversationTime(new Date(2026, 8, 3, 10, 7).toISOString(), now)).toBe('10:07 AM');
    expect(formatConversationTime(new Date(2026, 8, 2, 18).toISOString(), now)).toBe('Yesterday');
    expect(formatConversationTime(new Date(2026, 7, 20).toISOString(), now)).toBe('Aug 20');
  });

  it('adds a day label before each day, newest first', () => {
    const office = MOCK_MESSAGES.filter((message) => message.conversationId === 'c-office');
    const items = buildChatItems(office);

    expect(items.filter((item) => item.type === 'day')).toHaveLength(2);
    expect(items[items.length - 1].type).toBe('day');
    expect(items[0]).toMatchObject({ type: 'message', key: 'm7' });
  });
});

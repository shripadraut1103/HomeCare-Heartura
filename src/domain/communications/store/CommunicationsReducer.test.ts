import type {
  ApiConversation,
  ApiMessage,
} from '@/domain/communications/interfaces/CommunicationApi';
import {
  deleteMessageAction,
  fetchConversationsAction,
  fetchMessagesAction,
  sendMessageAction,
} from '@/domain/communications/store/async-actions/CommunicationAsyncActions';
import reducer from '@/domain/communications/store/CommunicationsReducer';

const ME = 'me-id';

const apiConversation = (
  id: string,
  overrides: Partial<ApiConversation> = {}
): ApiConversation => ({
  id,
  kind: 'direct',
  name: 'Office',
  title: '',
  discipline: '',
  provider: null,
  patient: null,
  unread_count: 0,
  mentions_me: false,
  member_count: 2,
  created_at: '2026-11-01T00:00:00Z',
  last_message_at: null,
  last_message: null,
  ...overrides,
});

const apiMessage = (id: string, minute: number, senderId: string | null = ME): ApiMessage => ({
  id,
  kind: 'message',
  body: `body ${id}`,
  created_at: `2026-11-25T10:${String(minute).padStart(2, '0')}:00Z`,
  sender: senderId
    ? { type: 'provider', id: senderId, name: senderId === ME ? 'Me' : 'Jamie Ortiz' }
    : { type: 'office', id: null, name: 'Office' },
  conversation: 'c1',
  mentions: [],
  reply_to: null,
});

const loaded = () => {
  let state = reducer(
    undefined,
    fetchConversationsAction.fulfilled(
      {
        data: [
          apiConversation('c1', { unread_count: 2 }),
          apiConversation('c2', {
            kind: 'auto_group',
            name: 'PT team',
            last_message_at: '2026-11-20T00:00:00Z',
          }),
        ],
        viewerId: ME,
      },
      'r1'
    )
  );
  state = reducer(
    state,
    fetchMessagesAction.fulfilled(
      {
        data: { results: [apiMessage('m1', 1, null), apiMessage('m2', 2)], has_more: true },
        viewerId: ME,
      },
      'r2',
      { conversationId: 'c1' }
    )
  );
  return state;
};

describe('CommunicationsReducer', () => {
  it('maps conversations: office chat, auto group and unread counts', () => {
    const state = loaded();
    expect(state.conversations.c1).toMatchObject({ kind: 'direct', roles: ['office'] });
    expect(state.conversations.c2).toMatchObject({ kind: 'group', auto: true, roles: [] });
    expect(state.conversations.c1.unreadCount).toBe(2);
  });

  it('marks only my own messages as mine and tracks the latest message', () => {
    const state = loaded();
    expect(state.messages.m1.mine).toBe(false);
    expect(state.messages.m2.mine).toBe(true);
    expect(state.threads.c1).toMatchObject({ ids: ['m1', 'm2'], hasMore: true });
    expect(state.conversations.c1.lastMessage).toMatchObject({ id: 'm2', mine: true });
  });

  it('prepends older pages and drops messages deleted elsewhere on refresh', () => {
    let state = reducer(
      loaded(),
      fetchMessagesAction.fulfilled(
        { data: { results: [apiMessage('m0', 0, 'jamie')], has_more: false }, viewerId: ME },
        'r3',
        { conversationId: 'c1', older: true }
      )
    );
    expect(state.threads.c1.ids).toEqual(['m0', 'm1', 'm2']);
    expect(state.threads.c1.hasMore).toBe(false);

    state = reducer(
      state,
      fetchMessagesAction.fulfilled(
        { data: { results: [apiMessage('m1', 1, null)], has_more: true }, viewerId: ME },
        'r4',
        { conversationId: 'c1' }
      )
    );
    expect(state.threads.c1.ids).toEqual(['m0', 'm1']);
    expect(state.messages.m2).toBeUndefined();
  });

  it('shows a pending message while sending and swaps in the saved one', () => {
    const arg = { conversationId: 'c1', body: 'hi', tempId: 'tmp', sentAt: '2026-11-25T10:05:00Z' };
    let state = reducer(loaded(), sendMessageAction.pending('r5', arg));
    expect(state.messages.tmp).toMatchObject({ sending: true, mine: true });

    state = reducer(
      state,
      sendMessageAction.fulfilled({ data: apiMessage('m3', 5), viewerId: ME }, 'r5', arg)
    );
    expect(state.messages.tmp).toBeUndefined();
    expect(state.threads.c1.ids).toEqual(['m1', 'm2', 'm3']);
    expect(state.conversations.c1.lastMessage?.id).toBe('m3');
  });

  it('removes the pending message when sending fails', () => {
    const arg = { conversationId: 'c1', body: 'hi', tempId: 'tmp', sentAt: '2026-11-25T10:05:00Z' };
    let state = reducer(loaded(), sendMessageAction.pending('r6', arg));
    state = reducer(
      state,
      sendMessageAction.fulfilled(
        { error: 'No', code: 'SERVER_ERROR', status: 500, details: {}, fields: {}, viewerId: ME },
        'r6',
        arg
      )
    );
    expect(state.threads.c1.ids).toEqual(['m1', 'm2']);
  });

  it('deletes my message and updates the preview', () => {
    const state = reducer(
      loaded(),
      deleteMessageAction.fulfilled({ data: null }, 'r7', { messageId: 'm2', conversationId: 'c1' })
    );
    expect(state.threads.c1.ids).toEqual(['m1']);
    expect(state.conversations.c1.lastMessage?.id).toBe('m1');
  });
});

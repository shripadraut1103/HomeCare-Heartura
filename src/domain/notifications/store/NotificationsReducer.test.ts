import type { ApiNotification } from '@/domain/notifications/interfaces/NotificationApi';
import { getNotificationTarget } from '@/domain/notifications/notificationTargets';
import {
  fetchNotificationsAction,
  fetchUnreadCountAction,
  markNotificationsReadAction,
} from '@/domain/notifications/store/async-actions/NotificationAsyncActions';
import notificationsReducer from '@/domain/notifications/store/NotificationsReducer';

const VISIT = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const PATIENT = '9b2f1c7e-1d2a-4c3b-8e4f-5a6b7c8d9e0f';

const apiNotification = (
  id: string,
  overrides: Partial<ApiNotification> = {}
): ApiNotification => ({
  id,
  kind: 'missed_clock_in',
  category: 'evv',
  level: 'attention',
  title: `Title ${id}`,
  body: 'Body',
  data: {},
  read_at: null,
  created_at: '2026-11-24T09:00:00Z',
  ...overrides,
});

const arg = { date: '2026-11-24', category: 'evv' as const };

const loaded = () => {
  let state = notificationsReducer(
    undefined,
    fetchUnreadCountAction.fulfilled(
      { data: { count: 3, by_category: { evv: 2, office: 1, unknown: 9 } } },
      'r0'
    )
  );
  state = notificationsReducer(
    state,
    fetchNotificationsAction.fulfilled(
      {
        data: {
          count: 3,
          page: 1,
          page_size: 100,
          total_pages: 1,
          next: null,
          previous: null,
          results: [
            apiNotification('a'),
            apiNotification('b', { level: 'info' }),
            apiNotification('c', { read_at: '2026-11-24T10:00:00Z' }),
          ],
        },
      },
      'r1',
      arg
    )
  );
  return state;
};

describe('NotificationsReducer', () => {
  it('maps the list and the unread counts, ignoring unknown categories', () => {
    const state = loaded();
    expect(state.lists['2026-11-24|evv'].ids).toEqual(['a', 'b', 'c']);
    expect(state.byId.a).toMatchObject({ read: false, level: 'attention', message: 'Body' });
    expect(state.byId.c.read).toBe(true);
    expect(state.unread).toEqual({ total: 3, byCategory: { plans: 0, office: 1, evv: 2 } });
  });

  it('marks one notification read straight away and lowers the counts', () => {
    const state = notificationsReducer(
      loaded(),
      markNotificationsReadAction.pending('r2', { ids: ['a', 'c'] })
    );
    expect(state.byId.a.read).toBe(true);
    expect(state.unread.total).toBe(2);
    expect(state.unread.byCategory.evv).toBe(1);
  });

  it('marks everything read when no ids are given', () => {
    const state = notificationsReducer(loaded(), markNotificationsReadAction.pending('r3', {}));
    expect(Object.values(state.byId).every((item) => item.read)).toBe(true);
    expect(state.unread.total).toBe(0);
  });
});

describe('getNotificationTarget', () => {
  const withUrl = (url?: string) => ({
    ...loaded().byId.a,
    url,
  });

  it('opens a visit or a patient from the portal link', () => {
    expect(getNotificationTarget(withUrl(`/schedule?appointment=${VISIT}`))).toEqual({
      type: 'visit',
      visitId: VISIT,
    });
    expect(getNotificationTarget(withUrl(`/patients/${PATIENT}/chart`))).toEqual({
      type: 'screen',
      href: { pathname: '/patient/[id]', params: { id: PATIENT } },
    });
  });

  it('has nowhere to go without a known link', () => {
    expect(getNotificationTarget(withUrl())).toBeNull();
    expect(getNotificationTarget(withUrl('/settings/profile'))).toBeNull();
  });
});

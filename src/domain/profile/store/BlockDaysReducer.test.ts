import type { ApiBlockDay } from '@/domain/profile/interfaces/AvailabilityApi';
import {
  createBlockDayAction,
  deleteBlockDayAction,
  fetchBlockDaysAction,
  updateBlockDayAction,
} from '@/domain/profile/store/async-actions/AvailabilityAsyncActions';
import blockDaysReducer from '@/domain/profile/store/BlockDaysReducer';

const apiBlock = (
  id: string,
  start_date: string,
  start_time: string | null = null
): ApiBlockDay => ({
  id,
  provider: 'p1',
  provider_name: 'Pat Provider',
  title: id,
  start_date,
  end_date: null,
  start_time,
  end_time: start_time ? '23:00:00' : null,
  notify_office: true,
  version: 1,
  created_at: '2026-11-01T00:00:00Z',
  updated_at: '2026-11-01T00:00:00Z',
});

const page = (results: ApiBlockDay[]) => ({
  data: {
    count: results.length,
    page: 1,
    page_size: 100,
    total_pages: 1,
    next: null,
    previous: null,
    results,
  },
  providerId: 'p1',
});

const loaded = () =>
  blockDaysReducer(
    undefined,
    fetchBlockDaysAction.fulfilled(
      page([
        apiBlock('late', '2026-12-10', '15:00:00'),
        apiBlock('allDay', '2026-12-01'),
        apiBlock('early', '2026-12-10', '08:00:00'),
      ]),
      'r1'
    )
  );

const ids = (state: ReturnType<typeof loaded>) => state.blockedDays.map((day) => day.id);

describe('BlockDaysReducer', () => {
  it('maps the API rows and keeps them in date and time order', () => {
    const state = loaded();
    expect(state.loaded).toBe(true);
    expect(ids(state)).toEqual(['allDay', 'early', 'late']);
    expect(state.blockedDays[0]).toMatchObject({ endDate: '2026-12-01', hours: undefined });
    expect(state.blockedDays[1].hours).toEqual({ start: '08:00', end: '23:00' });
  });

  it('keeps the list when loading fails', () => {
    const state = blockDaysReducer(
      loaded(),
      fetchBlockDaysAction.fulfilled(
        { error: 'Nope', code: 'SERVER_ERROR', status: 500, details: {}, fields: {} },
        'r2'
      )
    );
    expect(state.error).toBe('Nope');
    expect(ids(state)).toEqual(['allDay', 'early', 'late']);
  });

  it('adds, updates and removes blocks from the server responses', () => {
    const draft = {
      title: 'x',
      startDate: '2026-12-05',
      endDate: '2026-12-05',
      notifyOffice: true,
    };
    let state = blockDaysReducer(
      loaded(),
      createBlockDayAction.fulfilled({ data: apiBlock('new', '2026-12-05') }, 'r3', draft)
    );
    expect(ids(state)).toEqual(['allDay', 'new', 'early', 'late']);

    state = blockDaysReducer(
      state,
      updateBlockDayAction.fulfilled(
        { data: { ...apiBlock('new', '2026-12-20'), version: 2 } },
        'r4',
        { id: 'new', draft }
      )
    );
    expect(ids(state)).toEqual(['allDay', 'early', 'late', 'new']);
    expect(state.blockedDays[3].version).toBe(2);

    const removed = state.blockedDays[0];
    state = blockDaysReducer(
      state,
      deleteBlockDayAction.fulfilled({ data: undefined }, 'r5', removed)
    );
    expect(ids(state)).toEqual(['early', 'late', 'new']);
  });
});

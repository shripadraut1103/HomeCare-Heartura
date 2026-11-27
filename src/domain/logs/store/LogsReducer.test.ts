import type { ApiActivity, ApiVisitLog, ApiVisitLogRow } from '@/domain/logs/interfaces/LogApi';
import { visitLogDates } from '@/domain/logs/logMapper';
import logsReducer from '@/domain/logs/store/LogsReducer';
import {
  fetchActivityAction,
  fetchVisitLogAction,
} from '@/domain/logs/store/async-actions/LogAsyncActions';

const apiActivity = (id: string, day = '2026-11-20'): ApiActivity => ({
  id,
  at: `${day}T15:00:00Z`,
  day,
  kind: 'note',
  activity: 'assessment.signed',
  title: 'Signed OT daily note',
  subtitle: 'Gina Mancuso · OT visit',
  patient: { id: 'p1', name: 'Gina Mancuso' },
});

const page = (results: ApiActivity[], next: string | null = null) => ({
  data: { count: 30, page: 1, page_size: 25, total_pages: 2, next, previous: null, results },
});

const apiRow = (overrides: Partial<ApiVisitLogRow> = {}): ApiVisitLogRow => ({
  id: 'v1',
  date: '2026-11-20',
  start_time: '10:00:00',
  end_time: '11:00:00',
  clock_in: null,
  clock_out: null,
  duration_min: 60,
  units: 4,
  patient: { id: 'p1', name: 'Gina Mancuso', mrn: 'HOP-1' },
  service_code: 'ot',
  service_label: 'Occupational therapy',
  visit_type: 'daily',
  visit_type_label: 'Daily visit',
  billing_code: '97535 HI',
  evv_status: 'not_recorded',
  evv_label: 'Not recorded',
  note_status: 'draft',
  note_label: 'Not signed',
  miles: null,
  ...overrides,
});

const visitLog = (results: ApiVisitLogRow[]): { data: ApiVisitLog } => ({
  data: {
    date_from: '2026-11-13',
    date_to: '2026-11-26',
    summary: { visits: 1, minutes: 60, hours: 1, units: 4, miles: null, not_signed: 1 },
    results,
  },
});

describe('LogsReducer activity', () => {
  it('replaces on page 1 and appends later pages without duplicates', () => {
    let state = logsReducer(
      undefined,
      fetchActivityAction.pending('a', { filter: 'all', page: 1 })
    );
    state = logsReducer(
      state,
      fetchActivityAction.fulfilled(page([apiActivity('1'), apiActivity('2')], 'next'), 'a', {
        filter: 'all',
        page: 1,
      })
    );
    expect(state.activity.entries.map((entry) => entry.id)).toEqual(['1', '2']);
    expect(state.activity.hasMore).toBe(true);
    expect(state.activity.total).toBe(30);

    state = logsReducer(state, fetchActivityAction.pending('b', { filter: 'all', page: 2 }));
    state = logsReducer(
      state,
      fetchActivityAction.fulfilled(page([apiActivity('2'), apiActivity('3')]), 'b', {
        filter: 'all',
        page: 2,
      })
    );
    expect(state.activity.entries.map((entry) => entry.id)).toEqual(['1', '2', '3']);
    expect(state.activity.hasMore).toBe(false);
  });

  it('clears the list on a new filter and ignores the superseded response', () => {
    let state = logsReducer(
      undefined,
      fetchActivityAction.pending('a', { filter: 'all', page: 1 })
    );
    state = logsReducer(state, fetchActivityAction.pending('b', { filter: 'note', page: 1 }));
    expect(state.activity.filter).toBe('note');

    state = logsReducer(
      state,
      fetchActivityAction.fulfilled(page([apiActivity('old')]), 'a', { filter: 'all', page: 1 })
    );
    expect(state.activity.entries).toEqual([]);
    expect(state.activity.loading).toBe(true);

    state = logsReducer(
      state,
      fetchActivityAction.fulfilled(page([apiActivity('new')]), 'b', { filter: 'note', page: 1 })
    );
    expect(state.activity.entries.map((entry) => entry.id)).toEqual(['new']);
  });

  it('keeps the entries and sets the error when a load fails', () => {
    const error = { error: 'Nope', code: 'X', status: 500, details: {}, fields: {} };
    let state = logsReducer(
      undefined,
      fetchActivityAction.pending('a', { filter: 'all', page: 1 })
    );
    state = logsReducer(
      state,
      fetchActivityAction.fulfilled(error, 'a', { filter: 'all', page: 1 })
    );
    expect(state.activity.error).toBe('Nope');
    expect(state.activity.loading).toBe(false);
  });
});

describe('LogsReducer visit log', () => {
  it('maps rows, prefers clock times and parses miles', () => {
    let state = logsReducer(undefined, fetchVisitLogAction.pending('a', { range: 14 }));
    state = logsReducer(
      state,
      fetchVisitLogAction.fulfilled(
        visitLog([
          apiRow(),
          apiRow({ id: 'v2', clock_in: '10:05:00', clock_out: '11:02:00', miles: '12.5' }),
        ]),
        'a',
        { range: 14 }
      )
    );
    const [booked, clocked] = state.visitLog.entries;
    expect(booked).toMatchObject({ start: '10:00', end: '11:00', miles: null });
    expect(clocked).toMatchObject({ start: '10:05', end: '11:02', miles: 12.5 });
    expect(state.visitLog.summary).toEqual({
      visits: 1,
      hours: 1,
      units: 4,
      miles: null,
      notSigned: 1,
    });
    expect(state.visitLog.dateFrom).toBe('2026-11-13');
  });

  it('resets on a new range', () => {
    let state = logsReducer(undefined, fetchVisitLogAction.pending('a', { range: 14 }));
    state = logsReducer(
      state,
      fetchVisitLogAction.fulfilled(visitLog([apiRow()]), 'a', { range: 14 })
    );
    state = logsReducer(state, fetchVisitLogAction.pending('b', { range: 30 }));
    expect(state.visitLog.range).toBe(30);
    expect(state.visitLog.entries).toEqual([]);
    expect(state.visitLog.summary).toBeNull();
  });
});

describe('visitLogDates', () => {
  it('covers the range including today', () => {
    expect(visitLogDates(14, new Date(2026, 10, 26))).toEqual({
      date_from: '2026-11-13',
      date_to: '2026-11-26',
    });
    expect(visitLogDates(90, new Date(2026, 0, 31))).toEqual({
      date_from: '2025-11-03',
      date_to: '2026-01-31',
    });
  });
});

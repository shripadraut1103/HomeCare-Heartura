import {
  toApiRange,
  toAvailabilityRanges,
  toBlockDayWrite,
} from '@/domain/profile/availabilityMapper';

describe('availabilityMapper', () => {
  it('maps API weekdays (0 = Monday) and trims seconds', () => {
    const [range] = toAvailabilityRanges([
      {
        effective_from: '2026-12-01',
        effective_to: '2027-11-30',
        days: [
          { weekday: 0, windows: [{ start_time: '13:00:00', end_time: '17:00:00' }] },
          { weekday: 0, windows: [{ start_time: '08:00:00', end_time: '12:00:00' }] },
          { weekday: 6, windows: [{ start_time: '09:00:00', end_time: '11:00:00' }] },
        ],
      },
    ]);
    expect(range.id).toBe('2026-12-01_2027-11-30');
    expect(range.days.mon).toEqual([
      { start: '08:00', end: '12:00' },
      { start: '13:00', end: '17:00' },
    ]);
    expect(range.days.sun).toEqual([{ start: '09:00', end: '11:00' }]);
    expect(range.days.tue).toEqual([]);
  });

  it('sends only the days that have hours', () => {
    const body = toApiRange({
      id: 'r',
      startDate: '2026-12-01',
      endDate: '2026-12-31',
      days: {
        mon: [],
        tue: [{ start: '09:00', end: '17:00' }],
        wed: [],
        thu: [],
        fri: [],
        sat: [],
        sun: [],
      },
    });
    expect(body).toEqual({
      effective_from: '2026-12-01',
      effective_to: '2026-12-31',
      days: [{ weekday: 1, windows: [{ start_time: '09:00:00', end_time: '17:00:00' }] }],
    });
  });

  it('sends a single-day, all-day block without end date or times', () => {
    expect(
      toBlockDayWrite('p1', {
        title: 'Vacation',
        startDate: '2026-12-24',
        endDate: '2026-12-24',
        notifyOffice: false,
      })
    ).toEqual({
      provider: 'p1',
      title: 'Vacation',
      start_date: '2026-12-24',
      end_date: null,
      start_time: null,
      end_time: null,
      notify_office: false,
    });
    expect(
      toBlockDayWrite('p1', {
        title: 'Training',
        startDate: '2026-12-01',
        endDate: '2026-12-03',
        hours: { start: '09:00', end: '13:00' },
        notifyOffice: true,
      })
    ).toMatchObject({ end_date: '2026-12-03', start_time: '09:00:00', end_time: '13:00:00' });
  });
});

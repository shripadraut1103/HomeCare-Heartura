import { getCurrentRange } from '@/domain/profile/availability';
import type { AvailabilityRange } from '@/domain/profile/interfaces/ProfileInterfaces';

const range = (id: string, startDate: string, endDate?: string): AvailabilityRange => ({
  id,
  startDate,
  endDate,
  days: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
});

const ranges = [range('fall', '2026-09-01', '2026-12-31'), range('spring', '2027-01-01')];

describe('getCurrentRange', () => {
  it('picks the range covering today', () => {
    expect(getCurrentRange(ranges, new Date(2026, 10, 3))?.id).toBe('fall');
    expect(getCurrentRange(ranges, new Date(2027, 5, 1))?.id).toBe('spring');
  });

  it('falls back to the next upcoming range', () => {
    expect(getCurrentRange(ranges, new Date(2026, 0, 1))?.id).toBe('fall');
  });

  it('is undefined with no ranges', () => {
    expect(getCurrentRange([])).toBeUndefined();
  });
});

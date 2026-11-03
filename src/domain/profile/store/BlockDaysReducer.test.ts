import type { BlockDaysState, BlockedDay } from '@/domain/profile/interfaces/ProfileInterfaces';
import blockDaysReducer, {
  addBlockedDay,
  removeBlockedDay,
} from '@/domain/profile/store/BlockDaysReducer';

const initialState = blockDaysReducer(undefined, { type: 'init' });
const ids = (state: typeof initialState) => state.blockedDays.map((day) => day.id);

const block = (id: string, startDate: string, start?: string): BlockedDay => ({
  id,
  title: id,
  startDate,
  endDate: startDate,
  hours: start ? { start, end: '23:00' } : undefined,
  notifyOffice: true,
});

describe('BlockDaysReducer', () => {
  it('keeps blocks in date and time order', () => {
    const empty: BlockDaysState = { blockedDays: [] };
    const state = [
      block('late', '2026-09-10', '15:00'),
      block('allDay', '2026-09-01'),
      block('early', '2026-09-10', '08:00'),
    ].reduce((current, day) => blockDaysReducer(current, addBlockedDay(day)), empty);

    expect(ids(state)).toEqual(['allDay', 'early', 'late']);
  });

  it('puts a removed block back in place when it is added again (undo)', () => {
    const removed = initialState.blockedDays[1];
    const without = blockDaysReducer(initialState, removeBlockedDay({ id: removed.id }));
    const restored = blockDaysReducer(without, addBlockedDay(removed));

    expect(ids(without)).not.toContain(removed.id);
    expect(ids(restored)).toEqual(ids(initialState));
  });
});

import type {
  AvailabilityRange,
  TimeSlot,
  Weekday,
} from '@/domain/profile/interfaces/ProfileInterfaces';
import {
  formatNumericDate,
  formatTime,
  parseIsoDate,
  parseTimeOfDay,
  toIsoDate,
} from '@/utils/dateFormat';

export const WEEKDAYS: readonly { id: Weekday; short: string; long: string }[] = [
  { id: 'mon', short: 'Mon', long: 'Monday' },
  { id: 'tue', short: 'Tue', long: 'Tuesday' },
  { id: 'wed', short: 'Wed', long: 'Wednesday' },
  { id: 'thu', short: 'Thu', long: 'Thursday' },
  { id: 'fri', short: 'Fri', long: 'Friday' },
  { id: 'sat', short: 'Sat', long: 'Saturday' },
  { id: 'sun', short: 'Sun', long: 'Sunday' },
];

export const DEFAULT_SLOT: TimeSlot = { start: '09:00', end: '17:00' };

export const formatSlot = (slot: TimeSlot) =>
  `${formatTime(parseTimeOfDay(slot.start))} – ${formatTime(parseTimeOfDay(slot.end))}`;

export const formatRangeDates = (range: AvailabilityRange) => {
  const start = formatNumericDate(parseIsoDate(range.startDate));
  return range.endDate
    ? `${start} – ${formatNumericDate(parseIsoDate(range.endDate))}`
    : `From ${start}`;
};

export const countAvailableDays = (range: AvailabilityRange) =>
  WEEKDAYS.filter((day) => range.days[day.id].length > 0).length;

export function getCurrentRange(ranges: readonly AvailabilityRange[], today = new Date()) {
  const date = toIsoDate(today);
  return (
    ranges.find((range) => range.startDate <= date && (!range.endDate || range.endDate >= date)) ??
    ranges.find((range) => range.startDate > date) ??
    ranges.at(-1)
  );
}

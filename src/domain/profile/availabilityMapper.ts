import { WEEKDAYS } from '@/domain/profile/availability';
import type {
  ApiBlockDay,
  ApiBlockDayWrite,
  ApiRange,
  ApiWindow,
} from '@/domain/profile/interfaces/AvailabilityApi';
import type {
  AvailabilityRange,
  BlockedDay,
  TimeSlot,
  Weekday,
} from '@/domain/profile/interfaces/ProfileInterfaces';

const toClock = (time: string) => time.slice(0, 5);

const toApiTime = (clock: string) => `${clock}:00`;

const toSlot = (window: ApiWindow): TimeSlot => ({
  start: toClock(window.start_time),
  end: toClock(window.end_time),
});

const bySlotStart = (a: TimeSlot, b: TimeSlot) => a.start.localeCompare(b.start);

export const rangeId = (startDate: string, endDate: string) => `${startDate}_${endDate}`;

export function toAvailabilityRange(range: ApiRange): AvailabilityRange {
  const days = Object.fromEntries(WEEKDAYS.map(({ id }) => [id, [] as TimeSlot[]])) as Record<
    Weekday,
    TimeSlot[]
  >;
  for (const day of range.days) {
    const weekday = WEEKDAYS[day.weekday]?.id;
    if (weekday) days[weekday] = [...days[weekday], ...day.windows.map(toSlot)].sort(bySlotStart);
  }
  return {
    id: rangeId(range.effective_from, range.effective_to),
    startDate: range.effective_from,
    endDate: range.effective_to,
    days,
  };
}

export const toAvailabilityRanges = (ranges: readonly ApiRange[]) =>
  ranges.map(toAvailabilityRange).sort((a, b) => a.startDate.localeCompare(b.startDate));

export const toApiRange = (range: AvailabilityRange): ApiRange => ({
  effective_from: range.startDate,
  effective_to: range.endDate,
  days: WEEKDAYS.map(({ id }, weekday) => ({
    weekday,
    windows: range.days[id].map((slot) => ({
      start_time: toApiTime(slot.start),
      end_time: toApiTime(slot.end),
    })),
  })).filter((day) => day.windows.length > 0),
});

export function toBlockedDay(block: ApiBlockDay): BlockedDay {
  return {
    id: block.id,
    title: block.title,
    startDate: block.start_date,
    endDate: block.end_date ?? block.start_date,
    hours:
      block.start_time && block.end_time
        ? { start: toClock(block.start_time), end: toClock(block.end_time) }
        : undefined,
    notifyOffice: block.notify_office,
    version: block.version,
  };
}

export const toBlockDayWrite = (
  providerId: string,
  block: Omit<BlockedDay, 'id' | 'version'>
): ApiBlockDayWrite => ({
  provider: providerId,
  title: block.title,
  start_date: block.startDate,
  end_date: block.endDate === block.startDate ? null : block.endDate,
  start_time: block.hours ? toApiTime(block.hours.start) : null,
  end_time: block.hours ? toApiTime(block.hours.end) : null,
  notify_office: block.notifyOffice,
});

export const byBlockStart = (a: BlockedDay, b: BlockedDay) =>
  `${a.startDate}${a.hours?.start ?? ''}`.localeCompare(`${b.startDate}${b.hours?.start ?? ''}`);

const longDateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

export const formatLongDate = (date: Date) => longDateFormatter.format(date);

export function formatTimeParts(date: Date) {
  const parts = timeFormatter.formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return {
    time: `${value('hour')}:${value('minute')}`,
    period: value('dayPeriod').toLowerCase(),
  };
}

export function getGreeting(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const shortDateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' });

export const formatTime = (date: Date) => timeFormatter.format(date);

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

export function formatRelativeDay(date: Date, now = new Date()) {
  const days = Math.round((startOfDay(date) - startOfDay(now)) / 86_400_000);
  const day =
    days === 0
      ? 'Today'
      : days === 1
        ? 'Tomorrow'
        : days === -1
          ? 'Yesterday'
          : weekdayFormatter.format(date);
  return `${day}, ${shortDateFormatter.format(date)}`;
}

const numericDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: '2-digit',
  day: '2-digit',
  year: 'numeric',
});

export const formatNumericDate = (date: Date) => numericDateFormatter.format(date);

export function parseNumericDate(value: string) {
  const [month, day, year] = value.split('/').map(Number);
  return new Date(year, month - 1, day);
}

export function formatAge(dateOfBirth: Date, now = new Date()) {
  let months =
    (now.getFullYear() - dateOfBirth.getFullYear()) * 12 +
    (now.getMonth() - dateOfBirth.getMonth());
  if (now.getDate() < dateOfBirth.getDate()) months -= 1;
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  return remainder === 0 ? `${years} yrs` : `${years} yrs ${remainder} mos`;
}

export function formatTimeRange(start: Date, end: Date) {
  const from = formatTimeParts(start);
  const to = formatTimeParts(end);
  const period = (value: string) => value.toUpperCase();
  return from.period === to.period
    ? `${from.time}–${to.time} ${period(to.period)}`
    : `${from.time} ${period(from.period)}–${to.time} ${period(to.period)}`;
}

const clockTimeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

export const formatClockTime = (date: Date) => clockTimeFormatter.format(date).toLowerCase();

const monthDayFormatter = new Intl.DateTimeFormat('en-US', { month: '2-digit', day: '2-digit' });

export const formatMonthDay = (date: Date) => monthDayFormatter.format(date);

const pad = (value: number) => String(value).padStart(2, '0');

export const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export function parseIsoDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export const toTimeOfDay = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

export function parseTimeOfDay(value: string, day = new Date()) {
  const [hours, minutes] = value.split(':').map(Number);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes);
}

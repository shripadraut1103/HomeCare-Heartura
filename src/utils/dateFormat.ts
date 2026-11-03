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
  const day = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : weekdayFormatter.format(date);
  return `${day}, ${shortDateFormatter.format(date)}`;
}

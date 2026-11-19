import type { SelectOption } from '@/components/ui/Select';

// TEMPORARY: only the patients list still reads this; booking uses the reference endpoint.
export const SERVICE_LOCATIONS: readonly (SelectOption<string> & { short: string })[] = [
  { value: 'private-home', label: 'Private home · 12 · EVV required', short: 'Private home' },
  { value: 'group-home', label: 'Group home · 14 · EVV exempt', short: 'Group home' },
  { value: 'community', label: 'Community · 99 · EVV exempt', short: 'Community' },
  { value: 'virtual', label: 'Virtual · 02 · EVV exempt', short: 'Virtual' },
];

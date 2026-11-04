import type { SelectOption } from '@/components/ui/Select';

// TEMPORARY: fixed lists until the scheduling API returns them per agency and patient.

export const SERVICE_LOCATIONS: readonly (SelectOption<string> & { short: string })[] = [
  { value: 'private-home', label: 'Private home · 12 · EVV required', short: 'Private home' },
  { value: 'group-home', label: 'Group home · 14 · EVV exempt', short: 'Group home' },
  { value: 'community', label: 'Community · 99 · EVV exempt', short: 'Community' },
  { value: 'virtual', label: 'Virtual · 02 · EVV exempt', short: 'Virtual' },
];

export const SERVICES: readonly (SelectOption<string> & {
  visitType: string;
  defaultMinutes: number;
})[] = [
  { value: 'pt-evaluation', label: 'PT · Evaluation', visitType: 'Evaluation', defaultMinutes: 60 },
  { value: 'pt-daily', label: 'PT · Daily visit', visitType: 'Daily visit', defaultMinutes: 45 },
  {
    value: 'pt-reevaluation',
    label: 'PT · Re-evaluation',
    visitType: 'Re-evaluation',
    defaultMinutes: 45,
  },
  { value: 'pt-discharge', label: 'PT · Discharge', visitType: 'Discharge', defaultMinutes: 45 },
];

export const findLocation = (value: string | null) =>
  SERVICE_LOCATIONS.find((option) => option.value === value);

export const findService = (value: string | null) =>
  SERVICES.find((option) => option.value === value);

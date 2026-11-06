import type { HistoryCategory, HistoryEntry } from '@/domain/patients/interfaces/PatientInterfaces';

export const HISTORY_CATEGORIES: readonly HistoryCategory[] = [
  'surgical',
  'medical',
  'family',
  'social',
];

export const HISTORY_LABELS: Record<HistoryCategory, string> = {
  surgical: 'Surgical',
  medical: 'Medical',
  family: 'Family',
  social: 'Social',
};

export const COLLAPSED_HISTORY = 4;
const WIDE_NOTE_LENGTH = 90;
const SUMMARY_LENGTH = 30;

type Field = { label: string; value: string };

export type HistoryView = {
  subtitle?: string;
  fields: Field[];
  note?: { text: string; wide: boolean };
};

const present = (fields: { label: string; value?: string }[]): Field[] =>
  fields.filter((field): field is Field => Boolean(field.value));

const joined = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(' · ') || undefined;

export function historyView(entry: HistoryEntry): HistoryView {
  const fields =
    entry.category === 'surgical'
      ? present([
          { label: 'Date', value: entry.date },
          { label: 'Facility', value: entry.facility },
        ])
      : entry.category === 'medical'
        ? present([{ label: 'Diagnosed', value: entry.date }])
        : entry.category === 'family'
          ? present([
              { label: 'Relative', value: entry.relative },
              { label: 'Onset age', value: entry.onsetAge },
            ])
          : present([{ label: 'Detail', value: entry.detail }]);

  const subtitle =
    entry.category === 'surgical'
      ? joined(entry.date, entry.facility)
      : entry.category === 'medical'
        ? entry.date
        : entry.category === 'family'
          ? joined(entry.relative, entry.onsetAge)
          : entry.summary;

  return {
    subtitle,
    fields,
    note: entry.note
      ? { text: entry.note, wide: fields.length !== 1 || entry.note.length > WIDE_NOTE_LENGTH }
      : undefined,
  };
}

export const socialSummary = (detail: string) =>
  detail.length <= SUMMARY_LENGTH ? detail : undefined;

import { asList } from '@/domain/notes/hooks/useNoteForm';
import type {
  NoteField,
  NoteFieldValue,
  NoteFormValues,
  NoteSection,
} from '@/domain/notes/interfaces/NoteInterfaces';

export type ReadOnlyRow = { label: string; value?: string };
export type ReadOnlyCard = { title: string; rows: ReadOnlyRow[] };
export type ReadOnlySection = { title: string; cards: ReadOnlyCard[] };

const text = (value: NoteFieldValue | undefined) => {
  if (value === undefined) return undefined;
  const joined = typeof value === 'string' ? value : value.join(', ');
  return joined.trim() || undefined;
};

function rowsFor(field: NoteField, values: NoteFormValues, prefix = ''): ReadOnlyRow[] {
  const id = (fieldId: string) => `${prefix}${fieldId}`;
  switch (field.type) {
    case 'readOnly':
      return [{ label: field.label, value: text(values[id(field.id)]) ?? field.value }];
    case 'shortText': {
      const value = text(values[id(field.id)]);
      if (field.showWhen && !value && text(values[id(field.showWhen.id)]) !== field.showWhen.value)
        return [];
      return [{ label: field.label, value }];
    }
    case 'longText':
    case 'select':
    case 'choice':
      return [{ label: field.label, value: text(values[id(field.id)]) }];
    case 'multiSelect':
      return [{ label: field.label ?? 'Selected', value: text(values[id(field.id)]) }];
    case 'group':
      return field.fields.flatMap((child) => rowsFor(child, values, prefix));
    case 'repeat': {
      const keys = asList(values[id(field.id)]);
      return keys.length === 0
        ? field.fields.flatMap((child) => rowsFor(child, {}, ''))
        : keys.flatMap((key) =>
            field.fields.flatMap((child) => rowsFor(child, values, `${id(field.id)}.${key}.`))
          );
    }
    default:
      return [];
  }
}

export function readOnlySections(
  sections: readonly NoteSection[],
  values: NoteFormValues
): ReadOnlySection[] {
  return sections
    .map((section) => {
      const hasSubsections = section.fields.some((field) => field.type === 'subsection');
      const cards: ReadOnlyCard[] = [];
      let loose: ReadOnlyCard | null = null;
      for (const field of section.fields) {
        if (field.type === 'subsection') {
          loose = null;
          cards.push({
            title: field.title,
            rows: field.fields.flatMap((child) => rowsFor(child, values)),
          });
          continue;
        }
        const rows = rowsFor(field, values);
        if (rows.length === 0) continue;
        if (!loose) {
          loose = { title: hasSubsections ? rows[0].label : section.title, rows: [] };
          cards.push(loose);
        }
        loose.rows.push(...rows);
      }
      return { title: section.title, cards: cards.filter((card) => card.rows.length > 0) };
    })
    .filter((section) => section.cards.length > 0);
}

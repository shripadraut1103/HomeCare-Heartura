import { useState } from 'react';

import type {
  NoteField,
  NoteFieldValue,
  NoteFormValues,
  NoteSection,
} from '@/domain/notes/interfaces/NoteInterfaces';

type RequiredField = Extract<NoteField, { id: string; required?: boolean }>;

const isRequired = (field: NoteField): field is RequiredField =>
  'required' in field && field.required === true;

const flatten = (fields: readonly NoteField[]): NoteField[] =>
  fields.flatMap((field) =>
    field.type === 'group' || field.type === 'subsection' ? flatten(field.fields) : [field]
  );

export const asText = (value: NoteFieldValue | undefined) =>
  typeof value === 'string' ? value : '';

const isEmpty = (value: NoteFieldValue | undefined) =>
  value === undefined || (typeof value === 'string' ? value.trim() === '' : value.length === 0);

export const asList = (value: NoteFieldValue | undefined): readonly string[] =>
  Array.isArray(value) ? value : [];

const isSameValue = (a: NoteFieldValue | undefined, b: NoteFieldValue | undefined) =>
  (isEmpty(a) && isEmpty(b)) || JSON.stringify(a) === JSON.stringify(b);

export function useNoteForm(sections: readonly NoteSection[], initialValues: NoteFormValues = {}) {
  const [values, setValues] = useState<NoteFormValues>(initialValues);
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());
  const [showErrors, setShowErrors] = useState(false);

  const missing = sections.flatMap((section) =>
    flatten(section.fields)
      .filter(isRequired)
      .filter((field) => asText(values[field.id]).trim() === '')
      .map((field) => ({ sectionId: section.id, fieldId: field.id }))
  );
  const missingFieldIds = new Set(missing.map(({ fieldId }) => fieldId));
  const isDirty = Object.keys({ ...initialValues, ...values }).some(
    (fieldId) => !isSameValue(values[fieldId], initialValues[fieldId])
  );

  const setValue = (fieldId: string, value: NoteFieldValue) =>
    setValues((current) => ({ ...current, [fieldId]: value }));

  const applyValues = (next: NoteFormValues) => setValues((current) => ({ ...current, ...next }));

  const countOverwrites = (next: NoteFormValues) =>
    Object.entries(next).filter(([fieldId, value]) => {
      const current = values[fieldId];
      return !isEmpty(current) && JSON.stringify(current) !== JSON.stringify(value);
    }).length;

  const toggleOption = (fieldId: string, option: string) =>
    setValues((current) => {
      const selected = asList(current[fieldId]);
      return {
        ...current,
        [fieldId]: selected.includes(option)
          ? selected.filter((item) => item !== option)
          : [...selected, option],
      };
    });

  const toggleSection = (sectionId: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });

  const expandSections = (sectionIds: readonly string[]) =>
    setExpanded((current) => new Set([...current, ...sectionIds]));

  const validate = () => {
    if (missing.length === 0) return true;
    setShowErrors(true);
    setExpanded((current) => new Set([...current, ...missing.map(({ sectionId }) => sectionId)]));
    return false;
  };

  const errorFor = (fieldId: string) =>
    showErrors && missingFieldIds.has(fieldId) ? 'Required' : undefined;

  return {
    values,
    isDirty,
    expanded,
    setValue,
    applyValues,
    countOverwrites,
    toggleOption,
    toggleSection,
    expandSections,
    validate,
    errorFor,
  };
}

export type NoteForm = ReturnType<typeof useNoteForm>;

import { useState } from 'react';

import type {
  NoteSection,
  NoteTemplate,
  NoteTemplateKind,
  PendingNote,
  PreviousNote,
  ProgressNoteDue,
} from '@/domain/notes/interfaces/NoteInterfaces';
import {
  MOCK_EVALUATION_SECTIONS,
  MOCK_PREVIOUS_EVALUATIONS,
  MOCK_EVALUATION_TEMPLATES,
  MOCK_PROGRESS_NOTE_SECTIONS,
  MOCK_PROGRESS_NOTE_TEMPLATES,
  MOCK_PROGRESS_NOTES_DUE,
} from '@/domain/notes/mocks/NoteMocks';
import { useAppSelector } from '@/store/hooks';

export function usePendingNotes(): PendingNote[] {
  return useAppSelector((state) => state.notes.pending);
}

export function usePendingNote(noteId: string | undefined): PendingNote | undefined {
  return useAppSelector((state) =>
    noteId ? state.notes.pending.find((note) => note.id === noteId) : undefined
  );
}

/** TEMPORARY: mock data; switch to the notes service once the API exists. */
export function useProgressNotesDue(): ProgressNoteDue[] {
  const [notes] = useState(MOCK_PROGRESS_NOTES_DUE);
  return notes;
}

export function useProgressNoteDue(noteId: string | undefined): ProgressNoteDue | undefined {
  return useProgressNotesDue().find((note) => note.id === noteId);
}

const TEMPLATE_LIBRARY: Record<
  NoteTemplateKind,
  { templates: NoteTemplate[]; sections: NoteSection[] }
> = {
  progress: { templates: MOCK_PROGRESS_NOTE_TEMPLATES, sections: MOCK_PROGRESS_NOTE_SECTIONS },
  evaluation: { templates: MOCK_EVALUATION_TEMPLATES, sections: MOCK_EVALUATION_SECTIONS },
};

/** TEMPORARY: mock data; switch to the templates service once the API exists. */
export function useNoteTemplates(kind: NoteTemplateKind): {
  templates: NoteTemplate[];
  sections: NoteSection[];
} {
  const [library] = useState(() => TEMPLATE_LIBRARY[kind]);
  return library;
}

/** TEMPORARY: mock data; switch to the notes service once the API exists. */
export function usePreviousEvaluations(patientId: string | undefined): PreviousNote[] {
  const [notes] = useState(MOCK_PREVIOUS_EVALUATIONS);
  return notes.filter((note) => note.patientId === patientId);
}

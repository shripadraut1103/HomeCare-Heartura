import { useState } from 'react';

import type {
  DailyNoteDefaults,
  NoteComponent,
  NoteSection,
  NoteTemplate,
  NoteTemplateKind,
  PendingNote,
  PreviousNote,
  PreviousNoteKind,
  ProgressNoteDue,
} from '@/domain/notes/interfaces/NoteInterfaces';
import {
  MOCK_DAILY_NOTE_COMPONENTS,
  MOCK_DAILY_NOTE_DEFAULTS,
  MOCK_DAILY_NOTE_SECTIONS,
  MOCK_DAILY_NOTE_TEMPLATES,
  MOCK_CARE_PLAN_COMPONENTS,
  MOCK_CARE_PLAN_SECTIONS,
  MOCK_CARE_PLAN_TEMPLATES,
  MOCK_EVALUATION_SECTIONS,
  MOCK_PREVIOUS_CARE_PLANS,
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

type TemplateLibrary = {
  templates: NoteTemplate[];
  sections: NoteSection[];
  components: NoteComponent[];
};

const TEMPLATE_LIBRARY: Record<NoteTemplateKind, TemplateLibrary> = {
  progress: {
    templates: MOCK_PROGRESS_NOTE_TEMPLATES,
    sections: MOCK_PROGRESS_NOTE_SECTIONS,
    components: [],
  },
  evaluation: {
    templates: MOCK_EVALUATION_TEMPLATES,
    sections: MOCK_EVALUATION_SECTIONS,
    components: [],
  },
  carePlan: {
    templates: MOCK_CARE_PLAN_TEMPLATES,
    sections: MOCK_CARE_PLAN_SECTIONS,
    components: MOCK_CARE_PLAN_COMPONENTS,
  },
  dailyNote: {
    templates: MOCK_DAILY_NOTE_TEMPLATES,
    sections: MOCK_DAILY_NOTE_SECTIONS,
    components: MOCK_DAILY_NOTE_COMPONENTS,
  },
};

const PREVIOUS_NOTES: Record<PreviousNoteKind, PreviousNote[]> = {
  evaluation: MOCK_PREVIOUS_EVALUATIONS,
  carePlan: MOCK_PREVIOUS_CARE_PLANS,
};

/** TEMPORARY: mock data; switch to the templates service once the API exists. */
export function useNoteTemplates(kind: NoteTemplateKind): TemplateLibrary {
  const [library] = useState(() => TEMPLATE_LIBRARY[kind]);
  return library;
}

/** TEMPORARY: mock data; switch to the notes service once the API exists. */
export function usePreviousNotes(
  kind: PreviousNoteKind,
  patientId: string | undefined
): PreviousNote[] {
  const [notes] = useState(() => PREVIOUS_NOTES[kind]);
  return notes.filter((note) => note.patientId === patientId);
}

/** TEMPORARY: mock data; switch to the visits and authorizations services once the API exists. */
export function useDailyNoteDefaults(): DailyNoteDefaults {
  const [defaults] = useState(MOCK_DAILY_NOTE_DEFAULTS);
  return defaults;
}

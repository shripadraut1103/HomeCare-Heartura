import type { ProgressNoteDue } from '@/domain/notes/interfaces/NoteInterfaces';

export const VISITS_PER_PROGRESS_NOTE = 10;

export const isProgressNoteDueNow = (note: ProgressNoteDue) =>
  note.visitsCompleted >= note.visitsPerNote;

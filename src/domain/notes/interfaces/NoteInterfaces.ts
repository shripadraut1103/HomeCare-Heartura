import type { ThemeColor } from '@/constants/Theme';

export type NotesTab = 'pending' | 'progress';

export type PendingNoteKind = 'evaluation' | 'carePlan' | 'dailyNote' | 'coSign';

export type PendingNoteStatus = 'notSigned' | 'draft' | 'review';

export type PendingNoteOwner = 'mine' | 'assistant';

export interface PendingNote {
  id: string;
  patientId: string;
  patientName: string;
  kind: PendingNoteKind;
  owner: PendingNoteOwner;
  label: string;
  details: string;
  status: PendingNoteStatus;
  review?: AssistantNoteReview;
  draft?: NoteDraft;
}

export interface NoteDraft {
  discipline: string;
  visitAt: string;
  dateOfBirth: string;
  savedAt?: string;
  prefill?: NoteFormValues;
}

export interface PreviousNote {
  id: string;
  patientId: string;
  title: string;
  date: string;
  status: 'Signed' | 'Closed';
  answers: NoteFormValues;
}

export type NoteTemplateKind = 'progress' | 'evaluation' | 'carePlan' | 'dailyNote';

export type PreviousNoteKind = 'evaluation' | 'carePlan';

export interface AssistantNoteReview {
  noteType: string;
  discipline: string;
  author: string;
  signedAt: string;
  visitStart: string;
  durationMinutes: number;
  billing: { code: string; units: number; authorization: string };
  location: string;
  sections: readonly { title: string; text: string }[];
}

export interface ProgressNoteDue {
  id: string;
  patientId: string;
  patientName: string;
  discipline: string;
  visitsCompleted: number;
  visitsPerNote: number;
  details: string;
  treatedBy?: string;
  visitAt: string;
  dateOfBirth: string;
  patientCode: string;
  servicePeriod: { start: string; end: string };
  diagnosis: string;
  therapist: string;
  prefill: NoteFormValues;
}

export interface NoteTemplate {
  id: string;
  name: string;
  isDefault?: boolean;
}

export type NoteField =
  | { type: 'patientDetails' }
  | {
      type: 'readOnly';
      id: string;
      label: string;
      value?: string;
      layout?: 'inline' | 'stacked';
    }
  | {
      type: 'longText';
      id: string;
      label: string;
      placeholder?: string;
      required?: boolean;
      showRequiredMark?: boolean;
    }
  | {
      type: 'shortText';
      id: string;
      label: string;
      placeholder?: string;
      required?: boolean;
      showRequiredMark?: boolean;
      numeric?: boolean;
      narrow?: boolean;
      locked?: boolean;
      showWhen?: { id: string; value: string };
    }
  | {
      type: 'select';
      id: string;
      label: string;
      options: readonly string[];
      placeholder?: string;
      required?: boolean;
    }
  | {
      type: 'choice';
      id: string;
      label: string;
      options: readonly string[];
      required?: boolean;
    }
  | { type: 'multiSelect'; id: string; label?: string; options: readonly string[] }
  | {
      type: 'group';
      caption?: string;
      title?: string;
      columns?: 2;
      fields: readonly NoteField[];
    }
  | { type: 'subsection'; title: string; required?: boolean; fields: readonly NoteField[] }
  | {
      type: 'repeat';
      id: string;
      fields: readonly NoteField[];
      addLabel: string;
      removeLabel: string;
      blockTitle?: string;
      addStyle?: 'link' | 'dashed';
      max?: number;
      fixed?: boolean;
    }
  | { type: 'divider' }
  | { type: 'notice'; text: string };

export type NoteFieldValue = string | readonly string[];

export type NoteFormValues = Record<string, NoteFieldValue>;

export type GoalTracking = 'Percentage' | 'Trials' | 'Duration';

export interface DailyNoteGoal {
  id: string;
  text: string;
  trackedAs: GoalTracking;
}

export interface DailyNoteDefaults {
  provider: string;
  durationMinutes: number;
  serviceLocations: readonly string[];
  procedureCodes: readonly string[];
  authorization?: string;
  unitsWeekOf: string;
  goals: readonly DailyNoteGoal[];
}

export interface Signature {
  signer: string;
  strokes: readonly (readonly { x: number; y: number }[])[];
  signedAt: string;
}

export interface IncidentReport {
  id: string;
  occurredAt: string;
  description: string;
}

export interface NoteComponent {
  id: string;
  title: string;
  sectionId: string;
  fields: readonly NoteField[];
}

export interface NoteSection {
  id: string;
  title: string;
  source?: string;
  accent: ThemeColor;
  fields: readonly NoteField[];
}

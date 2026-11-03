import type { IconName } from '@/components/ui/Icon';
import type { ThemeColor } from '@/constants/Theme';
import type {
  PendingNoteKind,
  PendingNoteStatus,
  ProgressNoteDue,
} from '@/domain/notes/interfaces/NoteInterfaces';
import { isProgressNoteDueNow } from '@/domain/notes/noteRules';

export type NoteStatusStyle = {
  label: string;
  color: ThemeColor;
  background: ThemeColor;
  dot: ThemeColor;
};

export const PENDING_NOTE_STATUS: Record<PendingNoteStatus, NoteStatusStyle> = {
  notSigned: {
    label: 'Not signed',
    color: 'toneBlueFg',
    background: 'toneBlueBg',
    dot: 'toneBlueFg',
  },
  draft: {
    label: 'Draft',
    color: 'textSecondary',
    background: 'backgroundElement',
    dot: 'textSecondary',
  },
  review: {
    label: 'Review',
    color: 'textSecondary',
    background: 'backgroundElement',
    dot: 'textSecondary',
  },
};

const PENCIL: IconName = { ios: 'pencil.line', android: 'edit' };

export const PENDING_NOTE_ICON: Record<PendingNoteKind, IconName> = {
  evaluation: PENCIL,
  carePlan: PENCIL,
  dailyNote: { ios: 'doc', android: 'description' },
  coSign: { ios: 'signature', android: 'signature' },
};

const DUE_NOW_STATUS: NoteStatusStyle = {
  label: 'Due now',
  color: 'toneAmberFg',
  background: 'toneAmberBg',
  dot: 'toneAmberFg',
};

const UPCOMING_STATUS = (label: string): NoteStatusStyle => ({
  label,
  color: 'toneBlueFg',
  background: 'toneBlueBg',
  dot: 'toneBlueFg',
});

export const getProgressNoteStatus = (note: ProgressNoteDue, dueLabel = 'Due now') =>
  isProgressNoteDueNow(note)
    ? { ...DUE_NOW_STATUS, label: dueLabel }
    : UPCOMING_STATUS(`${note.visitsCompleted}/${note.visitsPerNote}`);

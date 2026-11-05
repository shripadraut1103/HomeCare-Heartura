import { asList, asText } from '@/domain/notes/hooks/useNoteForm';
import type {
  DailyNoteDefaults,
  DailyNoteGoal,
  GoalTracking,
  NoteField,
  NoteFormValues,
  NoteSection,
  PendingNote,
} from '@/domain/notes/interfaces/NoteInterfaces';

export const DAILY_NOTE = {
  start: 'dailyNote.visit.start',
  end: 'dailyNote.visit.end',
  location: 'dailyNote.visit.location',
  billing: 'dailyNote.billing',
  diagnosis: 'dailyNote.diagnosis',
  clockIn: 'dailyNote.evv.in',
  clockOut: 'dailyNote.evv.out',
} as const;

export const billingCodeId = (key: string) => `${DAILY_NOTE.billing}.${key}.code`;
export const billingUnitsId = (key: string) => `${DAILY_NOTE.billing}.${key}.units`;

const UNIT_MINUTES = 15;
const MINUTE_MS = 60_000;

export const unitsFor = (minutes: number) => Math.floor(Math.max(0, minutes) / UNIT_MINUTES);

export function minutesBetween(startIso: string, endIso: string) {
  const minutes = Math.round((Date.parse(endIso) - Date.parse(startIso)) / MINUTE_MS);
  return Number.isFinite(minutes) ? Math.max(0, minutes) : 0;
}

export const addMinutes = (iso: string, minutes: number) =>
  new Date(Date.parse(iso) + minutes * MINUTE_MS).toISOString();

const DIAGNOSIS_KEYS = ['eval.primaryDiagnosis', 'carePlan.primaryDiagnosis'];

export function dailyNotePrefill(note: PendingNote, defaults: DailyNoteDefaults): NoteFormValues {
  const draft = note.draft;
  if (!draft) return {};
  const prefill = draft.prefill ?? {};
  const diagnosis = DIAGNOSIS_KEYS.map((key) => asText(prefill[key])).find(Boolean);
  const own = note.kind === 'dailyNote' ? prefill : {};

  return {
    [DAILY_NOTE.start]: draft.visitAt,
    [DAILY_NOTE.end]: addMinutes(draft.visitAt, defaults.durationMinutes),
    [DAILY_NOTE.location]: defaults.serviceLocations[0] ?? '',
    [DAILY_NOTE.billing]: ['b1'],
    [billingCodeId('b1')]: defaults.procedureCodes[0] ?? '',
    [billingUnitsId('b1')]: String(unitsFor(defaults.durationMinutes)),
    ...(diagnosis ? { [DAILY_NOTE.diagnosis]: diagnosis } : {}),
    ...own,
  };
}

const TRACKING: readonly GoalTracking[] = ['Percentage', 'Trials', 'Duration'];

export function dailyNoteGoals(note: PendingNote, fallback: readonly DailyNoteGoal[]) {
  const prefill = note.draft?.prefill ?? {};
  const keys = note.kind === 'carePlan' ? asList(prefill['carePlan.goals']) : [];
  const goals = keys
    .map((key): DailyNoteGoal => {
      const trackedAs = asText(prefill[`carePlan.goals.${key}.trackedAs`]) as GoalTracking;
      return {
        id: key,
        text: asText(prefill[`carePlan.goals.${key}.goal`]),
        trackedAs: TRACKING.includes(trackedAs) ? trackedAs : 'Percentage',
      };
    })
    .filter((goal) => goal.text !== '');
  return goals.length > 0 ? goals : fallback;
}

const ACHIEVED_LABEL: Record<GoalTracking, string> = {
  Percentage: 'Achieved today, percent',
  Trials: 'Trials achieved today',
  Duration: 'Minutes achieved today',
};

const ASSISTANCE = ['None', 'Verbal cues', 'Visual cues', 'Tactile cues', 'Hand-over-hand'];
const LEVELS = ['Independent', 'Min', 'Mod', 'Max'];

const goalFields = (goal: DailyNoteGoal): NoteField[] => {
  const id = (field: string) => `dailyNote.goal.${goal.id}.${field}`;
  return [
    {
      type: 'select',
      id: id('assistance'),
      label: 'Assistance',
      options: ASSISTANCE,
      placeholder: 'Select',
    },
    { type: 'choice', id: id('level'), label: 'Level', options: LEVELS },
    {
      type: 'shortText',
      id: id('achieved'),
      label: `${ACHIEVED_LABEL[goal.trackedAs]}: ${goal.text}`,
      numeric: true,
    },
    {
      type: 'shortText',
      id: id('note'),
      label: 'Note',
      placeholder: 'How it went, e.g. needed two cues on the bad side',
    },
  ];
};

export const goalsSection = (goals: readonly DailyNoteGoal[]): NoteSection => ({
  id: 'goals',
  title: 'Goals',
  accent: 'accent',
  fields: goals.flatMap(goalFields),
});

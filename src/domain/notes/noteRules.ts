import type {
  NoteFormValues,
  PendingNote,
  ProgressNoteDue,
} from '@/domain/notes/interfaces/NoteInterfaces';

export const VISITS_PER_PROGRESS_NOTE = 10;

export const isProgressNoteDueNow = (note: ProgressNoteDue) =>
  note.visitsCompleted >= note.visitsPerNote;

export const INTAKE_STEPS = ['Evaluation', 'Care plan', 'Daily note'] as const;

export const INTAKE_STEP = { evaluation: 0, carePlan: 1, dailyNote: 2 } as const;

const EVALUATION_TO_CARE_PLAN: Record<string, string> = {
  'eval.patientId': 'carePlan.patientNumber',
  'eval.dateOfBirth': 'carePlan.dateOfBirth',
  'eval.primaryDiagnosis': 'carePlan.primaryDiagnosis',
  'eval.secondaryDiagnosis': 'carePlan.secondaryDiagnosis',
};

export function carePlanPrefill(note: PendingNote): NoteFormValues | undefined {
  const prefill = note.draft?.prefill;
  if (note.kind !== 'evaluation' || !prefill) return prefill;
  const values: NoteFormValues = {};
  for (const [from, to] of Object.entries(EVALUATION_TO_CARE_PLAN)) {
    if (prefill[from] !== undefined) values[to] = prefill[from];
  }
  if (typeof prefill['eval.startOfCare'] === 'string')
    values['carePlan.evaluationDate'] = `${prefill['eval.startOfCare']} · Initial`;
  return values;
}

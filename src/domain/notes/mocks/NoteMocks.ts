import { MOCK_USER } from '@/domain/auth/mocks/AuthMocks';
import type {
  DailyNoteDefaults,
  NoteComponent,
  NoteField,
  NoteSection,
  NoteTemplate,
  PendingNote,
  PreviousNote,
  ProgressNoteDue,
} from '@/domain/notes/interfaces/NoteInterfaces';
import { VISITS_PER_PROGRESS_NOTE } from '@/domain/notes/noteRules';

/**
 * TEMPORARY: notes until the API exists.
 * Delete this file once the notes hooks read from the service.
 */

/** Today (or `daysFromToday` away) at the given local time, as ISO. */
const at = (hours: number, minutes: number, daysFromToday = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

export const MOCK_PENDING_NOTES: PendingNote[] = [
  {
    id: 'pn1',
    patientId: 'p-theo-lindgren',
    patientName: 'Theo Lindgren',
    kind: 'evaluation',
    owner: 'mine',
    label: 'Evaluation',
    details: '09/03/2026 · 11:00 AM · PT · signature missing',
    status: 'notSigned',
    draft: {
      discipline: 'PT',
      visitAt: at(11, 0),
      dateOfBirth: '02/18/2001',
      savedAt: at(11, 59),
      prefill: {
        'eval.primaryDiagnosis': 'Q90.9 · Down syndrome, unspecified',
        'eval.secondaryDiagnosis': 'R27.8 · Other lack of coordination',
        'eval.startOfCare': '09/03/2026',
        'eval.discipline': 'Physical therapy',
        'eval.patientId': '002',
        'eval.rec.timesFrom': '2',
        'eval.rec.per': 'week',
        'eval.rec.minutesFrom': '60',
        'eval.dateOfBirth': '02/18/2001',
        'eval.pain': '0',
      },
    },
  },
  {
    id: 'pn2',
    patientId: 'p-eli-nakamura',
    patientName: 'Eli Nakamura',
    kind: 'dailyNote',
    owner: 'mine',
    label: 'Daily note',
    details: '09/01/2026 · 1:30 PM · PT',
    status: 'notSigned',
    draft: {
      discipline: 'PT',
      visitAt: new Date(2026, 8, 1, 13, 30).toISOString(),
      dateOfBirth: '07/21/1991',
      savedAt: new Date(2026, 8, 1, 14, 40).toISOString(),
      prefill: {
        'dailyNote.diagnosis': 'F71 · Moderate intellectual disabilities',
        'dailyNote.goal.brushTeeth.achieved': '30',
        'dailyNote.goal.buttons.achieved': '3',
        'dailyNote.goal.catchBall.achieved': '4',
      },
    },
  },
  {
    id: 'pn3',
    patientId: 'p-luca-bertrand',
    patientName: 'Luca Bertrand',
    kind: 'carePlan',
    owner: 'mine',
    label: 'Care plan',
    details: '09/01/2026 · 9:00 AM · PT · saved, not submitted',
    status: 'draft',
    draft: {
      discipline: 'PT',
      visitAt: new Date(2026, 8, 1, 9, 0).toISOString(),
      dateOfBirth: '09/30/1988',
      savedAt: new Date(2026, 8, 1, 9, 52).toISOString(),
      prefill: {
        'carePlan.patientNumber': '021',
        'carePlan.dateOfBirth': '09/30/1988',
        'carePlan.evaluationDate': '09/01/2026 · Initial',
        'carePlan.primaryDiagnosis': 'F71 · Moderate intellectual disabilities',
        'carePlan.secondaryDiagnosis': 'R26.89 · Other abnormalities of gait',
        'carePlan.timesFrom': '2',
        'carePlan.per': 'week',
        'carePlan.minutesFrom': '60',
        'carePlan.estimatedDuration': '6',
        'carePlan.durationUnit': 'month(s)',
        'carePlan.dischargeDate': '02/28/2027',
        'carePlan.modalities': ['Individual'],
        'carePlan.goals': ['g1', 'g2', 'g3'],
        'carePlan.goals.g1.areaOfConcern': 'Gross motor / Mobility',
        'carePlan.goals.g1.goal': 'Walk 10 steps independently',
        'carePlan.goals.g1.term': 'Short-term',
        'carePlan.goals.g1.trackedAs': 'Trials',
        'carePlan.goals.g1.targetTrials': '10',
        'carePlan.goals.g2.areaOfConcern': 'Balance',
        'carePlan.goals.g2.goal': 'Stand on one foot for 5 seconds',
        'carePlan.goals.g2.term': 'Short-term',
        'carePlan.goals.g2.trackedAs': 'Trials',
        'carePlan.goals.g2.targetTrials': '5',
        'carePlan.goals.g3.areaOfConcern': 'Gross motor / Mobility',
        'carePlan.goals.g3.goal': 'Climb 12 stairs with one handrail, step over step',
        'carePlan.goals.g3.term': 'Number of weeks',
        'carePlan.goals.g3.weeks': '12',
        'carePlan.goals.g3.trackedAs': 'Percentage',
      },
    },
  },
  {
    id: 'pn4',
    patientId: 'p-sofia-delgado',
    patientName: 'Sofia Delgado',
    kind: 'evaluation',
    owner: 'mine',
    label: 'Evaluation',
    details: '08/28/2026 · 2:00 PM · PT · saved, not submitted',
    status: 'draft',
    draft: {
      discipline: 'PT',
      visitAt: new Date(2026, 7, 28, 14, 0).toISOString(),
      dateOfBirth: '06/30/1994',
      savedAt: new Date(2026, 7, 28, 15, 10).toISOString(),
      prefill: {
        'eval.primaryDiagnosis': 'M54.50 · Low back pain, unspecified',
        'eval.secondaryDiagnosis': 'R26.89 · Other abnormalities of gait and mobility',
        'eval.startOfCare': '08/28/2026',
        'eval.discipline': 'Physical therapy',
        'eval.patientId': '017',
        'eval.rec.timesFrom': '2',
        'eval.rec.per': 'week',
        'eval.rec.minutesFrom': '60',
        'eval.dateOfBirth': '06/30/1994',
        'eval.pain': '0',
      },
    },
  },
  {
    id: 'pn5',
    patientId: 'p-noah-brennan',
    patientName: 'Noah Brennan',
    kind: 'dailyNote',
    owner: 'mine',
    label: 'Daily note',
    details: '08/28/2026 · 10:00 AM · PT',
    status: 'draft',
  },
  {
    id: 'pn6',
    patientId: 'p-hannah-kowalski',
    patientName: 'Hannah Kowalski',
    kind: 'coSign',
    owner: 'assistant',
    label: '09/03',
    details: 'Jamie Ortiz, PTA · 45 min · S8990 · co-sign within 7 days',
    status: 'review',
    review: {
      noteType: 'Daily note',
      discipline: 'Physical therapy',
      author: 'Jamie Ortiz, PTA',
      signedAt: new Date(2026, 8, 3, 10, 5).toISOString(),
      visitStart: new Date(2026, 8, 3, 9, 0).toISOString(),
      durationMinutes: 45,
      billing: { code: 'S8990 HI', units: 3, authorization: 'PA 26050093' },
      location: 'Private home · 12',
      sections: [
        { title: 'Subjective', text: 'Reports less knee pain on the stairs this week.' },
        {
          title: 'Objective',
          text: 'Step-ups 3 × 10 each leg, one handrail. Sit-to-stand 2 × 8 without arms.',
        },
        { title: 'Assessment', text: 'Quad strength improving; still guarding on the left.' },
        { title: 'Plan', text: 'Next visit: add a lateral step-up and review the home program.' },
      ],
    },
  },
  {
    id: 'pn7',
    patientId: 'p-daniel-osei',
    patientName: 'Daniel Osei',
    kind: 'coSign',
    owner: 'assistant',
    label: '09/01',
    details: 'Jamie Ortiz, PTA · 60 min · S8990 · co-sign within 7 days',
    status: 'review',
    review: {
      noteType: 'Daily note',
      discipline: 'Physical therapy',
      author: 'Jamie Ortiz, PTA',
      signedAt: new Date(2026, 8, 1, 11, 20).toISOString(),
      visitStart: new Date(2026, 8, 1, 10, 0).toISOString(),
      durationMinutes: 60,
      billing: { code: 'S8990 HI', units: 4, authorization: 'PA 26063318' },
      location: 'Private home · 12',
      sections: [
        { title: 'Subjective', text: 'Mother reports the new rollator arrived; Daniel likes it.' },
        {
          title: 'Objective',
          text: 'Gait with the rollator 2 × 150 ft, standby assist. Rollator height adjusted. Rest breaks needed every 5 minutes.',
        },
        {
          title: 'Assessment',
          text: 'Tolerated the session well. Endurance is the limit, not balance.',
        },
        { title: 'Plan', text: 'Next visit: outdoor walk to the corner.' },
      ],
    },
  },
];

export const MOCK_PROGRESS_NOTES_DUE: ProgressNoteDue[] = [
  {
    id: 'pg1',
    patientId: 'p-eli-nakamura',
    patientName: 'Eli Nakamura',
    discipline: 'PT',
    visitsCompleted: 10,
    visitsPerNote: VISITS_PER_PROGRESS_NOTE,
    details: 'Created at visit 10 · write it now',
    visitAt: at(13, 30),
    dateOfBirth: '11/05/1979',
    patientCode: '398812',
    prefill: {
      'goals.targetTrials': '5',
      'goals.areaOfConcern': 'Gross motor / Mobility',
      'goals.goal': 'Climb 12 stairs with one handrail, step over step',
      'goals.term': 'Number of weeks',
      'goals.weeks': '12',
      'goals.trackedAs': 'Percentage',
      'treatment.evaluationDate': '02/01/2026',
      'treatment.timesFrom': '2',
      'treatment.per': 'week',
      'treatment.minutesFrom': '60',
      'treatment.units97535': '32',
      'treatment.description97535': 'Physical Therapy',
      'treatment.unitsTotal': '32',
      'treatment.attended': '8',
      'treatment.cancelled': '1',
    },
    servicePeriod: { start: '02/01/2026', end: '09/03/2026' },
    diagnosis: 'F84.0 · Autistic disorder',
    therapist: MOCK_USER.name,
  },
  {
    id: 'pg2',
    patientId: 'p-maya-okafor',
    patientName: 'Maya Okafor',
    discipline: 'PT',
    visitsCompleted: 9,
    visitsPerNote: VISITS_PER_PROGRESS_NOTE,
    details: 'Visit 9 of 10 · due at the next visit · Monday, September 7',
    visitAt: at(15, 0, 4),
    dateOfBirth: '02/14/2016',
    patientCode: '401257',
    prefill: {
      'goals.targetTrials': '5',
      'goals.areaOfConcern': 'Fine motor / Coordination',
      'goals.goal': 'Catch a playground ball from 6 ft in 4 of 5 trials',
      'goals.term': 'Number of weeks',
      'goals.weeks': '10',
      'goals.trackedAs': 'Percentage',
      'treatment.evaluationDate': '03/09/2026',
      'treatment.timesFrom': '2',
      'treatment.per': 'week',
      'treatment.minutesFrom': '45',
      'treatment.units97535': '24',
      'treatment.description97535': 'Physical Therapy',
      'treatment.unitsTotal': '24',
      'treatment.attended': '9',
      'treatment.cancelled': '0',
    },
    servicePeriod: { start: '03/09/2026', end: '09/03/2026' },
    diagnosis: 'F82 · Developmental coordination disorder',
    therapist: MOCK_USER.name,
  },
  {
    id: 'pg3',
    patientId: 'p-daniel-osei',
    patientName: 'Daniel Osei',
    discipline: 'PT',
    visitsCompleted: 9,
    visitsPerNote: VISITS_PER_PROGRESS_NOTE,
    details: 'Visit 9 of 10 · due at the next visit · Tuesday, September 8',
    treatedBy: 'Jamie Ortiz, PTA',
    visitAt: at(10, 0, 5),
    dateOfBirth: '07/22/1958',
    patientCode: '377904',
    prefill: {
      'goals.targetTrials': '4',
      'goals.areaOfConcern': 'Strength / Endurance',
      'goals.goal': 'Walk 150 ft with a rolling walker without a rest break',
      'goals.term': 'Number of weeks',
      'goals.weeks': '8',
      'goals.trackedAs': 'Percentage',
      'treatment.evaluationDate': '01/12/2026',
      'treatment.timesFrom': '3',
      'treatment.per': 'week',
      'treatment.minutesFrom': '60',
      'treatment.units97535': '36',
      'treatment.description97535': 'Physical Therapy',
      'treatment.unitsTotal': '36',
      'treatment.attended': '9',
      'treatment.cancelled': '2',
    },
    servicePeriod: { start: '01/12/2026', end: '09/03/2026' },
    diagnosis: 'M62.81 · Muscle weakness (generalized)',
    therapist: MOCK_USER.name,
  },
];

export const MOCK_EVALUATION_TEMPLATES: NoteTemplate[] = [
  { id: 'eval-pt', name: 'Physical Therapy Evaluation', isDefault: true },
  { id: 'eval-ot', name: 'Occupational Therapy Evaluation' },
  { id: 'eval-st', name: 'Speech Therapy Evaluation' },
];

export const MOCK_PROGRESS_NOTE_TEMPLATES: NoteTemplate[] = [
  { id: 'pd-ot', name: 'Progress / Discharge Note: Occupational Therapy' },
  { id: 'pd-pt', name: 'Progress / Discharge Note: Physical Therapy', isDefault: true },
  { id: 'pd-st', name: 'Progress / Discharge Note: Speech Therapy' },
];

const TIMES = ['1', '2', '3', '4', '5', '6', '7'];
const MINUTES = ['15', '30', '45', '60', '75', '90', '120'];

const comments = (sectionId: string): NoteField => ({
  type: 'longText',
  id: `${sectionId}.comments`,
  label: 'Comments',
});

export const MOCK_PROGRESS_NOTE_SECTIONS: NoteSection[] = [
  {
    id: 'patient',
    title: 'Patient details',
    accent: 'primary',
    fields: [{ type: 'patientDetails' }],
  },
  {
    id: 'outcome',
    title: 'Outcome (from profile)',
    source: 'From the profile',
    accent: 'accent',
    fields: [
      { type: 'readOnly', id: 'outcome.value', label: 'Outcome', value: 'Hidden for your role' },
    ],
  },
  {
    id: 'assessment',
    title: 'Assessment summary',
    accent: 'toneAmberFg',
    fields: [
      {
        type: 'longText',
        id: 'assessment.currentLevel',
        label: 'Current Level of Function',
        required: true,
      },
      { type: 'longText', id: 'assessment.progress', label: 'Progress to Date', required: true },
      comments('assessment'),
    ],
  },
  {
    id: 'treatment',
    title: 'Treatment Summary',
    accent: 'tonePurpleFg',
    fields: [
      { type: 'readOnly', id: 'treatment.evaluationDate', label: 'Evaluation Date' },
      { type: 'select', id: 'treatment.timesFrom', label: 'Times, from', options: TIMES },
      { type: 'select', id: 'treatment.timesTo', label: 'Times, to', options: TIMES },
      { type: 'select', id: 'treatment.per', label: 'Per', options: ['day', 'week', 'month'] },
      { type: 'select', id: 'treatment.minutesFrom', label: 'Minutes, from', options: MINUTES },
      { type: 'select', id: 'treatment.minutesTo', label: 'Minutes, to', options: MINUTES },
      {
        type: 'shortText',
        id: 'treatment.frequencyDetails',
        label: 'Frequency — details',
        placeholder: 'Details',
      },
      {
        type: 'group',
        caption: 'Service summary',
        fields: [
          {
            type: 'group',
            title: '97535',
            fields: [
              { type: 'shortText', id: 'treatment.units97535', label: '#Units', locked: true },
              {
                type: 'shortText',
                id: 'treatment.description97535',
                label: 'Description',
                locked: true,
              },
            ],
          },
          { type: 'divider' },
          {
            type: 'group',
            title: 'Total',
            fields: [
              { type: 'shortText', id: 'treatment.unitsTotal', label: '#Units', locked: true },
            ],
          },
        ],
      },
      {
        type: 'group',
        caption: 'Service period attendance',
        columns: 2,
        fields: [
          {
            type: 'shortText',
            id: 'treatment.attended',
            label: 'Appointments Attended',
            numeric: true,
          },
          {
            type: 'shortText',
            id: 'treatment.cancelled',
            label: 'Appointments Cancelled',
            numeric: true,
          },
        ],
      },
      {
        type: 'shortText',
        id: 'treatment.attendanceDescription',
        label: 'Description',
        narrow: true,
      },
      { type: 'shortText', id: 'treatment.otherServices', label: 'Other Services' },
      { type: 'longText', id: 'treatment.strengths', label: 'Strengths', required: true },
      { type: 'longText', id: 'treatment.weaknesses', label: 'Weaknesses', required: true },
      comments('treatment'),
    ],
  },
  {
    id: 'plan',
    title: 'Plan',
    accent: 'toneRedFg',
    fields: [
      { type: 'longText', id: 'plan.recommendations', label: 'Recommendations', required: true },
      {
        type: 'multiSelect',
        id: 'plan.options',
        label: 'Plan',
        options: [
          'Continue services',
          'DC services',
          'Modification of goals',
          'Reassess',
          'Home Exercise Program (HEP)',
          'Referral to:',
          'Other',
        ],
      },
      { type: 'shortText', id: 'plan.other', label: 'Plan · Other' },
      comments('plan'),
    ],
  },
  {
    id: 'hep',
    title: 'Home Exercise Program',
    accent: 'primary',
    fields: [
      { type: 'longText', id: 'hep.description', label: 'Description' },
      {
        type: 'shortText',
        id: 'hep.compliance',
        label: '% of Caregiver Compliance (%)',
        numeric: true,
        narrow: true,
      },
    ],
  },
  {
    id: 'goals',
    title: 'Goals',
    source: 'From the goal library',
    accent: 'accent',
    fields: [
      // TODO: add the fields above "Target trials" once that part of the design is shared.
      { type: 'shortText', id: 'goals.targetTrials', label: 'Target trials', numeric: true },
      { type: 'shortText', id: 'goals.areaOfConcern', label: 'Area of concern' },
      { type: 'longText', id: 'goals.goal', label: 'Goal' },
      {
        type: 'select',
        id: 'goals.term',
        label: 'Term',
        options: ['Number of weeks', 'Number of visits', 'Until discharge'],
      },
      { type: 'shortText', id: 'goals.weeks', label: 'Weeks', numeric: true },
      {
        type: 'select',
        id: 'goals.trackedAs',
        label: 'Tracked as',
        options: ['Percentage', 'Trials', 'Duration'],
      },
    ],
  },
];

const ICD10_PLACEHOLDER = 'ICD-10 code and description, e.g. R26.89 · Other abnormalities of gait';

const SAFETY_LEVELS = ['Good', 'Fair', 'Poor', 'Impaired'];

const BALANCE_LEVELS = ['Normal', 'Good', 'Fair', 'Poor', 'Unable'];

const ASSISTANCE_LEVELS = [
  'Independent',
  'Supervision',
  'Contact guard',
  'Minimal assist',
  'Moderate assist',
  'Maximal assist',
  'Dependent',
];
const RAILS = ['None', 'One rail', 'Two rails'];
const DEVICES = ['None', 'Cane', 'Walker', 'Rollator', 'Crutches'];

const selectField = (id: string, label: string, options: string[]): NoteField => ({
  type: 'select',
  id,
  label,
  options,
  placeholder: 'Select',
  required: true,
});

const comment = (id: string): NoteField => ({ type: 'shortText', id, label: 'Comments' });

/** Puts a divider between consecutive blocks. */
const withDividers = (fields: NoteField[]): NoteField[] =>
  fields.flatMap((field, index) => (index === 0 ? [field] : [{ type: 'divider' }, field]));

/** A task scored by how much help the patient needed, e.g. a transfer. */
const assistanceTask = (id: string, title: string): NoteField => ({
  type: 'group',
  title,
  columns: 2,
  fields: [
    selectField(`eval.functional.${id}.assistance`, 'Assistance', ASSISTANCE_LEVELS),
    comment(`eval.functional.${id}.comments`),
  ],
});

const walkTask = (id: string, title: string): NoteField => ({
  type: 'group',
  title,
  columns: 2,
  fields: [
    {
      type: 'shortText',
      id: `eval.functional.${id}.distance`,
      label: 'Distance (ft.)',
      numeric: true,
    },
    selectField(`eval.functional.${id}.assistance`, 'Assistance', ASSISTANCE_LEVELS),
    comment(`eval.functional.${id}.comments`),
  ],
});

const stairsTask = (id: string, title: string): NoteField => ({
  type: 'group',
  title,
  columns: 2,
  fields: [
    { type: 'shortText', id: `eval.stairs.${id}.steps`, label: '# of Steps', numeric: true },
    selectField(`eval.stairs.${id}.rails`, 'Rails', RAILS),
    selectField(`eval.stairs.${id}.assistance`, 'Assistance', ASSISTANCE_LEVELS),
    selectField(`eval.stairs.${id}.device`, 'Device', DEVICES),
    comment(`eval.stairs.${id}.comments`),
  ],
});

const sensoryStatus = (aid: string) => ['Within normal limits', 'Impaired', aid];

/** A status (a dropdown when `options` is given, else free text) with comments beside it. */
const statusTask = (id: string, title: string, options?: string[]): NoteField => ({
  type: 'group',
  title,
  columns: 2,
  fields: [
    options
      ? selectField(`eval.priorLevel.${id}.status`, 'Status', options)
      : { type: 'shortText', id: `eval.priorLevel.${id}.status`, label: 'Status' },
    comment(`eval.priorLevel.${id}.comments`),
  ],
});

/** Static and dynamic balance side by side for one position, e.g. sitting. */
const balancePosition = (id: string, title: string, required: boolean): NoteField => ({
  type: 'group',
  title: title || undefined,
  columns: 2,
  fields: (['static', 'dynamic'] as const).map((kind) => ({
    type: 'select',
    id: `eval.balance.${id}.${kind}`,
    label: kind === 'static' ? 'Static' : 'Dynamic',
    options: BALANCE_LEVELS,
    placeholder: 'Select',
    required,
  })),
});

export const MOCK_EVALUATION_SECTIONS: NoteSection[] = [
  {
    id: 'treatmentDiagnosis',
    title: 'Treatment diagnosis',
    accent: 'primary',
    fields: [
      {
        type: 'readOnly',
        id: 'eval.primaryDiagnosis',
        label: 'Primary diagnosis · from the ISP',
        layout: 'stacked',
      },
      {
        type: 'readOnly',
        id: 'eval.secondaryDiagnosis',
        label: 'Secondary diagnosis · from the ISP',
        layout: 'stacked',
      },
      {
        type: 'group',
        columns: 2,
        fields: [
          { type: 'readOnly', id: 'eval.startOfCare', label: 'Start of care', layout: 'stacked' },
          { type: 'readOnly', id: 'eval.discipline', label: 'Discipline', layout: 'stacked' },
        ],
      },
      {
        type: 'longText',
        id: 'eval.treatmentDiagnosis',
        label: 'Treatment diagnosis (ICD-10)',
        placeholder: ICD10_PLACEHOLDER,
        required: true,
      },
    ],
  },
  {
    id: 'patientDiagnosis',
    title: 'Patient & diagnosis',
    accent: 'accent',
    fields: [
      {
        type: 'subsection',
        title: 'Patient details',
        fields: [
          { type: 'readOnly', id: 'eval.patientId', label: 'Patient ID' },
          { type: 'divider' },
          { type: 'readOnly', id: 'eval.dateOfBirth', label: 'DOB' },
        ],
      },
      {
        type: 'subsection',
        title: 'Outcome',
        fields: [
          { type: 'readOnly', id: 'eval.outcome', label: 'Outcome', value: 'Hidden for your role' },
        ],
      },
    ],
  },
  // TODO: confirm with design; this repeats the first section in a different layout.
  {
    id: 'treatmentDiagnosisSummary',
    title: 'Treatment diagnosis',
    accent: 'toneAmberFg',
    fields: [
      { type: 'readOnly', id: 'eval.primaryDiagnosis', label: 'Primary diagnosis' },
      { type: 'divider' },
      { type: 'readOnly', id: 'eval.secondaryDiagnosis', label: 'Secondary diagnosis' },
      { type: 'divider' },
      { type: 'readOnly', id: 'eval.startOfCare', label: 'Start of care' },
      {
        type: 'shortText',
        id: 'eval.treatmentDiagnosis',
        label: 'Treatment diagnosis (ICD-10)',
        placeholder: ICD10_PLACEHOLDER,
        required: true,
      },
    ],
  },
  {
    id: 'history',
    title: 'History',
    accent: 'tonePurpleFg',
    fields: [
      {
        type: 'subsection',
        title: 'History of Present Illness',
        required: true,
        fields: [
          {
            type: 'longText',
            id: 'eval.presentIllness',
            label: 'History of Present Illness (Reason for referral)',
            required: true,
            showRequiredMark: false,
          },
        ],
      },
      {
        type: 'subsection',
        title: 'Medical History',
        fields: [
          {
            type: 'repeat',
            id: 'eval.medicalHistory',
            fields: [{ type: 'shortText', id: 'condition', label: 'Condition' }],
            addLabel: 'Add row',
            removeLabel: 'Remove condition',
          },
        ],
      },
      {
        type: 'subsection',
        title: 'Precautions/Contraindication',
        required: true,
        fields: [
          {
            type: 'longText',
            id: 'eval.precautions',
            label: 'Precautions / contraindications',
            required: true,
            showRequiredMark: false,
          },
        ],
      },
    ],
  },
  {
    id: 'observations',
    title: 'Observations',
    accent: 'toneRedFg',
    fields: [
      {
        type: 'subsection',
        title: 'General observations',
        fields: [
          {
            type: 'select',
            id: 'eval.pain',
            label: 'Pain (0-10 pain scale)',
            options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            required: true,
          },
          {
            type: 'select',
            id: 'eval.environment',
            label: 'Environmental Assessment',
            options: ['Safe', 'Needs modification', 'Unsafe'],
            placeholder: 'Select',
            required: true,
          },
          {
            type: 'select',
            id: 'eval.safetyAwareness',
            label: 'Safety Awareness',
            options: SAFETY_LEVELS,
            placeholder: 'Select',
            required: true,
          },
          { type: 'longText', id: 'eval.observations', label: 'Observations' },
        ],
      },
    ],
  },
  {
    id: 'romStrengthBalance',
    title: 'Range of motion, strength & balance',
    accent: 'primary',
    fields: [
      {
        type: 'subsection',
        title: 'Strength',
        required: true,
        fields: [
          {
            type: 'longText',
            id: 'eval.strength',
            label: 'Strength',
            required: true,
            showRequiredMark: false,
          },
        ],
      },
      {
        type: 'subsection',
        title: 'ROM',
        required: true,
        fields: [
          {
            type: 'longText',
            id: 'eval.rom',
            label: 'Range of motion',
            required: true,
            showRequiredMark: false,
          },
        ],
      },
      {
        type: 'subsection',
        title: 'Balance',
        fields: [
          balancePosition('sitting', 'Sitting', true),
          { type: 'divider' },
          balancePosition('standing', 'Standing', true),
          {
            type: 'repeat',
            id: 'eval.balance.extra',
            fields: [
              { type: 'shortText', id: 'position', label: 'Position' },
              balancePosition('scores', '', false),
            ],
            addLabel: 'Add row',
            removeLabel: 'Remove row',
          },
          {
            type: 'repeat',
            id: 'eval.activityTolerance',
            fields: [
              {
                type: 'group',
                caption: 'Activity Tolerance',
                title: 'Activity Tolerance',
                columns: 2,
                fields: [
                  { type: 'shortText', id: 'static', label: 'Static (min.)', numeric: true },
                  { type: 'shortText', id: 'dynamic', label: 'Dynamic (min.)', numeric: true },
                ],
              },
            ],
            addLabel: 'Add activity tolerance',
            removeLabel: 'Remove activity tolerance',
            addStyle: 'dashed',
            max: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'functional',
    title: 'Functional assessments',
    accent: 'accent',
    fields: [
      {
        type: 'subsection',
        title: 'Chair Transfers',
        fields: withDividers([
          assistanceTask('sittingOnChair', 'Sitting on chair'),
          assistanceTask('chairTransfer', 'Chair transfer'),
          assistanceTask('chairToStand', 'Chair to stand'),
          assistanceTask('standToChair', 'Stand to chair'),
        ]),
      },
      {
        type: 'subsection',
        title: 'Transfers',
        fields: withDividers([
          assistanceTask('toiletTransfer', 'Toilet Transfer'),
          assistanceTask('tubTransfer', 'Tub Transfer'),
          assistanceTask('carTransfer', 'Car Transfer'),
        ]),
      },
      {
        type: 'subsection',
        title: 'Ambulation',
        fields: withDividers([
          walkTask('levelSurfaces', 'Walk over level surfaces'),
          walkTask('ramps', 'Walk up and down ramps'),
          walkTask('curbs', 'Walk up and down curbs'),
        ]),
      },
      {
        type: 'subsection',
        title: 'Gait Analysis',
        required: true,
        fields: [
          {
            type: 'longText',
            id: 'eval.gaitAnalysis',
            label: 'Gait analysis',
            required: true,
            showRequiredMark: false,
          },
        ],
      },
      {
        type: 'subsection',
        title: 'Stairs',
        fields: withDividers([stairsTask('ascend', 'Ascend'), stairsTask('descend', 'Descend')]),
      },
    ],
  },
  {
    id: 'levelOfFunctioning',
    title: 'Level of functioning',
    accent: 'toneAmberFg',
    fields: [
      {
        type: 'subsection',
        title: 'Prior Level of Function',
        fields: withDividers([
          statusTask('decline', 'Decline in functional status', ['Yes', 'No']),
          statusTask('previous', 'Previous Functional Status'),
          statusTask('auditory', 'Auditory', sensoryStatus('Hearing aids')),
          statusTask('vision', 'Vision', sensoryStatus('Glasses')),
          statusTask('equipment', 'Equipment Used', DEVICES),
        ]),
      },
      {
        type: 'subsection',
        title: 'Levels of Assistance',
        fields: [
          {
            type: 'repeat',
            id: 'eval.levelsOfAssistance',
            blockTitle: 'Levels of Assistance',
            fields: [
              {
                type: 'group',
                columns: 2,
                fields: [
                  { type: 'shortText', id: 'impairedAreas', label: 'Impaired Functional Areas' },
                  { type: 'shortText', id: 'plof', label: 'PLOF' },
                  { type: 'shortText', id: 'current', label: 'Current' },
                ],
              },
            ],
            addLabel: 'Add row',
            removeLabel: 'Remove levels of assistance',
          },
        ],
      },
    ],
  },
  {
    id: 'adaptiveEquipment',
    title: 'Adaptive equipment',
    accent: 'tonePurpleFg',
    fields: [
      {
        type: 'subsection',
        title: 'Current Adaptive Equipment and Orthotics Used',
        required: true,
        fields: [
          {
            type: 'shortText',
            id: 'eval.adaptiveEquipment',
            label: 'Adaptive Equipment and Orthotics used',
            required: true,
            showRequiredMark: false,
          },
        ],
      },
    ],
  },
  {
    id: 'impressions',
    title: 'Impressions & recommendations',
    accent: 'toneRedFg',
    fields: [
      {
        type: 'subsection',
        title: 'Clinical impressions & recommendations',
        required: true,
        fields: [
          {
            type: 'longText',
            id: 'eval.impressions',
            label: 'Clinical impressions & recommendations',
            required: true,
            showRequiredMark: false,
          },
        ],
      },
      {
        type: 'subsection',
        title: 'Recommendations',
        fields: [
          { type: 'select', id: 'eval.rec.timesFrom', label: 'Times, from', options: TIMES },
          { type: 'select', id: 'eval.rec.timesTo', label: 'Times, to', options: TIMES },
          { type: 'select', id: 'eval.rec.per', label: 'Per', options: ['day', 'week', 'month'] },
          { type: 'select', id: 'eval.rec.minutesFrom', label: 'Minutes, from', options: MINUTES },
          { type: 'longText', id: 'eval.rec.other', label: 'Other recommendation' },
        ],
      },
    ],
  },
];

export const MOCK_PREVIOUS_EVALUATIONS: PreviousNote[] = [
  {
    id: 'pe1',
    patientId: 'p-theo-lindgren',
    title: 'Initial evaluation',
    date: '08/06/2026',
    status: 'Signed',
    answers: {
      'eval.presentIllness': 'Referred by the support coordinator for mobility and fall risk.',
      'eval.precautions': 'Fall risk on stairs. Atlantoaxial instability screening on file.',
      'eval.environment': 'Needs modification',
      'eval.safetyAwareness': 'Fair',
      'eval.strength': 'Hip and knee extensors 4-/5 bilaterally. Core 3+/5.',
      'eval.rom': 'Within functional limits throughout; mild hamstring tightness.',
      'eval.balance.sitting.static': 'Good',
      'eval.balance.sitting.dynamic': 'Fair',
      'eval.balance.standing.static': 'Fair',
      'eval.balance.standing.dynamic': 'Poor',
      'eval.gaitAnalysis': 'Wide base of support, decreased step length, no device.',
      'eval.adaptiveEquipment': 'Bilateral supramalleolar orthoses',
    },
  },
  {
    id: 'pe2',
    patientId: 'p-theo-lindgren',
    title: 'Re-evaluation',
    date: '08/05/2025',
    status: 'Closed',
    answers: {
      'eval.presentIllness': 'Annual re-evaluation for the ISP renewal.',
      'eval.precautions': 'Fall risk on stairs.',
      'eval.environment': 'Safe',
      'eval.safetyAwareness': 'Fair',
      'eval.strength': 'Hip and knee extensors 3+/5 bilaterally.',
      'eval.rom': 'Within functional limits throughout.',
      'eval.gaitAnalysis': 'Wide base of support, decreased step length.',
    },
  },
  {
    id: 'pe3',
    patientId: 'p-sofia-delgado',
    title: 'Initial evaluation',
    date: '02/14/2026',
    status: 'Signed',
    answers: {
      'eval.presentIllness': 'Low back pain after a fall at work in January.',
      'eval.precautions': 'No lifting over 10 lb.',
      'eval.strength': 'Trunk extensors 3+/5. Hips 4/5.',
      'eval.rom': 'Lumbar flexion limited by 50% with pain at end range.',
    },
  },
];

export const MOCK_CARE_PLAN_TEMPLATES: NoteTemplate[] = [
  { id: 'cp-pt', name: 'Care Plan: Physical Therapy', isDefault: true },
  { id: 'cp-ot', name: 'Care Plan: Occupational Therapy' },
  { id: 'cp-st', name: 'Care Plan: Speech Therapy' },
];

const YES_NO = ['Yes', 'No'];

const DURATIONS = Array.from({ length: 12 }, (_, index) => String(index + 1));

export const MOCK_CARE_PLAN_SECTIONS: NoteSection[] = [
  {
    id: 'patientDiagnosis',
    title: 'Patient & diagnosis',
    accent: 'primary',
    fields: [
      {
        type: 'subsection',
        title: 'Patient details',
        fields: withDividers([
          { type: 'readOnly', id: 'carePlan.patientNumber', label: 'Patient Number' },
          { type: 'readOnly', id: 'carePlan.dateOfBirth', label: 'D.O.B. / Age' },
          { type: 'readOnly', id: 'carePlan.evaluationDate', label: 'Eval. Date' },
          { type: 'readOnly', id: 'carePlan.primaryDiagnosis', label: 'Primary Diagnosis' },
          { type: 'readOnly', id: 'carePlan.secondaryDiagnosis', label: 'Secondary Diagnosis' },
        ]),
      },
      {
        type: 'subsection',
        title: 'Outcome',
        fields: [
          {
            type: 'readOnly',
            id: 'carePlan.outcome',
            label: 'Outcome',
            value: 'Hidden for your role',
          },
        ],
      },
    ],
  },
  {
    id: 'history',
    title: 'History',
    accent: 'accent',
    fields: [
      { type: 'shortText', id: 'carePlan.medications', label: 'Medications' },
      { type: 'shortText', id: 'carePlan.otherTherapies', label: 'Other Therapies' },
      { type: 'choice', id: 'carePlan.diet', label: 'Specialized Diet', options: YES_NO },
      { type: 'shortText', id: 'carePlan.dietDetails', label: 'Specialized Diet — details' },
    ],
  },
  {
    id: 'assessment',
    title: 'Assessment Summary',
    accent: 'toneAmberFg',
    fields: [
      {
        type: 'longText',
        id: 'carePlan.currentLevel',
        label: 'Current Level of Function',
        required: true,
      },
      { type: 'longText', id: 'carePlan.progress', label: 'Progress to Date', required: true },
      {
        type: 'choice',
        id: 'carePlan.rehabPotential',
        label: 'Rehabilitation Potential',
        options: ['Good', 'Fair', 'Guarded'],
      },
    ],
  },
  {
    id: 'plan',
    title: 'Plan of treatment',
    accent: 'tonePurpleFg',
    fields: [
      {
        type: 'subsection',
        title: 'Frequency / Duration',
        fields: [
          { type: 'select', id: 'carePlan.timesFrom', label: 'Times, from', options: TIMES },
          { type: 'select', id: 'carePlan.timesTo', label: 'Times, to', options: TIMES },
          { type: 'select', id: 'carePlan.per', label: 'Per', options: ['day', 'week', 'month'] },
          {
            type: 'select',
            id: 'carePlan.minutesFrom',
            label: 'Minutes, from',
            options: MINUTES,
          },
          { type: 'select', id: 'carePlan.minutesTo', label: 'Minutes, to', options: MINUTES },
          {
            type: 'select',
            id: 'carePlan.estimatedDuration',
            label: 'Estimated duration',
            options: DURATIONS,
          },
          {
            type: 'select',
            id: 'carePlan.durationUnit',
            label: 'Duration unit',
            options: ['week(s)', 'month(s)'],
          },
          {
            type: 'shortText',
            id: 'carePlan.dischargeDate',
            label: 'Estimated Date of Discharge',
            placeholder: 'MM/DD/YYYY',
            required: true,
          },
        ],
      },
      {
        type: 'subsection',
        title: 'Plan of Treatment/Modalities',
        fields: [
          {
            type: 'multiSelect',
            id: 'carePlan.modalities',
            options: ['Individual', 'Group therapy utilizing'],
          },
        ],
      },
    ],
  },
  {
    id: 'other',
    title: 'Other',
    accent: 'toneRoseFg',
    fields: [
      { type: 'choice', id: 'carePlan.equipment', label: 'Equipment Required', options: YES_NO },
      {
        type: 'shortText',
        id: 'carePlan.equipmentDetails',
        label: 'Equipment Required — details',
      },
      {
        type: 'longText',
        id: 'carePlan.education',
        label: 'Patient/ Caregiver Education',
        required: true,
      },
      {
        type: 'longText',
        id: 'carePlan.coordination',
        label: 'Coordination of Treatment with Other Services',
        required: true,
      },
    ],
  },
  {
    id: 'goals',
    title: 'Goals',
    accent: 'primary',
    fields: [
      {
        type: 'repeat',
        id: 'carePlan.goals',
        fixed: true,
        addLabel: 'Add goal',
        removeLabel: 'Remove goal',
        fields: [
          { type: 'shortText', id: 'areaOfConcern', label: 'Area of concern' },
          { type: 'longText', id: 'goal', label: 'Goal' },
          {
            type: 'select',
            id: 'term',
            label: 'Term',
            options: ['Short-term', 'Long-term', 'Number of weeks', 'Number of visits'],
          },
          {
            type: 'shortText',
            id: 'weeks',
            label: 'Weeks',
            numeric: true,
            showWhen: { id: 'term', value: 'Number of weeks' },
          },
          {
            type: 'select',
            id: 'trackedAs',
            label: 'Tracked as',
            options: ['Percentage', 'Trials', 'Duration'],
          },
          {
            type: 'shortText',
            id: 'targetTrials',
            label: 'Target trials',
            numeric: true,
            showWhen: { id: 'trackedAs', value: 'Trials' },
          },
        ],
      },
    ],
  },
];

export const MOCK_CARE_PLAN_COMPONENTS: NoteComponent[] = [
  {
    id: 'treatmentNarrative',
    title: 'Treatment Plan Narrative',
    sectionId: 'plan',
    fields: [
      {
        type: 'longText',
        id: 'carePlan.treatmentNarrative',
        label: 'Treatment Plan Narrative',
      },
    ],
  },
];

export const MOCK_PREVIOUS_CARE_PLANS: PreviousNote[] = [
  {
    id: 'pc1',
    patientId: 'p-luca-bertrand',
    title: 'Care plan',
    date: '06/02/2026',
    status: 'Closed',
    answers: {
      'carePlan.medications': 'Sertraline 50 mg daily',
      'carePlan.otherTherapies': 'Speech therapy, weekly',
      'carePlan.diet': 'No',
      'carePlan.rehabPotential': 'Good',
      'carePlan.equipment': 'Yes',
      'carePlan.equipmentDetails': 'Rollator with seat',
      'carePlan.education': 'Group home staff trained on safe transfers and rollator use.',
      'carePlan.coordination': 'Monthly update to the support coordinator and the house manager.',
    },
  },
];

export const MOCK_DAILY_NOTE_TEMPLATES: NoteTemplate[] = [
  { id: 'dn-default', name: 'Daily Note', isDefault: true },
  { id: 'dn-pt', name: 'Daily Note: Physical Therapy' },
];

export const MOCK_DAILY_NOTE_DEFAULTS: DailyNoteDefaults = {
  provider: MOCK_USER.name,
  durationMinutes: 60,
  serviceLocations: [
    'Private home · 12 · EVV required',
    'Group home · 21 · EVV required',
    'Community · 99',
  ],
  procedureCodes: ['S8990 HI', '97110', '97112', '97116', '97530', '97535'],
  authorization: 'PA 26041988',
  unitsWeekOf: '08/30/2026',
  goals: [
    { id: 'brushTeeth', text: 'Brush teeth with verbal cues only', trackedAs: 'Percentage' },
    { id: 'buttons', text: 'Fasten 5 buttons on a shirt', trackedAs: 'Trials' },
    { id: 'catchBall', text: 'Catch a ball from 5 feet', trackedAs: 'Trials' },
  ],
};

export const MOCK_DAILY_NOTE_SECTIONS: NoteSection[] = [
  { id: 'visit', title: 'Visit', accent: 'accent', fields: [] },
  { id: 'billing', title: 'Billing', accent: 'toneAmberFg', fields: [] },
  { id: 'summary', title: 'Daily Note', accent: 'tonePurpleFg', fields: [] },
  {
    id: 'precautions',
    title: 'Precautions/Contraindication',
    accent: 'toneRoseFg',
    fields: [
      {
        type: 'longText',
        id: 'dailyNote.precautions',
        label: 'Precautions / contraindications',
      },
    ],
  },
  {
    id: 'soap',
    title: 'Session note (SOAP)',
    accent: 'primary',
    fields: [
      { type: 'longText', id: 'dailyNote.subjective', label: 'Subjective' },
      { type: 'longText', id: 'dailyNote.objective', label: 'Objective' },
      { type: 'longText', id: 'dailyNote.assessment', label: 'Assessment' },
      { type: 'longText', id: 'dailyNote.plan', label: 'Plan' },
    ],
  },
];

export const MOCK_DAILY_NOTE_COMPONENTS: NoteComponent[] = [
  {
    id: 'currentDiet',
    title: 'Current diet',
    sectionId: 'summary',
    fields: [{ type: 'shortText', id: 'dailyNote.currentDiet', label: 'Current diet' }],
  },
  {
    id: 'ambulation',
    title: 'Ambulation',
    sectionId: 'summary',
    fields: [{ type: 'longText', id: 'dailyNote.ambulation', label: 'Ambulation' }],
  },
  {
    id: 'transfers',
    title: 'Transfers',
    sectionId: 'summary',
    fields: [{ type: 'longText', id: 'dailyNote.transfers', label: 'Transfers' }],
  },
  {
    id: 'homeProgram',
    title: 'Home program & caregiver training',
    sectionId: 'summary',
    fields: [
      {
        type: 'longText',
        id: 'dailyNote.homeProgram',
        label: 'Home program & caregiver training',
      },
    ],
  },
];

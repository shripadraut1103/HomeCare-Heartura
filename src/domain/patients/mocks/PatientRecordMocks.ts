import type { ChartRecord } from '@/domain/patients/interfaces/PatientInterfaces';

/**
 * TEMPORARY: signed and pending documentation until the notes API exists.
 * Delete this file once the chart loads documentation from the service.
 */

const at = (date: string, time: string) => {
  const [month, day, year] = date.split('/').map(Number);
  const [clock, period] = time.split(' ');
  const [hours, minutes] = clock.split(':').map(Number);
  return new Date(
    year,
    month - 1,
    day,
    (hours % 12) + (period.toLowerCase() === 'pm' ? 12 : 0),
    minutes
  ).toISOString();
};

const MARCUS = 'Marcus Webb, OT';
const PRIYA = 'Priya Chandran, PT';
const DANA = 'Dana Ruiz, COTA';

type DailySeed = [
  date: string,
  time: string,
  discipline: 'OT' | 'PT',
  therapist: string,
  status: ChartRecord['status'],
];

const DAILY: DailySeed[] = [
  ['10/01/2026', '03:00 pm', 'OT', MARCUS, 'signed'],
  ['09/30/2026', '10:00 am', 'PT', PRIYA, 'pending'],
  ['09/29/2026', '10:00 am', 'OT', MARCUS, 'cancelled'],
  ['09/23/2026', '10:00 am', 'PT', PRIYA, 'signed'],
  ['09/22/2026', '10:00 am', 'OT', MARCUS, 'pending'],
  ['09/17/2026', '03:00 pm', 'OT', DANA, 'pending'],
  ['09/16/2026', '10:00 am', 'PT', PRIYA, 'signed'],
  ['09/10/2026', '03:00 pm', 'OT', MARCUS, 'signed'],
  ['09/09/2026', '10:00 am', 'PT', PRIYA, 'signed'],
  ['09/03/2026', '03:00 pm', 'OT', DANA, 'pending'],
  ['09/02/2026', '10:00 am', 'PT', PRIYA, 'signed'],
  ['08/26/2026', '10:00 am', 'PT', PRIYA, 'signed'],
  ['08/25/2026', '03:00 pm', 'OT', MARCUS, 'signed'],
  ['08/19/2026', '10:00 am', 'PT', PRIYA, 'signed'],
  ['08/18/2026', '03:00 pm', 'OT', MARCUS, 'signed'],
  ['08/12/2026', '03:00 pm', 'OT', MARCUS, 'signed'],
];

const dailyNotes: ChartRecord[] = DAILY.map(
  ([date, time, discipline, therapist, status], index) => ({
    id: `ak-dn${index + 1}`,
    kind: 'daily',
    discipline,
    title: 'Daily note',
    date,
    time,
    therapist,
    status,
    visitType: 'Daily visit',
    minutes: status === 'cancelled' ? 0 : 60,
    signedAt: status === 'signed' ? at(date, '05:30 pm') : undefined,
    statusNote:
      status === 'cancelled'
        ? 'At the hospital for a scheduled procedure; the group home called it in.'
        : undefined,
    values:
      status === 'signed'
        ? {
            'dailyNote.subjective': 'Reports a good week; no falls since the last visit.',
            'dailyNote.objective': 'Session completed as planned; see goals.',
            'dailyNote.assessment': 'Steady progress toward the care plan goals.',
            'dailyNote.plan': 'Continue the plan of care at the current frequency.',
          }
        : undefined,
  })
);

const OT_CARE_PLAN_VALUES = {
  'carePlan.patientNumber': '433455',
  'carePlan.dateOfBirth': '09/01/1974 · 52 yrs',
  'carePlan.evaluationDate': '08/06/2026 · Initial',
  'carePlan.primaryDiagnosis': 'F70 · Mild intellectual disabilities',
  'carePlan.secondaryDiagnosis': 'R26.81 · Unsteadiness on feet',
  'carePlan.outcome':
    'Outcome 3 — Aaliyah will increase independence in daily living and mobility through OT and PT habilitation services.',
  'carePlan.medications': 'Levothyroxine 75 mcg daily',
  'carePlan.otherTherapies': 'Physical therapy (Priya Chandran, PT)',
  'carePlan.currentLevel':
    'Moderate assist for upper-body dressing with fasteners and for simple meal prep; independent with feeding.',
  'carePlan.progress': 'Initial plan of care.',
  'carePlan.timesFrom': '2',
  'carePlan.per': 'week',
  'carePlan.minutesFrom': '60',
  'carePlan.estimatedDuration': '12',
  'carePlan.durationUnit': 'month(s)',
  'carePlan.dischargeDate': '08/05/2027',
  'carePlan.equipmentDetails': 'Built-up grip aids; picture sequence cards',
  'carePlan.education':
    'Group home staff shown the dressing sequence and how to prompt by pointing to the next picture.',
  'carePlan.coordination':
    'Coordinated with PT (Priya Chandran) on transfers and stair safety; updates shared with the support coordinator.',
};

export const AALIYAH_RECORDS: ChartRecord[] = [
  ...dailyNotes,
  {
    id: 'ak-ev1',
    kind: 'evaluation',
    discipline: 'OT',
    title: 'Initial evaluation',
    date: '08/06/2026',
    therapist: MARCUS,
    status: 'signed',
    signedAt: at('08/06/2026', '05:10 pm'),
    carePlanId: 'ak-cp1',
    values: {
      'eval.primaryDiagnosis': 'F70 · Mild intellectual disabilities',
      'eval.secondaryDiagnosis': 'R26.81 · Unsteadiness on feet',
      'eval.startOfCare': '08/06/2026',
      'eval.discipline': 'Occupational therapy',
      'eval.patientId': 'HCT-10427',
      'eval.dateOfBirth': '09/01/1974',
    },
  },
  {
    id: 'ak-ev2',
    kind: 'evaluation',
    discipline: 'PT',
    title: 'Initial evaluation',
    date: '08/07/2026',
    therapist: PRIYA,
    status: 'pending',
    values: {
      'eval.primaryDiagnosis': 'F70 · Mild intellectual disabilities',
      'eval.startOfCare': '08/07/2026',
      'eval.discipline': 'Physical therapy',
      'eval.patientId': 'HCT-10427',
      'eval.dateOfBirth': '09/01/1974',
    },
  },
  {
    id: 'ak-ev3',
    kind: 'evaluation',
    discipline: 'OT',
    title: 'Re-evaluation',
    date: '08/05/2025',
    therapist: MARCUS,
    status: 'signed',
    signedAt: at('08/05/2025', '04:40 pm'),
    carePlanId: 'ak-cp0',
  },
  {
    id: 'ak-cp1',
    kind: 'carePlan',
    discipline: 'OT',
    title: 'Care plan',
    date: '08/06/2026',
    therapist: MARCUS,
    assistant: DANA,
    status: 'signed',
    signedAt: at('08/06/2026', '05:10 pm'),
    planStart: '08/06/2026',
    planEnd: '08/05/2027',
    values: OT_CARE_PLAN_VALUES,
  },
  {
    id: 'ak-cp0',
    kind: 'carePlan',
    discipline: 'OT',
    title: 'Care plan',
    date: '08/05/2025',
    therapist: MARCUS,
    status: 'signed',
    signedAt: at('08/05/2025', '04:40 pm'),
    planStart: '08/05/2025',
    planEnd: '08/04/2026',
  },
  {
    id: 'ak-pn1',
    kind: 'progress',
    discipline: 'OT',
    title: 'OT progress note',
    date: '10/01/2026',
    therapist: MARCUS,
    status: 'due',
    periodStart: '08/06/2026',
    periodEnd: '10/01/2026',
    visitNumber: 10,
    visitsPerNote: 10,
    createdOn: '10/01/2026',
  },
  {
    id: 'ak-pn2',
    kind: 'progress',
    discipline: 'PT',
    title: 'PT progress note',
    date: '10/16/2026',
    therapist: PRIYA,
    status: 'upcoming',
    periodStart: '08/07/2026',
    periodEnd: '10/16/2026',
    visitNumber: 9,
    visitsPerNote: 10,
    nextVisit: '10/16/2026',
  },
  {
    id: 'ak-pn3',
    kind: 'progress',
    discipline: 'OT',
    title: 'OT progress note',
    date: '06/10/2026',
    therapist: MARCUS,
    status: 'signed',
    signedAt: at('06/10/2026', '04:15 pm'),
    periodStart: '04/08/2026',
    periodEnd: '06/10/2026',
    visitNumber: 10,
    visitsPerNote: 10,
    createdOn: '06/10/2026',
  },
  {
    id: 'ak-pn4',
    kind: 'progress',
    discipline: 'OT',
    title: 'OT progress note',
    date: '02/11/2026',
    therapist: MARCUS,
    status: 'signed',
    signedAt: at('02/11/2026', '03:50 pm'),
    periodStart: '12/03/2025',
    periodEnd: '02/11/2026',
    visitNumber: 10,
    visitsPerNote: 10,
    createdOn: '02/11/2026',
  },
  {
    id: 'ak-dc1',
    kind: 'discharge',
    discipline: 'Speech',
    title: 'Speech discharge note',
    date: '05/29/2026',
    therapist: 'Sofia Delgado, SLP',
    status: 'signed',
    signedAt: at('05/29/2026', '02:30 pm'),
    reason: 'Goals met',
    restart: false,
  },
  {
    id: 'ak-dc2',
    kind: 'discharge',
    discipline: 'PT',
    title: 'PT discharge note',
    date: '06/30/2025',
    therapist: PRIYA,
    status: 'signed',
    signedAt: at('06/30/2025', '11:20 am'),
    reason: 'Plan year ended',
    restart: true,
  },
];

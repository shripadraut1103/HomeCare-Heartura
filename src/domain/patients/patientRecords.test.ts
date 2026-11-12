import { MOCK_PATIENT_CHARTS } from '@/domain/patients/mocks/PatientChartMocks';
import { MOCK_PATIENTS } from '@/domain/patients/mocks/PatientMocks';
import {
  buildPendingNote,
  buildProgressNoteDue,
  readOnlyTitle,
  recordDetails,
  recordPill,
  recordsForTab,
  recordSubtitle,
} from '@/domain/patients/patientRecords';

const patient = MOCK_PATIENTS.find((item) => item.id === 'p-aaliyah-kaplan')!;
const chart = MOCK_PATIENT_CHARTS[patient.id];
const record = (id: string) => chart.records.find((item) => item.id === id)!;

describe('patientRecords', () => {
  it('splits the chart into the four documentation tabs', () => {
    expect(recordsForTab(chart.records, 'daily')).toHaveLength(16);
    expect(recordsForTab(chart.records, 'evaluation').map((item) => item.id)).toEqual([
      'ak-ev1',
      'ak-ev2',
      'ak-ev3',
    ]);
    expect(recordsForTab(chart.records, 'progress')).toHaveLength(4);
    expect(recordsForTab(chart.records, 'discharge')).toHaveLength(2);
  });

  it('describes a daily note with separated service, units and status', () => {
    const cancelled = record('ak-dn3');
    expect(recordSubtitle(cancelled)).toBe('10:00 am · Marcus Webb, OT');
    expect(recordDetails(cancelled)).toEqual([
      { label: 'Time', value: '10:00 am' },
      { label: 'Service', value: 'Occupational therapy · Daily visit' },
      { label: 'Therapist', value: 'Marcus Webb, OT' },
      { label: 'Units', value: 'No units used' },
      {
        label: 'Status',
        value:
          'Cancelled · no charge — At the hospital for a scheduled procedure; the group home called it in.',
      },
    ]);
    expect(recordPill(record('ak-dn1'))?.label).toBe('Completed & signed');
    expect(recordDetails(record('ak-dn1'))[3].value).toBe('4 units · 60 min');
  });

  it('marks progress notes due now or upcoming', () => {
    expect(recordPill(record('ak-pn1'))?.label).toBe('Due now');
    expect(recordPill(record('ak-pn2'))?.label).toBe('Upcoming');
    expect(recordDetails(record('ak-pn2'))[1].value).toBe('Visit 9 of 10 · next visit 10/16/2026');
  });

  it('lists a discharge reason with whether to restart', () => {
    expect(recordDetails(record('ak-dc1'))[2].value).toBe('Goals met · Restart: No');
    expect(readOnlyTitle(record('ak-cp1'))).toBe('Care plan · Occupational therapy');
  });

  it('starts new drafts filled with the patient’s details', () => {
    const now = new Date(2026, 10, 12, 9, 30);
    const note = buildPendingNote('n1', patient, chart, 'carePlan', 'OT', now);
    expect(note.draft?.discipline).toBe('OT');
    expect(note.draft?.prefill).toMatchObject({
      'carePlan.patientNumber': 'HCT-10427',
      'carePlan.primaryDiagnosis': 'F70 · Mild intellectual disabilities',
    });
    const due = buildProgressNoteDue(
      'p1',
      patient,
      chart,
      'OT',
      'Helena Ruiz, DPT',
      record('ak-pn1'),
      now
    );
    expect(due.servicePeriod).toEqual({ start: '08/06/2026', end: '10/01/2026' });
    expect(due.therapist).toBe('Marcus Webb, OT');
  });
});

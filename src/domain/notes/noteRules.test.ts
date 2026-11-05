import { MOCK_PENDING_NOTES } from '@/domain/notes/mocks/NoteMocks';
import { carePlanPrefill } from '@/domain/notes/noteRules';

describe('carePlanPrefill', () => {
  it('carries the patient and diagnosis over from the evaluation', () => {
    const evaluation = MOCK_PENDING_NOTES.find((note) => note.id === 'pn1')!;
    expect(carePlanPrefill(evaluation)).toEqual({
      'carePlan.patientNumber': '002',
      'carePlan.dateOfBirth': '02/18/2001',
      'carePlan.primaryDiagnosis': 'Q90.9 · Down syndrome, unspecified',
      'carePlan.secondaryDiagnosis': 'R27.8 · Other lack of coordination',
      'carePlan.evaluationDate': '09/03/2026 · Initial',
    });
  });

  it('uses a care plan’s own draft as is', () => {
    const carePlan = MOCK_PENDING_NOTES.find((note) => note.id === 'pn3')!;
    expect(carePlanPrefill(carePlan)).toBe(carePlan.draft?.prefill);
  });
});

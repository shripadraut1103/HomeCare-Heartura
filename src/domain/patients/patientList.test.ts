import { MOCK_PATIENTS } from '@/domain/patients/mocks/PatientMocks';
import {
  ageFrom,
  countByStatus,
  locationLabel,
  matchesQuery,
  patientSummary,
  visiblePatients,
} from '@/domain/patients/patientList';

const aaliyah = MOCK_PATIENTS.find((patient) => patient.id === 'p-aaliyah-kaplan')!;
const now = new Date(2026, 10, 6);

describe('patientList', () => {
  it('works out the age, counting this year’s birthday only once it has passed', () => {
    expect(ageFrom('1974-09-01', now)).toBe(52);
    expect(ageFrom('1974-12-01', now)).toBe(51);
  });

  it('summarizes age, date of birth and disciplines', () => {
    expect(patientSummary(aaliyah, now)).toBe('52 yrs • DOB 09/01/1974 • PT');
  });

  it('labels the service location without the EVV note', () => {
    expect(locationLabel('community')).toBe('Community · 99');
    expect(locationLabel('unknown')).toBe('unknown');
  });

  it('searches by name, ID or Medicaid ID', () => {
    expect(matchesQuery(aaliyah, 'kaplan')).toBe(true);
    expect(matchesQuery(aaliyah, 'hct-10427')).toBe(true);
    expect(matchesQuery(aaliyah, '00128')).toBe(true);
    expect(matchesQuery(aaliyah, 'nguyen')).toBe(false);
  });

  it('counts every status and filters to one', () => {
    const counts = countByStatus(MOCK_PATIENTS);
    expect(counts.all).toBe(MOCK_PATIENTS.length);
    expect(counts.suspended).toBe(2);
    const suspended = visiblePatients(MOCK_PATIENTS, 'suspended', '', 'name');
    expect(suspended.map((patient) => patient.name)).toEqual(['Brian DeLuca', 'Brian Fischer']);
  });
});

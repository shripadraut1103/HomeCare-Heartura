import type { Patient } from '@/domain/patients/interfaces/PatientInterfaces';
import { MOCK_PATIENTS } from '@/domain/patients/mocks/PatientMocks';

// TEMPORARY: reads the mock caseload; switch to the patients slice once it loads from the API.
export function usePatients(): readonly Patient[] {
  return MOCK_PATIENTS;
}

export function usePatient(patientId: string | null | undefined) {
  return MOCK_PATIENTS.find((patient) => patient.id === patientId);
}

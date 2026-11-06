import { useLocalSearchParams } from 'expo-router';

import type { Patient, PatientChart } from '@/domain/patients/interfaces/PatientInterfaces';
import { MOCK_PATIENTS } from '@/domain/patients/mocks/PatientMocks';
import { useAppSelector } from '@/store/hooks';

export function usePatients(): readonly Patient[] {
  return MOCK_PATIENTS;
}

export function usePatient(patientId: string | null | undefined) {
  return MOCK_PATIENTS.find((patient) => patient.id === patientId);
}

export function usePatientChart(patientId: string | null | undefined): PatientChart | undefined {
  return useAppSelector((state) => (patientId ? state.patients.charts[patientId] : undefined));
}

export function useRoutePatient() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return { patient: usePatient(id), chart: usePatientChart(id) };
}

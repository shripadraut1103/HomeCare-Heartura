import type {
  PatientRequest,
  PatientRequestStatus,
} from '@/domain/requests/interfaces/RequestInterfaces';
import { useAppSelector } from '@/store/hooks';

export function usePatientRequests(): PatientRequest[] {
  return useAppSelector((state) => state.requests.requests);
}

export function useRequestCount(status: PatientRequestStatus): number {
  return useAppSelector(
    (state) => state.requests.requests.filter((request) => request.status === status).length
  );
}

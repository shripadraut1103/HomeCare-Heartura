import { createAsyncThunk } from '@reduxjs/toolkit';

import type { ApiPage, ApiPatient } from '@/domain/patients/interfaces/PatientApi';
import PatientService, {
  type PatientListQuery,
} from '@/domain/patients/store/services/PatientServices';
import { PATIENTS_REDUCER } from '@/store/constants/StoreConstants';
import type { RootState } from '@/store/storeConfig';
import type { ServiceResult } from '@/types/ServiceInterfaces';

export const fetchPatientsAction = createAsyncThunk<
  ServiceResult<ApiPage<ApiPatient>>,
  PatientListQuery,
  { state: RootState }
>(PATIENTS_REDUCER + '/fetchPatients', async (query) => PatientService.getPatients(query));

export const fetchPatientAction = createAsyncThunk<
  ServiceResult<ApiPatient>,
  string,
  { state: RootState }
>(PATIENTS_REDUCER + '/fetchPatient', async (id) => PatientService.getPatient(id));

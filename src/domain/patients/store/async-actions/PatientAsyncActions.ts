import { createAsyncThunk } from '@reduxjs/toolkit';

import type {
  ApiAllergy,
  ApiAllergyCreate,
  ApiChartNote,
  ApiCoverage,
  ApiCoverageCreate,
  ApiCoverageOptions,
  ApiDiagnosis,
  ApiDiagnosisCreate,
  ApiDocumentUpload,
  ApiHistoryCreate,
  ApiHistoryEntry,
  ApiIncident,
  ApiIncidentCreate,
  ApiIncidentUpdate,
  ApiNoteCreate,
  ApiPage,
  ApiPatient,
  ApiPatientDocument,
  ApiPatientDocumentFile,
} from '@/domain/patients/interfaces/PatientApi';
import type {
  HistoryCategory,
  PatientResource,
} from '@/domain/patients/interfaces/PatientInterfaces';
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

export type ResourceArg = { patientId: string; kind?: HistoryCategory };

const RESOURCE_PREFIX = PATIENTS_REDUCER + '/load/';

export const resourceKey = (type: string, arg: ResourceArg): PatientResource => {
  const name = type.slice(RESOURCE_PREFIX.length).split('/')[0];
  return (arg.kind ? `${name}:${arg.kind}` : name) as PatientResource;
};

const resourceThunk = <T>(
  name: Exclude<PatientResource, `history:${string}`> | 'history',
  load: (arg: ResourceArg) => Promise<ServiceResult<T>>
) =>
  createAsyncThunk<ServiceResult<T>, ResourceArg, { state: RootState }>(
    RESOURCE_PREFIX + name,
    load,
    {
      condition: (arg, { getState }) =>
        !getState().patients.resources[arg.patientId]?.[resourceKey(RESOURCE_PREFIX + name, arg)]
          ?.loading,
    }
  );

export const fetchPatientChartAction = resourceThunk('chart', ({ patientId }) =>
  PatientService.getChart(patientId)
);

export const fetchDiagnosesAction = resourceThunk('diagnoses', ({ patientId }) =>
  PatientService.getDiagnoses(patientId)
);

export const fetchAllergiesAction = resourceThunk('allergies', ({ patientId }) =>
  PatientService.getAllergies(patientId)
);

export const fetchHistoryAction = resourceThunk('history', ({ patientId, kind }) =>
  PatientService.getHistory(patientId, kind ?? 'medical')
);

export const fetchNotesAction = resourceThunk('notes', ({ patientId }) =>
  PatientService.getNotes(patientId)
);

export const fetchIncidentsAction = resourceThunk('incidents', ({ patientId }) =>
  PatientService.getIncidents(patientId)
);

export const fetchCoveragesAction = resourceThunk('coverages', ({ patientId }) =>
  PatientService.getCoverages(patientId)
);

export const fetchDocumentsAction = resourceThunk('documents', ({ patientId }) =>
  PatientService.getDocuments(patientId)
);

export const fetchAppointmentsAction = resourceThunk('appointments', ({ patientId }) =>
  PatientService.getAppointments(patientId)
);

export const fetchDocumentFileAction = createAsyncThunk<
  ServiceResult<ApiPatientDocumentFile>,
  { patientId: string; documentId: string },
  { state: RootState }
>(PATIENTS_REDUCER + '/fetchDocumentFile', async ({ patientId, documentId }) =>
  PatientService.getDocument(patientId, documentId)
);

export const fetchCoverageOptionsAction = createAsyncThunk<
  ServiceResult<ApiCoverageOptions>,
  void,
  { state: RootState }
>(PATIENTS_REDUCER + '/fetchCoverageOptions', async () => PatientService.getCoverageOptions());

export const createDiagnosisAction = createAsyncThunk<
  ServiceResult<ApiDiagnosis>,
  { patientId: string; body: ApiDiagnosisCreate },
  { state: RootState }
>(PATIENTS_REDUCER + '/createDiagnosis', async ({ patientId, body }) =>
  PatientService.createDiagnosis(patientId, body)
);

export const createAllergyAction = createAsyncThunk<
  ServiceResult<ApiAllergy>,
  { patientId: string; body: ApiAllergyCreate },
  { state: RootState }
>(PATIENTS_REDUCER + '/createAllergy', async ({ patientId, body }) =>
  PatientService.createAllergy(patientId, body)
);

export const createHistoryAction = createAsyncThunk<
  ServiceResult<ApiHistoryEntry>,
  { patientId: string; body: ApiHistoryCreate },
  { state: RootState }
>(PATIENTS_REDUCER + '/createHistory', async ({ patientId, body }) =>
  PatientService.createHistory(patientId, body)
);

export const createNoteAction = createAsyncThunk<
  ServiceResult<ApiChartNote>,
  { patientId: string; body: ApiNoteCreate },
  { state: RootState }
>(PATIENTS_REDUCER + '/createNote', async ({ patientId, body }) =>
  PatientService.createNote(patientId, body)
);

export const createCoverageAction = createAsyncThunk<
  ServiceResult<ApiCoverage>,
  { patientId: string; body: ApiCoverageCreate },
  { state: RootState }
>(PATIENTS_REDUCER + '/createCoverage', async ({ patientId, body }) =>
  PatientService.createCoverage(patientId, body)
);

export const uploadDocumentAction = createAsyncThunk<
  ServiceResult<ApiPatientDocument>,
  { patientId: string; upload: ApiDocumentUpload },
  { state: RootState }
>(PATIENTS_REDUCER + '/uploadDocument', async ({ patientId, upload }) =>
  PatientService.uploadDocument(patientId, upload)
);

export const createIncidentAction = createAsyncThunk<
  ServiceResult<ApiIncident>,
  { patientId: string; body: ApiIncidentCreate },
  { state: RootState }
>(PATIENTS_REDUCER + '/createIncident', async ({ patientId, body }) =>
  PatientService.createIncident(patientId, body)
);

export const updateIncidentAction = createAsyncThunk<
  ServiceResult<ApiIncident>,
  { patientId: string; incidentId: string; body: ApiIncidentUpdate },
  { state: RootState }
>(PATIENTS_REDUCER + '/updateIncident', async ({ patientId, incidentId, body }) =>
  PatientService.updateIncident(patientId, incidentId, body)
);

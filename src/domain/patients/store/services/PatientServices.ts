import { callApi } from '@/config/ApiError';
import { get, patch, post } from '@/config/AxiosConfig';
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
  ApiPatientChart,
  ApiPatientDocument,
  ApiPatientDocumentFile,
} from '@/domain/patients/interfaces/PatientApi';
import type { HistoryCategory } from '@/domain/patients/interfaces/PatientInterfaces';
import type { ApiAppointment } from '@/domain/visits/interfaces/AppointmentApi';
import type { ServiceResult } from '@/types/ServiceInterfaces';

export const PATIENT_ENDPOINTS = {
  patients: '/api/patients/',
  patient: (id: string) => `/api/patients/${id}/`,
  chart: (id: string) => `/api/patients/${id}/chart/`,
  diagnoses: (id: string) => `/api/patients/${id}/diagnoses/`,
  allergies: (id: string) => `/api/patients/${id}/allergies/`,
  history: (id: string) => `/api/patients/${id}/history/`,
  notes: (id: string) => `/api/patients/${id}/notes/`,
  incidents: (id: string) => `/api/patients/${id}/incidents/`,
  incident: (patientId: string, id: string) => `/api/patients/${patientId}/incidents/${id}/`,
  coverages: (id: string) => `/api/patients/${id}/coverages/`,
  coverageOptions: '/api/patients/coverage-options/',
  documents: (id: string) => `/api/patients/${id}/documents/`,
  document: (patientId: string, id: string) => `/api/patients/${patientId}/documents/${id}/`,
  appointments: (id: string) => `/api/patients/${id}/appointments/`,
} as const;

// TODO: page through when a patient has more rows than one page holds.
const LIST_PAGE_SIZE = 100;
const firstPage = { params: { page: 1, page_size: LIST_PAGE_SIZE } };

export const PATIENTS_PAGE_SIZE = 25;

export type PatientListQuery = { search: string; status?: string; page: number };

class PatientService {
  async getPatients(query: PatientListQuery): Promise<ServiceResult<ApiPage<ApiPatient>>> {
    return callApi(() =>
      get<ApiPage<ApiPatient>>(PATIENT_ENDPOINTS.patients, {
        params: {
          page: query.page,
          page_size: PATIENTS_PAGE_SIZE,
          ...(query.search.trim() ? { search: query.search.trim() } : {}),
          ...(query.status ? { status: query.status } : {}),
        },
      })
    );
  }

  async getPatient(id: string): Promise<ServiceResult<ApiPatient>> {
    return callApi(() => get<ApiPatient>(PATIENT_ENDPOINTS.patient(id)));
  }

  async getChart(id: string): Promise<ServiceResult<ApiPatientChart>> {
    return callApi(() => get<ApiPatientChart>(PATIENT_ENDPOINTS.chart(id)));
  }

  async getDiagnoses(id: string): Promise<ServiceResult<ApiPage<ApiDiagnosis>>> {
    return callApi(() => get<ApiPage<ApiDiagnosis>>(PATIENT_ENDPOINTS.diagnoses(id), firstPage));
  }

  async createDiagnosis(
    id: string,
    body: ApiDiagnosisCreate
  ): Promise<ServiceResult<ApiDiagnosis>> {
    return callApi(() => post<ApiDiagnosis>(PATIENT_ENDPOINTS.diagnoses(id), body));
  }

  async getAllergies(id: string): Promise<ServiceResult<ApiPage<ApiAllergy>>> {
    return callApi(() => get<ApiPage<ApiAllergy>>(PATIENT_ENDPOINTS.allergies(id), firstPage));
  }

  async createAllergy(id: string, body: ApiAllergyCreate): Promise<ServiceResult<ApiAllergy>> {
    return callApi(() => post<ApiAllergy>(PATIENT_ENDPOINTS.allergies(id), body));
  }

  async getHistory(id: string, kind: HistoryCategory): Promise<ServiceResult<ApiHistoryEntry[]>> {
    return callApi(() =>
      get<ApiHistoryEntry[]>(PATIENT_ENDPOINTS.history(id), { params: { kind } })
    );
  }

  async createHistory(id: string, body: ApiHistoryCreate): Promise<ServiceResult<ApiHistoryEntry>> {
    return callApi(() => post<ApiHistoryEntry>(PATIENT_ENDPOINTS.history(id), body));
  }

  async getNotes(id: string): Promise<ServiceResult<ApiPage<ApiChartNote>>> {
    return callApi(() => get<ApiPage<ApiChartNote>>(PATIENT_ENDPOINTS.notes(id), firstPage));
  }

  async createNote(id: string, body: ApiNoteCreate): Promise<ServiceResult<ApiChartNote>> {
    return callApi(() => post<ApiChartNote>(PATIENT_ENDPOINTS.notes(id), body));
  }

  async getIncidents(id: string): Promise<ServiceResult<ApiIncident[]>> {
    return callApi(() => get<ApiIncident[]>(PATIENT_ENDPOINTS.incidents(id)));
  }

  async createIncident(
    patientId: string,
    body: ApiIncidentCreate
  ): Promise<ServiceResult<ApiIncident>> {
    return callApi(() => post<ApiIncident>(PATIENT_ENDPOINTS.incidents(patientId), body));
  }

  async updateIncident(
    patientId: string,
    id: string,
    body: ApiIncidentUpdate
  ): Promise<ServiceResult<ApiIncident>> {
    return callApi(() => patch<ApiIncident>(PATIENT_ENDPOINTS.incident(patientId, id), body));
  }

  async getCoverages(id: string): Promise<ServiceResult<ApiCoverage[]>> {
    return callApi(() => get<ApiCoverage[]>(PATIENT_ENDPOINTS.coverages(id)));
  }

  async createCoverage(id: string, body: ApiCoverageCreate): Promise<ServiceResult<ApiCoverage>> {
    return callApi(() => post<ApiCoverage>(PATIENT_ENDPOINTS.coverages(id), body));
  }

  async getCoverageOptions(): Promise<ServiceResult<ApiCoverageOptions>> {
    return callApi(() => get<ApiCoverageOptions>(PATIENT_ENDPOINTS.coverageOptions));
  }

  async getDocuments(id: string): Promise<ServiceResult<ApiPage<ApiPatientDocument>>> {
    return callApi(() =>
      get<ApiPage<ApiPatientDocument>>(PATIENT_ENDPOINTS.documents(id), firstPage)
    );
  }

  async getDocument(patientId: string, id: string): Promise<ServiceResult<ApiPatientDocumentFile>> {
    return callApi(() => get<ApiPatientDocumentFile>(PATIENT_ENDPOINTS.document(patientId, id)));
  }

  async uploadDocument(
    id: string,
    upload: ApiDocumentUpload
  ): Promise<ServiceResult<ApiPatientDocument>> {
    const form = new FormData();
    form.append('section', upload.section);
    form.append('category', upload.category);
    if (upload.name) form.append('name', upload.name);
    if (upload.document_date) form.append('document_date', upload.document_date);
    form.append('file', upload.file as unknown as Blob);
    return callApi(() =>
      post<ApiPatientDocument>(PATIENT_ENDPOINTS.documents(id), form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    );
  }

  async getAppointments(id: string): Promise<ServiceResult<ApiPage<ApiAppointment>>> {
    return callApi(() =>
      get<ApiPage<ApiAppointment>>(PATIENT_ENDPOINTS.appointments(id), firstPage)
    );
  }
}

export default new PatientService();

import {
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
  type PayloadAction,
} from '@reduxjs/toolkit';

import type { ApiPatient } from '@/domain/patients/interfaces/PatientApi';
import type {
  PatientChart,
  PatientResource,
  PatientsState,
  ResourceStatus,
} from '@/domain/patients/interfaces/PatientInterfaces';
import {
  toAllergy,
  toChartFields,
  toChartNote,
  toDiagnosis,
  toDocument,
  toHistoryEntry,
  toIncident,
  toInsurancePlan,
  toPatientFields,
} from '@/domain/patients/patientChartMapper';
import { emptyChart, toChart, toPatient, withTeams } from '@/domain/patients/patientMapper';
import {
  createAllergyAction,
  createCoverageAction,
  createDiagnosisAction,
  createHistoryAction,
  createIncidentAction,
  createNoteAction,
  fetchAllergiesAction,
  fetchAppointmentsAction,
  fetchCoveragesAction,
  fetchDiagnosesAction,
  fetchDocumentsAction,
  fetchHistoryAction,
  fetchIncidentsAction,
  fetchNotesAction,
  fetchPatientAction,
  fetchPatientChartAction,
  fetchPatientsAction,
  resourceKey,
  updateIncidentAction,
  uploadDocumentAction,
  type ResourceArg,
} from '@/domain/patients/store/async-actions/PatientAsyncActions';
import { toVisit } from '@/domain/visits/appointmentMapper';
import type { ApiAppointment } from '@/domain/visits/interfaces/AppointmentApi';
import {
  changeVisitStatusAction,
  createAppointmentsAction,
  rescheduleVisitAction,
  updateAppointmentAction,
} from '@/domain/visits/store/async-actions/VisitAsyncActions';
import { PATIENTS_REDUCER } from '@/store/constants/StoreConstants';

const initialState: PatientsState = {
  byId: {},
  list: { ids: [], count: 0, page: 0, hasMore: false, loading: false, error: null },
  detailError: null,
  charts: {},
  resources: {},
};

const RESOURCE_THUNKS = [
  fetchPatientChartAction,
  fetchDiagnosesAction,
  fetchAllergiesAction,
  fetchHistoryAction,
  fetchNotesAction,
  fetchIncidentsAction,
  fetchCoveragesAction,
  fetchDocumentsAction,
  fetchAppointmentsAction,
] as const;

const savePatient = (state: PatientsState, api: ApiPatient) => {
  state.byId[api.id] = { ...toPatient(api), ...state.charts[api.id]?.header };
  state.charts[api.id] = toChart(api, state.charts[api.id]);
};

const chartOf = (state: PatientsState, patientId: string): PatientChart =>
  (state.charts[patientId] ??= emptyChart(patientId));

const isLoaded = (state: PatientsState, patientId: string, resource: PatientResource) =>
  Boolean(state.resources[patientId]?.[resource]?.loaded);

const setStatus = (
  state: PatientsState,
  { patientId }: ResourceArg,
  resource: PatientResource,
  status: Partial<ResourceStatus>
) => {
  const resources = (state.resources[patientId] ??= {});
  resources[resource] = {
    loading: false,
    loaded: false,
    error: null,
    ...resources[resource],
    ...status,
  };
};

const markStale = (state: PatientsState, patientId: string, only?: PatientResource) => {
  const resources = state.resources[patientId];
  if (!resources) return;
  for (const [key, status] of Object.entries(resources)) {
    if (status && status.loaded && !status.loading && (!only || key === only)) status.stale = true;
  }
};

const VISIT_CHANGES = [
  createAppointmentsAction,
  updateAppointmentAction,
  rescheduleVisitAction,
  changeVisitStatusAction,
] as const;

const PatientsReducer = createSlice({
  name: PATIENTS_REDUCER,
  initialState,
  reducers: {
    refreshPatient: (state, action: PayloadAction<string>) => {
      markStale(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientsAction.pending, (state, action) => {
        state.list.loading = true;
        state.list.error = null;
        if (action.meta.arg.page === 1) state.list.ids = [];
      })
      .addCase(fetchPatientsAction.fulfilled, (state, action) => {
        state.list.loading = false;
        if ('error' in action.payload) {
          state.list.error = action.payload.error;
          return;
        }
        const page = action.payload.data;
        const results = Array.isArray(page.results) ? page.results : [];
        results.forEach((api) => savePatient(state, api));
        const ids = results.map((api) => api.id);
        state.list.ids = action.meta.arg.page === 1 ? ids : [...state.list.ids, ...ids];
        state.list.count = page.count;
        state.list.page = action.meta.arg.page;
        state.list.hasMore = page.next !== null;
      })
      .addCase(fetchPatientsAction.rejected, (state) => {
        state.list.loading = false;
      })
      .addCase(fetchPatientAction.pending, (state) => {
        state.detailError = null;
      })
      .addCase(fetchPatientAction.fulfilled, (state, action) => {
        if ('error' in action.payload) state.detailError = action.payload.error;
        else savePatient(state, action.payload.data);
      })
      .addCase(fetchPatientChartAction.fulfilled, (state, action) => {
        if ('error' in action.payload) return;
        const id = action.meta.arg.patientId;
        const api = action.payload.data;
        const chart = chartOf(state, id);
        const { diagnoses, allergies, notes, services = [], ...fields } = toChartFields(api);
        Object.assign(chart, fields);
        chart.services = withTeams(services, chart.providers);
        if (!isLoaded(state, id, 'diagnoses') && diagnoses) chart.diagnoses = diagnoses;
        if (!isLoaded(state, id, 'allergies') && allergies) chart.allergies = allergies;
        if (!isLoaded(state, id, 'notes') && notes) chart.notes = notes;
        chart.header = toPatientFields(api);
        const patient = state.byId[id];
        if (patient) Object.assign(patient, chart.header);
      })
      .addCase(fetchDiagnosesAction.fulfilled, (state, action) => {
        if ('error' in action.payload) return;
        chartOf(state, action.meta.arg.patientId).diagnoses =
          action.payload.data.results.map(toDiagnosis);
      })
      .addCase(fetchAllergiesAction.fulfilled, (state, action) => {
        if ('error' in action.payload) return;
        chartOf(state, action.meta.arg.patientId).allergies =
          action.payload.data.results.map(toAllergy);
      })
      .addCase(fetchHistoryAction.fulfilled, (state, action) => {
        if ('error' in action.payload) return;
        const chart = chartOf(state, action.meta.arg.patientId);
        const kind = action.meta.arg.kind;
        chart.history = [
          ...chart.history.filter((entry) => entry.category !== kind),
          ...action.payload.data.map(toHistoryEntry),
        ];
      })
      .addCase(fetchNotesAction.fulfilled, (state, action) => {
        if ('error' in action.payload) return;
        chartOf(state, action.meta.arg.patientId).notes =
          action.payload.data.results.map(toChartNote);
      })
      .addCase(fetchIncidentsAction.fulfilled, (state, action) => {
        if ('error' in action.payload) return;
        chartOf(state, action.meta.arg.patientId).incidents = action.payload.data.map(toIncident);
      })
      .addCase(fetchCoveragesAction.fulfilled, (state, action) => {
        if ('error' in action.payload) return;
        chartOf(state, action.meta.arg.patientId).insurancePlans =
          action.payload.data.map(toInsurancePlan);
      })
      .addCase(fetchDocumentsAction.fulfilled, (state, action) => {
        if ('error' in action.payload) return;
        chartOf(state, action.meta.arg.patientId).documents =
          action.payload.data.results.map(toDocument);
      })
      .addCase(fetchAppointmentsAction.fulfilled, (state, action) => {
        if ('error' in action.payload) return;
        chartOf(state, action.meta.arg.patientId).appointments = action.payload.data.results
          .map(toVisit)
          .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
      })
      .addCase(createDiagnosisAction.fulfilled, (state, action) => {
        if ('error' in action.payload) return;
        const chart = chartOf(state, action.meta.arg.patientId);
        chart.diagnoses = [...chart.diagnoses, toDiagnosis(action.payload.data)];
      })
      .addCase(createAllergyAction.fulfilled, (state, action) => {
        if ('error' in action.payload) return;
        const chart = chartOf(state, action.meta.arg.patientId);
        chart.allergies = [...chart.allergies, toAllergy(action.payload.data)];
      })
      .addCase(createHistoryAction.fulfilled, (state, action) => {
        if ('error' in action.payload) return;
        const chart = chartOf(state, action.meta.arg.patientId);
        chart.history = [toHistoryEntry(action.payload.data), ...chart.history];
      })
      .addCase(createNoteAction.fulfilled, (state, action) => {
        if ('error' in action.payload) return;
        const chart = chartOf(state, action.meta.arg.patientId);
        chart.notes = [toChartNote(action.payload.data), ...chart.notes];
      })
      .addCase(createCoverageAction.fulfilled, (state, action) => {
        if ('error' in action.payload) return;
        const chart = chartOf(state, action.meta.arg.patientId);
        chart.insurancePlans = [...chart.insurancePlans, toInsurancePlan(action.payload.data)];
      })
      .addCase(uploadDocumentAction.fulfilled, (state, action) => {
        if ('error' in action.payload) return;
        const chart = chartOf(state, action.meta.arg.patientId);
        chart.documents = [toDocument(action.payload.data), ...chart.documents];
      })
      .addCase(createIncidentAction.fulfilled, (state, action) => {
        if ('error' in action.payload) return;
        const chart = chartOf(state, action.meta.arg.patientId);
        chart.incidents = [toIncident(action.payload.data), ...chart.incidents];
      })
      .addCase(updateIncidentAction.fulfilled, (state, action) => {
        const chart = state.charts[action.meta.arg.patientId];
        if (!chart || 'error' in action.payload) return;
        const updated = toIncident(action.payload.data);
        const index = chart.incidents.findIndex((item) => item.id === updated.id);
        if (index >= 0) chart.incidents[index] = updated;
      })
      .addMatcher(isPending(...RESOURCE_THUNKS), (state, action) => {
        setStatus(state, action.meta.arg, resourceKey(action.type, action.meta.arg), {
          loading: true,
          error: null,
          stale: false,
        });
      })
      .addMatcher(isFulfilled(...VISIT_CHANGES), (state, action) => {
        if ('error' in action.payload) return;
        const data: ApiAppointment | ApiAppointment[] = action.payload.data;
        const appointments = Array.isArray(data) ? data : [data];
        new Set(appointments.map((item) => item.patient?.id).filter(Boolean)).forEach((id) =>
          markStale(state, id, 'appointments')
        );
      })
      .addMatcher(isFulfilled(...RESOURCE_THUNKS), (state, action) => {
        const failed = 'error' in action.payload ? action.payload.error : null;
        setStatus(state, action.meta.arg, resourceKey(action.type, action.meta.arg), {
          loading: false,
          error: failed,
          ...(failed ? {} : { loaded: true }),
        });
      })
      .addMatcher(isRejected(...RESOURCE_THUNKS), (state, action) => {
        if (action.meta.condition) return;
        setStatus(state, action.meta.arg, resourceKey(action.type, action.meta.arg), {
          loading: false,
          error: 'Something went wrong. Try again.',
        });
      });
  },
});

export default PatientsReducer.reducer;
export const { refreshPatient } = PatientsReducer.actions;

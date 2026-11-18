import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';

import type { ApiPatient } from '@/domain/patients/interfaces/PatientApi';
import type {
  Allergy,
  ChartNote,
  Diagnosis,
  HistoryEntry,
  InsurancePlan,
  PatientDocument,
  PatientIncident,
  PatientsState,
} from '@/domain/patients/interfaces/PatientInterfaces';
import { MOCK_PATIENT_CHARTS } from '@/domain/patients/mocks/PatientChartMocks';
import { toChart, toPatient } from '@/domain/patients/patientMapper';
import {
  fetchPatientAction,
  fetchPatientsAction,
} from '@/domain/patients/store/async-actions/PatientAsyncActions';
import { PATIENTS_REDUCER } from '@/store/constants/StoreConstants';

const INCIDENT_BASE = 1000;

const initialState: PatientsState = {
  byId: {},
  list: { ids: [], count: 0, page: 0, hasMore: false, loading: false, error: null },
  detailError: null,
  charts: MOCK_PATIENT_CHARTS,
};

const savePatient = (state: PatientsState, api: ApiPatient) => {
  state.byId[api.id] = toPatient(api);
  state.charts[api.id] = toChart(api, state.charts[api.id]);
};

const PatientsReducer = createSlice({
  name: PATIENTS_REDUCER,
  initialState,
  reducers: {
    // TEMPORARY: these update the chart locally; replace with API thunks once the service exists.
    addPatientDocument: {
      reducer: (state, action: PayloadAction<{ patientId: string; document: PatientDocument }>) => {
        state.charts[action.payload.patientId]?.documents.unshift(action.payload.document);
      },
      prepare: (payload: { patientId: string; document: Omit<PatientDocument, 'id'> }) => ({
        payload: { ...payload, document: { ...payload.document, id: nanoid() } },
      }),
    },
    addHistoryEntry: {
      reducer: (state, action: PayloadAction<{ patientId: string; entry: HistoryEntry }>) => {
        state.charts[action.payload.patientId]?.history.unshift(action.payload.entry);
      },
      prepare: (payload: { patientId: string; entry: Omit<HistoryEntry, 'id'> }) => ({
        payload: { ...payload, entry: { ...payload.entry, id: nanoid() } },
      }),
    },
    addDiagnosis: {
      reducer: (state, action: PayloadAction<{ patientId: string; diagnosis: Diagnosis }>) => {
        const chart = state.charts[action.payload.patientId];
        if (!chart) return;
        const hasPrimary = chart.diagnoses.some((item) => item.rank === 'primary');
        chart.diagnoses.push({
          ...action.payload.diagnosis,
          rank: hasPrimary ? 'secondary' : 'primary',
        });
      },
      prepare: (payload: { patientId: string; diagnosis: Omit<Diagnosis, 'id' | 'rank'> }) => ({
        payload: {
          ...payload,
          diagnosis: { ...payload.diagnosis, id: nanoid(), rank: 'secondary' as const },
        },
      }),
    },
    addAllergy: {
      reducer: (state, action: PayloadAction<{ patientId: string; allergy: Allergy }>) => {
        state.charts[action.payload.patientId]?.allergies.push(action.payload.allergy);
      },
      prepare: (payload: { patientId: string; allergy: Omit<Allergy, 'id'> }) => ({
        payload: { ...payload, allergy: { ...payload.allergy, id: nanoid() } },
      }),
    },
    addChartNote: {
      reducer: (state, action: PayloadAction<{ patientId: string; note: ChartNote }>) => {
        state.charts[action.payload.patientId]?.notes.unshift(action.payload.note);
      },
      prepare: (payload: { patientId: string; note: Omit<ChartNote, 'id'> }) => ({
        payload: { ...payload, note: { ...payload.note, id: nanoid() } },
      }),
    },
    addInsurancePlan: {
      reducer: (state, action: PayloadAction<{ patientId: string; plan: InsurancePlan }>) => {
        state.charts[action.payload.patientId]?.insurancePlans.push(action.payload.plan);
      },
      prepare: (payload: { patientId: string; plan: Omit<InsurancePlan, 'id'> }) => ({
        payload: { ...payload, plan: { ...payload.plan, id: nanoid() } },
      }),
    },
    addPatientIncident: {
      reducer: (
        state,
        action: PayloadAction<{ patientId: string; incident: Omit<PatientIncident, 'code'> }>
      ) => {
        const chart = state.charts[action.payload.patientId];
        if (!chart) return;
        const last = Math.max(
          INCIDENT_BASE,
          ...chart.incidents.map((item) => Number(item.code.replace(/\D/g, '')) || 0)
        );
        chart.incidents.unshift({
          status: 'open',
          ...action.payload.incident,
          code: `INC-${last + 1}`,
        });
      },
      prepare: (payload: { patientId: string; incident: Omit<PatientIncident, 'code'> }) => ({
        payload,
      }),
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
      });
  },
});

export default PatientsReducer.reducer;
export const {
  addPatientDocument,
  addHistoryEntry,
  addDiagnosis,
  addAllergy,
  addChartNote,
  addInsurancePlan,
  addPatientIncident,
} = PatientsReducer.actions;

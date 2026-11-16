import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';

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
import { PATIENTS_REDUCER } from '@/store/constants/StoreConstants';

const INCIDENT_BASE = 1000;

const initialState: PatientsState = {
  charts: MOCK_PATIENT_CHARTS,
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

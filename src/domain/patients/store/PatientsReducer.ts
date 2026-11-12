import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';

import type {
  Allergy,
  Diagnosis,
  HistoryEntry,
  PatientDocument,
  PatientIncident,
  PatientsState,
} from '@/domain/patients/interfaces/PatientInterfaces';
import { MOCK_PATIENT_CHARTS } from '@/domain/patients/mocks/PatientChartMocks';
import { PATIENTS_REDUCER } from '@/store/constants/StoreConstants';

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
    addPatientIncident: {
      reducer: (state, action: PayloadAction<{ patientId: string; incident: PatientIncident }>) => {
        state.charts[action.payload.patientId]?.incidents.unshift(action.payload.incident);
      },
      prepare: (payload: { patientId: string; incident: PatientIncident }) => ({ payload }),
    },
  },
});

export default PatientsReducer.reducer;
export const { addPatientDocument, addHistoryEntry, addDiagnosis, addAllergy, addPatientIncident } =
  PatientsReducer.actions;

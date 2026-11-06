import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';

import type {
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
    addPatientIncident: {
      reducer: (state, action: PayloadAction<{ patientId: string; incident: PatientIncident }>) => {
        state.charts[action.payload.patientId]?.incidents.unshift(action.payload.incident);
      },
      prepare: (payload: { patientId: string; incident: PatientIncident }) => ({ payload }),
    },
  },
});

export default PatientsReducer.reducer;
export const { addPatientDocument, addHistoryEntry, addPatientIncident } = PatientsReducer.actions;

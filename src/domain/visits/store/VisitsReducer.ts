import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Visit, VisitStatus } from '@/domain/visits/interfaces/VisitInterfaces';
import { MOCK_VISITS } from '@/domain/visits/mocks/VisitMocks';
import { VISITS_REDUCER } from '@/store/constants/StoreConstants';

export interface VisitsState {
  items: Visit[];
}

const initialState: VisitsState = {
  items: MOCK_VISITS,
};

const VisitsReducer = createSlice({
  name: VISITS_REDUCER,
  initialState,
  reducers: {
    setVisitStatus: (state, action: PayloadAction<{ visitId: string; status: VisitStatus }>) => {
      const visit = state.items.find((item) => item.id === action.payload.visitId);
      if (visit) visit.status = action.payload.status;
    },
    addVisits: (state, action: PayloadAction<Visit[]>) => {
      state.items.push(...action.payload);
    },
    removeVisits: (state, action: PayloadAction<{ ids: string[] }>) => {
      state.items = state.items.filter((visit) => !action.payload.ids.includes(visit.id));
    },
  },
});

export default VisitsReducer.reducer;
export const { setVisitStatus, addVisits, removeVisits } = VisitsReducer.actions;

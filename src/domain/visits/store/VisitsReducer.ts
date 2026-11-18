import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { EnvConfig } from '@/config/EnvConfig';
import { toVisit } from '@/domain/visits/appointmentMapper';
import type { Visit, VisitStatus } from '@/domain/visits/interfaces/VisitInterfaces';
import { MOCK_VISITS } from '@/domain/visits/mocks/VisitMocks';
import { fetchVisitsAction } from '@/domain/visits/store/async-actions/VisitAsyncActions';
import { VISITS_REDUCER } from '@/store/constants/StoreConstants';
import { toIsoDate } from '@/utils/dateFormat';

export interface VisitsState {
  items: Visit[];
  loading: boolean;
  error: string | null;
}

const initialState: VisitsState = {
  items: EnvConfig.apiUrl ? [] : MOCK_VISITS,
  loading: false,
  error: null,
};

const dayOf = (visit: Visit) => toIsoDate(new Date(visit.startsAt));

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
  extraReducers: (builder) => {
    builder
      .addCase(fetchVisitsAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVisitsAction.fulfilled, (state, action) => {
        state.loading = false;
        if ('error' in action.payload) {
          state.error = action.payload.error;
          return;
        }
        const { from, to } = action.meta.arg;
        const outside = state.items.filter((visit) => dayOf(visit) < from || dayOf(visit) > to);
        const loaded = action.payload.data.flatMap((appointment) => {
          try {
            return [toVisit(appointment)];
          } catch {
            return [];
          }
        });
        state.items = [...outside, ...loaded];
      })
      .addCase(fetchVisitsAction.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default VisitsReducer.reducer;
export const { setVisitStatus, addVisits, removeVisits } = VisitsReducer.actions;

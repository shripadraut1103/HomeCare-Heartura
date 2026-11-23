import { createSlice, isAnyOf, type PayloadAction } from '@reduxjs/toolkit';

import type { ApiSchedulingReference } from '@/domain/schedule/interfaces/BookingApi';
import { toVisit } from '@/domain/visits/appointmentMapper';
import type { ApiAppointment } from '@/domain/visits/interfaces/AppointmentApi';
import type { Visit, VisitStatus } from '@/domain/visits/interfaces/VisitInterfaces';
import {
  changeVisitStatusAction,
  createAppointmentsAction,
  fetchSchedulingReferenceAction,
  fetchVisitAction,
  fetchVisitsAction,
  rescheduleVisitAction,
  updateAppointmentAction,
} from '@/domain/visits/store/async-actions/VisitAsyncActions';
import { VISITS_REDUCER } from '@/store/constants/StoreConstants';
import { toIsoDate } from '@/utils/dateFormat';

export interface VisitsState {
  items: Visit[];
  loading: boolean;
  error: string | null;
  reference: ApiSchedulingReference | null;
  referenceLoading: boolean;
  referenceError: string | null;
}

const initialState: VisitsState = {
  items: [],
  loading: false,
  error: null,
  reference: null,
  referenceLoading: false,
  referenceError: null,
};

const dayOf = (visit: Visit) => toIsoDate(new Date(visit.startsAt));

const toVisits = (appointments: ApiAppointment[]) =>
  appointments.flatMap((appointment) => {
    try {
      return [toVisit(appointment)];
    } catch {
      return [];
    }
  });

function upsert(state: VisitsState, appointments: ApiAppointment[]) {
  toVisits(appointments).forEach((visit) => {
    const index = state.items.findIndex((item) => item.id === visit.id);
    if (index >= 0) state.items[index] = { ...state.items[index], ...visit };
    else state.items.push(visit);
  });
}

const VisitsReducer = createSlice({
  name: VISITS_REDUCER,
  initialState,
  reducers: {
    setVisitStatus: (state, action: PayloadAction<{ visitId: string; status: VisitStatus }>) => {
      const visit = state.items.find((item) => item.id === action.payload.visitId);
      if (visit) visit.status = action.payload.status;
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
        state.items = [...outside, ...toVisits(action.payload.data)];
      })
      .addCase(fetchVisitsAction.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchSchedulingReferenceAction.pending, (state) => {
        state.referenceLoading = true;
        state.referenceError = null;
      })
      .addCase(fetchSchedulingReferenceAction.fulfilled, (state, action) => {
        state.referenceLoading = false;
        if ('error' in action.payload) state.referenceError = action.payload.error;
        else state.reference = action.payload.data;
      })
      .addCase(fetchSchedulingReferenceAction.rejected, (state, action) => {
        state.referenceLoading = false;
        if (!action.meta.condition) state.referenceError = 'Couldn’t load the booking options.';
      })
      .addCase(createAppointmentsAction.fulfilled, (state, action) => {
        if (!('error' in action.payload)) upsert(state, action.payload.data);
      })
      .addCase(rescheduleVisitAction.fulfilled, (state, action) => {
        if ('error' in action.payload) return;
        const old = state.items.find((item) => item.id === action.meta.arg.visitId);
        if (old) old.status = 'rescheduled';
        upsert(state, [action.payload.data]);
      })
      .addMatcher(
        isAnyOf(
          changeVisitStatusAction.fulfilled,
          updateAppointmentAction.fulfilled,
          fetchVisitAction.fulfilled
        ),
        (state, action) => {
          if ('error' in action.payload) return;
          upsert(state, [action.payload.data]);
        }
      );
  },
});

export default VisitsReducer.reducer;
export const { setVisitStatus } = VisitsReducer.actions;

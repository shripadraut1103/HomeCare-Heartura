import { createSlice } from '@reduxjs/toolkit';

import { toAvailabilityRanges } from '@/domain/profile/availabilityMapper';
import type { AvailabilityState } from '@/domain/profile/interfaces/ProfileInterfaces';
import {
  fetchWeeklyHoursAction,
  saveWeeklyHoursAction,
} from '@/domain/profile/store/async-actions/AvailabilityAsyncActions';
import { AVAILABILITY_REDUCER } from '@/store/constants/StoreConstants';

const initialState: AvailabilityState = {
  providerId: null,
  version: null,
  ranges: [],
  updatedAt: null,
  updatedBy: null,
  loading: false,
  loaded: false,
  saving: false,
  error: null,
};

type WeeklyHoursResult = ReturnType<typeof fetchWeeklyHoursAction.fulfilled>['payload'];

function applyWeeklyHours(state: AvailabilityState, payload: WeeklyHoursResult) {
  if (payload.providerId) state.providerId = payload.providerId;
  if ('error' in payload) return;
  state.version = payload.data.version;
  state.ranges = toAvailabilityRanges(payload.data.ranges);
  state.updatedAt = payload.data.updated_at;
  state.updatedBy = payload.data.updated_by_name || null;
}

const AvailabilityReducer = createSlice({
  name: AVAILABILITY_REDUCER,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeeklyHoursAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeeklyHoursAction.fulfilled, (state, action) => {
        state.loading = false;
        if ('error' in action.payload) {
          state.error = action.payload.error;
          return;
        }
        state.loaded = true;
        applyWeeklyHours(state, action.payload);
      })
      .addCase(fetchWeeklyHoursAction.rejected, (state) => {
        state.loading = false;
        state.error = 'Couldn’t load your availability.';
      })
      .addCase(saveWeeklyHoursAction.pending, (state) => {
        state.saving = true;
      })
      .addCase(saveWeeklyHoursAction.fulfilled, (state, action) => {
        state.saving = false;
        applyWeeklyHours(state, action.payload);
      })
      .addCase(saveWeeklyHoursAction.rejected, (state) => {
        state.saving = false;
      });
  },
});

export default AvailabilityReducer.reducer;

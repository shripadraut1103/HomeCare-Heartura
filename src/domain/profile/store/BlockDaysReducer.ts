import { createSlice } from '@reduxjs/toolkit';

import { byBlockStart, toBlockedDay } from '@/domain/profile/availabilityMapper';
import type { BlockDaysState } from '@/domain/profile/interfaces/ProfileInterfaces';
import {
  createBlockDayAction,
  deleteBlockDayAction,
  fetchBlockDaysAction,
  updateBlockDayAction,
} from '@/domain/profile/store/async-actions/AvailabilityAsyncActions';
import { BLOCK_DAYS_REDUCER } from '@/store/constants/StoreConstants';

const initialState: BlockDaysState = {
  blockedDays: [],
  loading: false,
  loaded: false,
  error: null,
};

const BlockDaysReducer = createSlice({
  name: BLOCK_DAYS_REDUCER,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlockDaysAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlockDaysAction.fulfilled, (state, action) => {
        state.loading = false;
        if ('error' in action.payload) {
          state.error = action.payload.error;
          return;
        }
        state.loaded = true;
        state.blockedDays = action.payload.data.results.map(toBlockedDay).sort(byBlockStart);
      })
      .addCase(fetchBlockDaysAction.rejected, (state) => {
        state.loading = false;
        state.error = 'Couldn’t load your block days.';
      })
      .addCase(createBlockDayAction.fulfilled, (state, action) => {
        if ('error' in action.payload) return;
        state.blockedDays = [...state.blockedDays, toBlockedDay(action.payload.data)].sort(
          byBlockStart
        );
      })
      .addCase(updateBlockDayAction.fulfilled, (state, action) => {
        if ('error' in action.payload) return;
        const updated = toBlockedDay(action.payload.data);
        state.blockedDays = state.blockedDays
          .map((block) => (block.id === updated.id ? updated : block))
          .sort(byBlockStart);
      })
      .addCase(deleteBlockDayAction.fulfilled, (state, action) => {
        if ('error' in action.payload) return;
        state.blockedDays = state.blockedDays.filter((block) => block.id !== action.meta.arg.id);
      });
  },
});

export default BlockDaysReducer.reducer;

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { BlockDaysState, BlockedDay } from '@/domain/profile/interfaces/ProfileInterfaces';
import { MOCK_BLOCKED_DAYS } from '@/domain/profile/mocks/ProfileMocks';
import { BLOCK_DAYS_REDUCER } from '@/store/constants/StoreConstants';

const initialState: BlockDaysState = {
  blockedDays: MOCK_BLOCKED_DAYS,
};

const byStart = (a: BlockedDay, b: BlockedDay) =>
  `${a.startDate}${a.hours?.start ?? ''}`.localeCompare(`${b.startDate}${b.hours?.start ?? ''}`);

const BlockDaysReducer = createSlice({
  name: BLOCK_DAYS_REDUCER,
  initialState,
  reducers: {
    // TEMPORARY: saved locally; replace with add / remove thunks once the availability API exists.
    addBlockedDay: (state, action: PayloadAction<BlockedDay>) => {
      state.blockedDays = [...state.blockedDays, action.payload].sort(byStart);
    },
    removeBlockedDay: (state, action: PayloadAction<{ id: string }>) => {
      state.blockedDays = state.blockedDays.filter((day) => day.id !== action.payload.id);
    },
  },
});

export default BlockDaysReducer.reducer;
export const { addBlockedDay, removeBlockedDay } = BlockDaysReducer.actions;

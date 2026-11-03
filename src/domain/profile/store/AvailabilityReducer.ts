import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type {
  AvailabilityRange,
  AvailabilityState,
} from '@/domain/profile/interfaces/ProfileInterfaces';
import { MOCK_AVAILABILITY } from '@/domain/profile/mocks/ProfileMocks';
import { AVAILABILITY_REDUCER } from '@/store/constants/StoreConstants';

const initialState: AvailabilityState = {
  ranges: MOCK_AVAILABILITY,
};

const byStart = (a: AvailabilityRange, b: AvailabilityRange) =>
  a.startDate.localeCompare(b.startDate);

const AvailabilityReducer = createSlice({
  name: AVAILABILITY_REDUCER,
  initialState,
  reducers: {
    // TEMPORARY: saved locally; replace with availability thunks once the API exists.
    saveAvailability: (state, action: PayloadAction<AvailabilityRange>) => {
      const others = state.ranges.filter((range) => range.id !== action.payload.id);
      state.ranges = [...others, action.payload].sort(byStart);
    },
    removeAvailability: (state, action: PayloadAction<{ id: string }>) => {
      state.ranges = state.ranges.filter((range) => range.id !== action.payload.id);
    },
  },
});

export default AvailabilityReducer.reducer;
export const { saveAvailability, removeAvailability } = AvailabilityReducer.actions;

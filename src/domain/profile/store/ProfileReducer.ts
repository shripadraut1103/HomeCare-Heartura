import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { ProfileContact, ProfileState } from '@/domain/profile/interfaces/ProfileInterfaces';
import { MOCK_PROFILE } from '@/domain/profile/mocks/ProfileMocks';
import { PROFILE_REDUCER } from '@/store/constants/StoreConstants';

const initialState: ProfileState = {
  profile: MOCK_PROFILE,
};

const ProfileReducer = createSlice({
  name: PROFILE_REDUCER,
  initialState,
  reducers: {
    // TEMPORARY: saves locally; replace with an update thunk once the profile API exists.
    updateContact: (state, action: PayloadAction<ProfileContact>) => {
      state.profile.contact = action.payload;
    },
  },
});

export default ProfileReducer.reducer;
export const { updateContact } = ProfileReducer.actions;

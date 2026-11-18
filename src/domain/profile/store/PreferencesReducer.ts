import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type {
  AppearancePreference,
  PreferencesState,
} from '@/domain/profile/interfaces/ProfileInterfaces';
import { PREFERENCES_REDUCER } from '@/store/constants/StoreConstants';

const initialState: PreferencesState = {
  appearance: 'system',
  biometricUnlock: true,
  organization: '',
};

const PreferencesReducer = createSlice({
  name: PREFERENCES_REDUCER,
  initialState,
  reducers: {
    setAppearance: (state, action: PayloadAction<AppearancePreference>) => {
      state.appearance = action.payload;
    },
    setBiometricUnlock: (state, action: PayloadAction<boolean>) => {
      state.biometricUnlock = action.payload;
    },
    setOrganization: (state, action: PayloadAction<string>) => {
      state.organization = action.payload;
    },
  },
});

export default PreferencesReducer.reducer;
export const { setAppearance, setBiometricUnlock, setOrganization } = PreferencesReducer.actions;

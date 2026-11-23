import { createSlice, isFulfilled } from '@reduxjs/toolkit';

import type { ProfileState } from '@/domain/profile/interfaces/ProfileInterfaces';
import { emptyProfile, toProfile } from '@/domain/profile/profileMapper';
import {
  fetchProfileAction,
  removeProfilePhotoAction,
  saveSignatureAction,
  updateProfileAction,
  uploadProfilePhotoAction,
} from '@/domain/profile/store/async-actions/ProfileAsyncActions';
import { PROFILE_REDUCER } from '@/store/constants/StoreConstants';

const initialState: ProfileState = {
  profile: emptyProfile(),
  loading: false,
  loaded: false,
  error: null,
};

const ProfileReducer = createSlice({
  name: PROFILE_REDUCER,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileAction.fulfilled, (state, action) => {
        state.loading = false;
        if ('error' in action.payload) state.error = action.payload.error;
        else state.loaded = true;
      })
      .addCase(fetchProfileAction.rejected, (state, action) => {
        if (action.meta.condition) return;
        state.loading = false;
        state.error = 'Couldn’t load your profile. Try again.';
      })
      .addCase(removeProfilePhotoAction.fulfilled, (state, action) => {
        if ('data' in action.payload && action.payload.data === null) {
          state.profile.photoUrl = undefined;
        }
      })
      .addMatcher(
        isFulfilled(
          fetchProfileAction,
          updateProfileAction,
          uploadProfilePhotoAction,
          removeProfilePhotoAction,
          saveSignatureAction
        ),
        (state, action) => {
          if ('data' in action.payload && action.payload.data) {
            state.profile = toProfile(action.payload.data);
          }
        }
      );
  },
});

export default ProfileReducer.reducer;

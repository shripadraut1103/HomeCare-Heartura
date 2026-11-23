import { createAsyncThunk } from '@reduxjs/toolkit';

import type {
  ApiMyProfile,
  ApiPhotoUpload,
  ApiProfileUpdate,
} from '@/domain/profile/interfaces/ProfileApi';
import ProfileService from '@/domain/profile/store/services/ProfileServices';
import { PROFILE_REDUCER } from '@/store/constants/StoreConstants';
import type { RootState } from '@/store/storeConfig';
import type { ServiceResult } from '@/types/ServiceInterfaces';

export const fetchProfileAction = createAsyncThunk<
  ServiceResult<ApiMyProfile>,
  void,
  { state: RootState }
>(PROFILE_REDUCER + '/fetchProfile', async () => ProfileService.getProfile(), {
  condition: (_, { getState }) => !getState().profile.loading,
});

export const updateProfileAction = createAsyncThunk<
  ServiceResult<ApiMyProfile>,
  ApiProfileUpdate,
  { state: RootState }
>(PROFILE_REDUCER + '/updateProfile', async (body) => ProfileService.updateProfile(body));

export const uploadProfilePhotoAction = createAsyncThunk<
  ServiceResult<ApiMyProfile>,
  ApiPhotoUpload,
  { state: RootState }
>(PROFILE_REDUCER + '/uploadPhoto', async (photo) => ProfileService.uploadPhoto(photo));

export const removeProfilePhotoAction = createAsyncThunk<
  ServiceResult<ApiMyProfile | null>,
  void,
  { state: RootState }
>(PROFILE_REDUCER + '/removePhoto', async () => ProfileService.removePhoto());

export const saveSignatureAction = createAsyncThunk<
  ServiceResult<ApiMyProfile>,
  string,
  { state: RootState }
>(PROFILE_REDUCER + '/saveSignature', async (signature) => ProfileService.saveSignature(signature));

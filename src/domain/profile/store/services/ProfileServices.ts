import { callApi } from '@/config/ApiError';
import { del, get, patch, put } from '@/config/AxiosConfig';
import type {
  ApiMyProfile,
  ApiPhotoUpload,
  ApiProfileUpdate,
} from '@/domain/profile/interfaces/ProfileApi';
import type { ServiceResult } from '@/types/ServiceInterfaces';

export const PROFILE_ENDPOINTS = {
  profile: '/api/auth/profile/',
  photo: '/api/auth/profile/photo/',
  signature: '/api/auth/profile/signature/',
} as const;

class ProfileService {
  async getProfile(): Promise<ServiceResult<ApiMyProfile>> {
    return callApi(() => get<ApiMyProfile>(PROFILE_ENDPOINTS.profile));
  }

  async updateProfile(body: ApiProfileUpdate): Promise<ServiceResult<ApiMyProfile>> {
    return callApi(() => patch<ApiMyProfile>(PROFILE_ENDPOINTS.profile, body));
  }

  async uploadPhoto(photo: ApiPhotoUpload): Promise<ServiceResult<ApiMyProfile>> {
    const form = new FormData();
    form.append('photo', photo as unknown as Blob);
    return callApi(() =>
      put<ApiMyProfile>(PROFILE_ENDPOINTS.photo, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    );
  }

  async removePhoto(): Promise<ServiceResult<ApiMyProfile | null>> {
    return callApi(async () => (await del<ApiMyProfile | ''>(PROFILE_ENDPOINTS.photo)) || null);
  }

  async saveSignature(signature: string): Promise<ServiceResult<ApiMyProfile>> {
    return callApi(() => put<ApiMyProfile>(PROFILE_ENDPOINTS.signature, { signature }));
  }
}

export default new ProfileService();

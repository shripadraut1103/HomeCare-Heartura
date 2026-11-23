import { createAsyncThunk } from '@reduxjs/toolkit';

import type { ApiPage } from '@/domain/patients/interfaces/PatientApi';
import type {
  ApiDeclineBody,
  ApiPatientRequest,
  ApiRequestCounts,
} from '@/domain/requests/interfaces/RequestApi';
import type { PatientRequestStatus } from '@/domain/requests/interfaces/RequestInterfaces';
import { API_FILTER } from '@/domain/requests/requestMapper';
import RequestService from '@/domain/requests/store/services/RequestServices';
import { REQUESTS_REDUCER } from '@/store/constants/StoreConstants';
import type { RootState } from '@/store/storeConfig';
import type { ServiceResult } from '@/types/ServiceInterfaces';

export const fetchRequestsAction = createAsyncThunk<
  ServiceResult<ApiPage<ApiPatientRequest>>,
  { status: PatientRequestStatus; page: number },
  { state: RootState }
>(
  REQUESTS_REDUCER + '/fetchRequests',
  async ({ status, page }) => RequestService.getRequests(API_FILTER[status], page),
  { condition: ({ status }, { getState }) => !getState().requests.lists[status].loading }
);

export const fetchRequestCountsAction = createAsyncThunk<
  ServiceResult<ApiRequestCounts>,
  void,
  { state: RootState }
>(REQUESTS_REDUCER + '/fetchCounts', async () => RequestService.getCounts());

export const acceptRequestAction = createAsyncThunk<
  ServiceResult<ApiPatientRequest>,
  { requestId: string },
  { state: RootState }
>(REQUESTS_REDUCER + '/accept', async ({ requestId }) => RequestService.accept(requestId));

export const declineRequestAction = createAsyncThunk<
  ServiceResult<ApiPatientRequest>,
  { requestId: string } & ApiDeclineBody,
  { state: RootState }
>(REQUESTS_REDUCER + '/decline', async ({ requestId, ...body }) =>
  RequestService.decline(requestId, body)
);

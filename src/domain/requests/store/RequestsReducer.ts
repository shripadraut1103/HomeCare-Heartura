import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type {
  PatientRequestStatus,
  RequestsState,
} from '@/domain/requests/interfaces/RequestInterfaces';
import { MOCK_PATIENT_REQUESTS } from '@/domain/requests/mocks/RequestMocks';
import { REQUESTS_REDUCER } from '@/store/constants/StoreConstants';

const initialState: RequestsState = {
  requests: MOCK_PATIENT_REQUESTS,
};

const RequestsReducer = createSlice({
  name: REQUESTS_REDUCER,
  initialState,
  reducers: {
    // TEMPORARY: answers locally; replace with accept / decline thunks once the API exists.
    answerRequest: (
      state,
      action: PayloadAction<{
        requestId: string;
        status: Exclude<PatientRequestStatus, 'waiting'>;
        reason?: string;
      }>
    ) => {
      const request = state.requests.find((item) => item.id === action.payload.requestId);
      if (!request) return;
      request.status = action.payload.status;
      request.declineReason =
        action.payload.status === 'declined' ? action.payload.reason : undefined;
    },
    reopenRequest: (state, action: PayloadAction<{ requestId: string }>) => {
      const request = state.requests.find((item) => item.id === action.payload.requestId);
      if (!request) return;
      request.status = 'waiting';
      request.declineReason = undefined;
    },
  },
});

export default RequestsReducer.reducer;
export const { answerRequest, reopenRequest } = RequestsReducer.actions;

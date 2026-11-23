import { createSlice, isFulfilled } from '@reduxjs/toolkit';

import type { RequestList, RequestsState } from '@/domain/requests/interfaces/RequestInterfaces';
import { toPatientRequest } from '@/domain/requests/requestMapper';
import {
  acceptRequestAction,
  declineRequestAction,
  fetchRequestCountsAction,
  fetchRequestsAction,
} from '@/domain/requests/store/async-actions/RequestAsyncActions';
import { REQUESTS_REDUCER } from '@/store/constants/StoreConstants';

const emptyList = (): RequestList => ({
  ids: [],
  page: 0,
  hasMore: false,
  loading: false,
  loaded: false,
  error: null,
});

const initialState: RequestsState = {
  byId: {},
  lists: { waiting: emptyList(), accepted: emptyList(), declined: emptyList() },
  counts: { waiting: 0, accepted: 0, declined: 0, withdrawn: 0 },
};

const RequestsReducer = createSlice({
  name: REQUESTS_REDUCER,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequestsAction.pending, (state, action) => {
        const list = state.lists[action.meta.arg.status];
        list.loading = true;
        list.error = null;
      })
      .addCase(fetchRequestsAction.fulfilled, (state, action) => {
        const { status, page } = action.meta.arg;
        const list = state.lists[status];
        list.loading = false;
        if ('error' in action.payload) {
          list.error = action.payload.error;
          return;
        }
        const results = action.payload.data.results ?? [];
        results.forEach((api) => (state.byId[api.id] = toPatientRequest(api)));
        const ids = results.map((api) => api.id);
        list.ids = page === 1 ? ids : [...list.ids, ...ids.filter((id) => !list.ids.includes(id))];
        list.page = page;
        list.hasMore = action.payload.data.next !== null;
        list.loaded = true;
        if (status === 'waiting' && page === 1) state.counts.waiting = action.payload.data.count;
      })
      .addCase(fetchRequestsAction.rejected, (state, action) => {
        if (action.meta.condition) return;
        const list = state.lists[action.meta.arg.status];
        list.loading = false;
        list.error = 'Couldn’t load requests. Try again.';
      })
      .addCase(fetchRequestCountsAction.fulfilled, (state, action) => {
        if ('error' in action.payload) return;
        const { pending, accepted, declined, withdrawn } = action.payload.data;
        state.counts = { waiting: pending, accepted, declined, withdrawn };
      })
      .addMatcher(isFulfilled(acceptRequestAction, declineRequestAction), (state, action) => {
        if ('error' in action.payload) return;
        const request = toPatientRequest(action.payload.data);
        const previous = state.byId[request.id]?.status;
        state.byId[request.id] = request;
        if (previous === request.status) return;
        if (previous && previous !== 'withdrawn') {
          const from = state.lists[previous];
          from.ids = from.ids.filter((id) => id !== request.id);
          state.counts[previous] = Math.max(0, state.counts[previous] - 1);
        }
        if (request.status !== 'withdrawn') {
          const to = state.lists[request.status];
          if (to.loaded && !to.ids.includes(request.id)) to.ids.unshift(request.id);
        }
        state.counts[request.status] += 1;
      });
  },
});

export default RequestsReducer.reducer;

import { createSlice } from '@reduxjs/toolkit';

import type { LogsState } from '@/domain/logs/interfaces/LogInterfaces';
import { toActivityEntry, toVisitLogEntry, toVisitLogSummary } from '@/domain/logs/logMapper';
import {
  fetchActivityAction,
  fetchVisitLogAction,
} from '@/domain/logs/store/async-actions/LogAsyncActions';
import { LOGS_REDUCER } from '@/store/constants/StoreConstants';

const initialState: LogsState = {
  activity: {
    filter: 'all',
    entries: [],
    total: 0,
    page: 0,
    hasMore: false,
    requestId: null,
    loading: false,
    loaded: false,
    error: null,
  },
  visitLog: {
    range: 14,
    entries: [],
    summary: null,
    dateFrom: null,
    dateTo: null,
    requestId: null,
    loading: false,
    loaded: false,
    error: null,
  },
};

const LogsReducer = createSlice({
  name: LOGS_REDUCER,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivityAction.pending, (state, action) => {
        const activity = state.activity;
        const { filter } = action.meta.arg;
        if (filter !== activity.filter) {
          activity.filter = filter;
          activity.entries = [];
          activity.total = 0;
          activity.page = 0;
          activity.hasMore = false;
          activity.loaded = false;
        }
        activity.requestId = action.meta.requestId;
        activity.loading = true;
        activity.error = null;
      })
      .addCase(fetchActivityAction.fulfilled, (state, action) => {
        const activity = state.activity;
        if (action.meta.requestId !== activity.requestId) return;
        activity.requestId = null;
        activity.loading = false;
        if ('error' in action.payload) {
          activity.error = action.payload.error;
          return;
        }
        const { page } = action.meta.arg;
        const { results, next, count } = action.payload.data;
        const entries = results.map(toActivityEntry);
        if (page === 1) {
          activity.entries = entries;
        } else {
          const known = new Set(activity.entries.map((entry) => entry.id));
          activity.entries.push(...entries.filter((entry) => !known.has(entry.id)));
        }
        activity.total = count;
        activity.page = page;
        activity.hasMore = next !== null;
        activity.loaded = true;
      })
      .addCase(fetchActivityAction.rejected, (state, action) => {
        const activity = state.activity;
        if (action.meta.requestId !== activity.requestId) return;
        activity.requestId = null;
        activity.loading = false;
        activity.error = 'Couldn’t load your activity. Try again.';
      })
      .addCase(fetchVisitLogAction.pending, (state, action) => {
        const visitLog = state.visitLog;
        const { range } = action.meta.arg;
        if (range !== visitLog.range) {
          visitLog.range = range;
          visitLog.entries = [];
          visitLog.summary = null;
          visitLog.loaded = false;
        }
        visitLog.requestId = action.meta.requestId;
        visitLog.loading = true;
        visitLog.error = null;
      })
      .addCase(fetchVisitLogAction.fulfilled, (state, action) => {
        const visitLog = state.visitLog;
        if (action.meta.requestId !== visitLog.requestId) return;
        visitLog.requestId = null;
        visitLog.loading = false;
        if ('error' in action.payload) {
          visitLog.error = action.payload.error;
          return;
        }
        const data = action.payload.data;
        visitLog.entries = data.results.map(toVisitLogEntry);
        visitLog.summary = toVisitLogSummary(data.summary);
        visitLog.dateFrom = data.date_from;
        visitLog.dateTo = data.date_to;
        visitLog.loaded = true;
      })
      .addCase(fetchVisitLogAction.rejected, (state, action) => {
        const visitLog = state.visitLog;
        if (action.meta.requestId !== visitLog.requestId) return;
        visitLog.requestId = null;
        visitLog.loading = false;
        visitLog.error = 'Couldn’t load your visit log. Try again.';
      });
  },
});

export default LogsReducer.reducer;

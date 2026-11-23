import { createSelector } from '@reduxjs/toolkit';
import { useCallback, useEffect } from 'react';

import type {
  PatientRequest,
  PatientRequestStatus,
} from '@/domain/requests/interfaces/RequestInterfaces';
import {
  fetchRequestCountsAction,
  fetchRequestsAction,
} from '@/domain/requests/store/async-actions/RequestAsyncActions';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/storeConfig';

const selectList = createSelector(
  [
    (state: RootState) => state.requests.byId,
    (state: RootState, status: PatientRequestStatus) => state.requests.lists[status].ids,
  ],
  (byId, ids): PatientRequest[] => ids.map((id) => byId[id]).filter(Boolean)
);

export function usePatientRequests(status: PatientRequestStatus) {
  const dispatch = useAppDispatch();
  const requests = useAppSelector((state) => selectList(state, status));
  const list = useAppSelector((state) => state.requests.lists[status]);

  const refresh = useCallback(() => {
    void dispatch(fetchRequestsAction({ status, page: 1 }));
    void dispatch(fetchRequestCountsAction());
  }, [dispatch, status]);

  useEffect(() => {
    if (!list.loaded) void dispatch(fetchRequestsAction({ status, page: 1 }));
  }, [dispatch, list.loaded, status]);

  return {
    requests,
    loading: list.loading,
    error: list.error,
    refresh,
    loadMore: () => {
      if (list.hasMore && !list.loading && !list.error) {
        void dispatch(fetchRequestsAction({ status, page: list.page + 1 }));
      }
    },
  };
}

export function useRequestCount(status: PatientRequestStatus): number {
  return useAppSelector((state) => state.requests.counts[status]);
}

export function useRequestCountsLoader() {
  const dispatch = useAppDispatch();
  return useCallback(() => {
    void dispatch(fetchRequestCountsAction());
  }, [dispatch]);
}

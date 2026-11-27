import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import type { ActivityFilter, VisitLogRange } from '@/domain/logs/interfaces/LogInterfaces';
import {
  fetchActivityAction,
  fetchVisitLogAction,
} from '@/domain/logs/store/async-actions/LogAsyncActions';
import { useAppDispatch, useAppSelector, useAppStore } from '@/store/hooks';

export function useActivityLog() {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const activity = useAppSelector((state) => state.logs.activity);
  const { filter, page, hasMore, loading, error } = activity;

  const setFilter = useCallback(
    (next: ActivityFilter) => void dispatch(fetchActivityAction({ filter: next, page: 1 })),
    [dispatch]
  );
  const refresh = useCallback(
    () => setFilter(store.getState().logs.activity.filter),
    [setFilter, store]
  );

  useFocusEffect(refresh);

  const loadMore = () => {
    if (hasMore && !loading && !error) {
      void dispatch(fetchActivityAction({ filter, page: page + 1 }));
    }
  };

  return { ...activity, setFilter, refresh, loadMore };
}

export function useVisitLog() {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const visitLog = useAppSelector((state) => state.logs.visitLog);

  const setRange = useCallback(
    (next: VisitLogRange) => void dispatch(fetchVisitLogAction({ range: next })),
    [dispatch]
  );
  const refresh = useCallback(
    () => setRange(store.getState().logs.visitLog.range),
    [setRange, store]
  );

  useFocusEffect(refresh);

  return { ...visitLog, setRange, refresh };
}

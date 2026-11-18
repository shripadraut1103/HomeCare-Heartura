import { useCallback, useEffect } from 'react';

import { EnvConfig } from '@/config/EnvConfig';
import { isSameDay } from '@/domain/schedule/calendar';
import type { Visit } from '@/domain/visits/interfaces/VisitInterfaces';
import { fetchVisitsAction } from '@/domain/visits/store/async-actions/VisitAsyncActions';
import type { DateRange } from '@/domain/visits/store/services/VisitServices';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const byStart = (a: Visit, b: Visit) => a.startsAt.localeCompare(b.startsAt);

export function useAllVisits() {
  return useAppSelector((state) => state.visits.items);
}

export function visitsOn(visits: readonly Visit[], day: Date) {
  return visits.filter((visit) => isSameDay(new Date(visit.startsAt), day)).sort(byStart);
}

export function useTodaysVisits() {
  return visitsOn(useAllVisits(), new Date());
}

export function useVisit(visitId: string | undefined) {
  return useAppSelector((state) =>
    visitId ? state.visits.items.find((visit) => visit.id === visitId) : undefined
  );
}

export function useVisitsLoader(range: DateRange) {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.visits.loading);
  const error = useAppSelector((state) => state.visits.error);
  const { from, to } = range;

  const load = useCallback(() => {
    if (EnvConfig.apiUrl) void dispatch(fetchVisitsAction({ from, to }));
  }, [dispatch, from, to]);

  useEffect(load, [load]);

  return { loading, error, retry: load };
}

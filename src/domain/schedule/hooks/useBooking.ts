import { useCallback, useEffect, useState } from 'react';

import type {
  ApiBookablePatient,
  ApiBookingCheckRequest,
  ApiBookingCheckResult,
  ApiPatientOption,
} from '@/domain/schedule/interfaces/BookingApi';
import { fetchSchedulingReferenceAction } from '@/domain/visits/store/async-actions/VisitAsyncActions';
import VisitService from '@/domain/visits/store/services/VisitServices';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const SEARCH_DELAY_MS = 300;
const CHECK_DELAY_MS = 400;
const NOT_BOOKABLE = 'You can’t book visits for this patient.';

type Keyed<T> = { key: string; value: T | null; error: string | null };

export function useSchedulingReference() {
  const dispatch = useAppDispatch();
  const reference = useAppSelector((state) => state.visits.reference);
  const loading = useAppSelector((state) => state.visits.referenceLoading);
  const error = useAppSelector((state) => state.visits.referenceError);

  const load = useCallback(() => {
    void dispatch(fetchSchedulingReferenceAction());
  }, [dispatch]);

  useEffect(() => {
    if (!reference) load();
  }, [reference, load]);

  return { reference, loading: loading || (!reference && !error), error, retry: load };
}

export function usePatientSearch(query: string, enabled: boolean) {
  const key = query.trim();
  const [state, setState] = useState<Keyed<ApiPatientOption[]> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    const timer = setTimeout(async () => {
      const result = await VisitService.searchPatients(key);
      if (!active) return;
      setState(
        'error' in result
          ? { key, value: null, error: result.error }
          : { key, value: result.data.results, error: null }
      );
    }, SEARCH_DELAY_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [key, enabled]);

  const current = state?.key === key ? state : null;
  return {
    results: current?.value ?? state?.value ?? [],
    searching: enabled && !current,
    error: current?.error ?? null,
  };
}

export function useBookingPlan(patientId: string | null) {
  const [state, setState] = useState<Keyed<ApiBookablePatient> | null>(null);

  useEffect(() => {
    if (!patientId) return;
    let active = true;
    void VisitService.getBookingPlan(patientId).then((result) => {
      if (!active) return;
      setState(
        'error' in result
          ? {
              key: patientId,
              value: null,
              error: result.status === 404 ? NOT_BOOKABLE : result.error,
            }
          : { key: patientId, value: result.data, error: null }
      );
    });
    return () => {
      active = false;
    };
  }, [patientId]);

  const current = patientId && state?.key === patientId ? state : null;
  return {
    plan: current?.value ?? null,
    loading: Boolean(patientId) && !current,
    error: current?.error ?? null,
  };
}

export function useBookingCheck(request: ApiBookingCheckRequest | null) {
  const key = request ? JSON.stringify(request) : '';
  const [state, setState] = useState<Keyed<ApiBookingCheckResult> | null>(null);

  useEffect(() => {
    if (!key) return;
    let active = true;
    const timer = setTimeout(async () => {
      const result = await VisitService.checkBooking(JSON.parse(key) as ApiBookingCheckRequest);
      if (!active) return;
      setState(
        'error' in result
          ? { key, value: null, error: result.error }
          : { key, value: result.data, error: null }
      );
    }, CHECK_DELAY_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [key]);

  const current = key && state?.key === key ? state : null;
  return {
    key,
    result: current?.value ?? null,
    checking: Boolean(key) && !current,
    error: current?.error ?? null,
  };
}

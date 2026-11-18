import { createSelector } from '@reduxjs/toolkit';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { EnvConfig } from '@/config/EnvConfig';
import type { Patient, PatientChart } from '@/domain/patients/interfaces/PatientInterfaces';
import { MOCK_PATIENTS } from '@/domain/patients/mocks/PatientMocks';
import { toApiStatus } from '@/domain/patients/patientMapper';
import type { StatusFilter } from '@/domain/patients/patientList';
import {
  fetchPatientAction,
  fetchPatientsAction,
} from '@/domain/patients/store/async-actions/PatientAsyncActions';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/storeConfig';

const SEARCH_DELAY_MS = 350;
const apiMode = () => Boolean(EnvConfig.apiUrl);

const selectAllPatients = createSelector(
  (state: RootState) => state.patients.byId,
  (byId): readonly Patient[] => Object.values(byId)
);

const selectListPatients = createSelector(
  (state: RootState) => state.patients.byId,
  (state: RootState) => state.patients.list.ids,
  (byId, ids): readonly Patient[] => ids.flatMap((id) => (byId[id] ? [byId[id]] : []))
);

export function usePatients(): readonly Patient[] {
  const loaded = useAppSelector(selectAllPatients);
  return apiMode() ? loaded : MOCK_PATIENTS;
}

export function usePatient(patientId: string | null | undefined) {
  const loaded = useAppSelector((state) =>
    patientId ? state.patients.byId[patientId] : undefined
  );
  return apiMode() ? loaded : MOCK_PATIENTS.find((patient) => patient.id === patientId);
}

export function usePatientChart(patientId: string | null | undefined): PatientChart | undefined {
  return useAppSelector((state) => (patientId ? state.patients.charts[patientId] : undefined));
}

export function useRoutePatient() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return { patient: usePatient(id), chart: usePatientChart(id) };
}

function useDebounced<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/** API mode: one server page at a time, searched and filtered by the backend. */
export function usePatientList(query: string, status: StatusFilter) {
  const dispatch = useAppDispatch();
  const patients = useAppSelector(selectListPatients);
  const { count, page, hasMore, loading, error } = useAppSelector((state) => state.patients.list);
  const search = useDebounced(query.trim(), SEARCH_DELAY_MS);
  const apiStatus = toApiStatus(status);

  const load = useCallback(
    (nextPage: number) => {
      if (apiMode())
        void dispatch(fetchPatientsAction({ search, status: apiStatus, page: nextPage }));
    },
    [dispatch, search, apiStatus]
  );

  useEffect(() => load(1), [load]);

  return {
    patients,
    count,
    loading,
    error,
    refresh: () => load(1),
    loadMore: () => {
      if (hasMore && !loading && !error) load(page + 1);
    },
  };
}

export function usePatientLoader(patientId: string | undefined) {
  const dispatch = useAppDispatch();
  const error = useAppSelector((state) => state.patients.detailError);

  const load = useCallback(() => {
    if (apiMode() && patientId) void dispatch(fetchPatientAction(patientId));
  }, [dispatch, patientId]);

  useEffect(load, [load]);

  return { error, retry: load };
}

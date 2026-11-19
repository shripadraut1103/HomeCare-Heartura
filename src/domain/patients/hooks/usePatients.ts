import { createSelector } from '@reduxjs/toolkit';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { EnvConfig } from '@/config/EnvConfig';
import type {
  HistoryCategory,
  Patient,
  PatientChart,
  PatientResource,
} from '@/domain/patients/interfaces/PatientInterfaces';
import { toApiStatus } from '@/domain/patients/patientMapper';
import type { StatusFilter } from '@/domain/patients/patientList';
import {
  fetchAllergiesAction,
  fetchAppointmentsAction,
  fetchCoveragesAction,
  fetchDiagnosesAction,
  fetchDocumentsAction,
  fetchHistoryAction,
  fetchIncidentsAction,
  fetchNotesAction,
  fetchPatientAction,
  fetchPatientChartAction,
  fetchPatientsAction,
} from '@/domain/patients/store/async-actions/PatientAsyncActions';
import { refreshPatient } from '@/domain/patients/store/PatientsReducer';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { AppDispatch, RootState } from '@/store/storeConfig';

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
  return useAppSelector(selectAllPatients);
}

export function usePatient(patientId: string | null | undefined) {
  return useAppSelector((state) => (patientId ? state.patients.byId[patientId] : undefined));
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

function loadResource(dispatch: AppDispatch, patientId: string, resource: PatientResource) {
  const arg = { patientId };
  switch (resource) {
    case 'chart':
      return void dispatch(fetchPatientChartAction(arg));
    case 'diagnoses':
      return void dispatch(fetchDiagnosesAction(arg));
    case 'allergies':
      return void dispatch(fetchAllergiesAction(arg));
    case 'notes':
      return void dispatch(fetchNotesAction(arg));
    case 'incidents':
      return void dispatch(fetchIncidentsAction(arg));
    case 'coverages':
      return void dispatch(fetchCoveragesAction(arg));
    case 'documents':
      return void dispatch(fetchDocumentsAction(arg));
    case 'appointments':
      return void dispatch(fetchAppointmentsAction(arg));
    default:
      return void dispatch(
        fetchHistoryAction({ patientId, kind: resource.split(':')[1] as HistoryCategory })
      );
  }
}

export function usePatientResource(
  patientId: string | undefined,
  resource: PatientResource,
  enabled = true
) {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) =>
    patientId ? state.patients.resources[patientId]?.[resource] : undefined
  );
  const needsLoad = status === undefined || (status.stale === true && !status.loading);

  const load = useCallback(() => {
    if (apiMode() && patientId) loadResource(dispatch, patientId, resource);
  }, [dispatch, patientId, resource]);

  useEffect(() => {
    if (enabled && needsLoad) load();
  }, [enabled, needsLoad, load]);

  return {
    loading: status?.loading ?? (enabled && apiMode()),
    loaded: status?.loaded ?? false,
    error: status?.error ?? null,
    retry: load,
  };
}

export function usePatientLoader(patientId: string | undefined) {
  const dispatch = useAppDispatch();
  const error = useAppSelector((state) => state.patients.detailError);
  const known = useAppSelector((state) =>
    patientId ? Boolean(state.patients.byId[patientId]) : false
  );
  const chart = usePatientResource(patientId, 'chart');

  const loadPatient = useCallback(() => {
    if (apiMode() && patientId) void dispatch(fetchPatientAction(patientId));
  }, [dispatch, patientId]);

  useEffect(() => {
    if (!known) loadPatient();
  }, [known, loadPatient]);

  useEffect(() => {
    if (patientId) dispatch(refreshPatient(patientId));
  }, [dispatch, patientId]);

  return {
    error,
    retry: () => {
      loadPatient();
      chart.retry();
    },
  };
}

import type { ApiIncidentCreate, ApiIncidentUpdate } from '@/domain/patients/interfaces/PatientApi';
import type { PatientIncident } from '@/domain/patients/interfaces/PatientInterfaces';
import { toIncident, toIncidentRequest } from '@/domain/patients/patientChartMapper';
import {
  createIncidentAction,
  fetchIncidentsAction,
  updateIncidentAction,
} from '@/domain/patients/store/async-actions/PatientAsyncActions';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { haptics } from '@/utils/haptics';

export type IncidentDraft = Omit<ApiIncidentCreate, 'occurred_on' | 'occurred_time'>;

const FAILED = 'Couldn’t save the incident. Try again.';

export function useIncidentActions(patientId: string | undefined) {
  const dispatch = useAppDispatch();
  const incidents = useAppSelector((state) =>
    patientId ? state.patients.charts[patientId]?.incidents : undefined
  );

  const fail = (message?: string) => {
    haptics.error();
    dispatch(setToastMessage({ message: message || FAILED, type: 'error' }));
  };

  const report = async (
    occurredAt: Date,
    draft: IncidentDraft
  ): Promise<PatientIncident | null> => {
    if (!patientId) {
      fail();
      return null;
    }
    const result = await dispatch(
      createIncidentAction({ patientId, body: toIncidentRequest(occurredAt, draft) })
    );
    const payload = createIncidentAction.fulfilled.match(result) ? result.payload : null;
    if (!payload || 'error' in payload) {
      fail(payload?.error);
      return null;
    }
    haptics.success();
    return toIncident(payload.data);
  };

  const update = async (
    incident: PatientIncident,
    body: Omit<ApiIncidentUpdate, 'version'>
  ): Promise<boolean> => {
    const version = incidents?.find((item) => item.id === incident.id)?.version ?? incident.version;
    if (!patientId || version === undefined) {
      fail();
      return false;
    }
    const result = await dispatch(
      updateIncidentAction({ patientId, incidentId: incident.id, body: { ...body, version } })
    );
    const payload = updateIncidentAction.fulfilled.match(result) ? result.payload : null;
    if (!payload || 'error' in payload) {
      if (payload?.code === 'EDIT_CONFLICT') void dispatch(fetchIncidentsAction({ patientId }));
      fail(payload?.error);
      return false;
    }
    haptics.success();
    return true;
  };

  return { report, update };
}

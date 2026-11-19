import { createAsyncThunk } from '@reduxjs/toolkit';

import type {
  ApiAppointmentCreate,
  ApiAppointmentReschedule,
  ApiAppointmentUpdate,
  ApiSchedulingReference,
} from '@/domain/schedule/interfaces/BookingApi';
import type { ApiAppointment } from '@/domain/visits/interfaces/AppointmentApi';
import VisitService, {
  type ApiVisitStatusChange,
  type DateRange,
} from '@/domain/visits/store/services/VisitServices';
import { VISITS_REDUCER } from '@/store/constants/StoreConstants';
import type { RootState } from '@/store/storeConfig';
import type { ServiceResult } from '@/types/ServiceInterfaces';

export const fetchVisitsAction = createAsyncThunk<
  ServiceResult<ApiAppointment[]>,
  DateRange,
  { state: RootState }
>(VISITS_REDUCER + '/fetchVisits', async (range) => VisitService.getAppointments(range));

export const fetchVisitAction = createAsyncThunk<
  ServiceResult<ApiAppointment>,
  { visitId: string },
  { state: RootState }
>(VISITS_REDUCER + '/fetchVisit', async ({ visitId }) => VisitService.getAppointment(visitId));

export const changeVisitStatusAction = createAsyncThunk<
  ServiceResult<ApiAppointment>,
  { visitId: string } & ApiVisitStatusChange,
  { state: RootState }
>(VISITS_REDUCER + '/changeVisitStatus', async ({ visitId, ...body }) =>
  VisitService.changeStatus(visitId, body)
);

export const fetchSchedulingReferenceAction = createAsyncThunk<
  ServiceResult<ApiSchedulingReference>,
  void,
  { state: RootState }
>(VISITS_REDUCER + '/fetchSchedulingReference', async () => VisitService.getReference(), {
  condition: (_, { getState }) => {
    const { reference, referenceLoading } = getState().visits;
    return !reference && !referenceLoading;
  },
});

export const createAppointmentsAction = createAsyncThunk<
  ServiceResult<ApiAppointment[]>,
  ApiAppointmentCreate,
  { state: RootState }
>(VISITS_REDUCER + '/createAppointments', async (body) => VisitService.createAppointments(body));

export const updateAppointmentAction = createAsyncThunk<
  ServiceResult<ApiAppointment>,
  { visitId: string; body: ApiAppointmentUpdate },
  { state: RootState }
>(VISITS_REDUCER + '/updateAppointment', async ({ visitId, body }) =>
  VisitService.updateAppointment(visitId, body)
);

export const rescheduleVisitAction = createAsyncThunk<
  ServiceResult<ApiAppointment>,
  { visitId: string; body: ApiAppointmentReschedule },
  { state: RootState }
>(VISITS_REDUCER + '/rescheduleVisit', async ({ visitId, body }) =>
  VisitService.rescheduleAppointment(visitId, body)
);

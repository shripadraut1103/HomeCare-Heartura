import { createAsyncThunk } from '@reduxjs/toolkit';

import type { ApiAppointment } from '@/domain/visits/interfaces/AppointmentApi';
import VisitService, { type DateRange } from '@/domain/visits/store/services/VisitServices';
import { VISITS_REDUCER } from '@/store/constants/StoreConstants';
import type { RootState } from '@/store/storeConfig';
import type { ServiceResult } from '@/types/ServiceInterfaces';

export const fetchVisitsAction = createAsyncThunk<
  ServiceResult<ApiAppointment[]>,
  DateRange,
  { state: RootState }
>(VISITS_REDUCER + '/fetchVisits', async (range) => VisitService.getAppointments(range));

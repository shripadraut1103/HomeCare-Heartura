import { createAsyncThunk } from '@reduxjs/toolkit';

import type { ApiActivity, ApiVisitLog } from '@/domain/logs/interfaces/LogApi';
import type { ActivityFilter, VisitLogRange } from '@/domain/logs/interfaces/LogInterfaces';
import { visitLogDates } from '@/domain/logs/logMapper';
import LogService from '@/domain/logs/store/services/LogServices';
import type { ApiPage } from '@/domain/patients/interfaces/PatientApi';
import { LOGS_REDUCER } from '@/store/constants/StoreConstants';
import type { RootState } from '@/store/storeConfig';
import type { ServiceResult } from '@/types/ServiceInterfaces';

export const fetchActivityAction = createAsyncThunk<
  ServiceResult<ApiPage<ApiActivity>>,
  { filter: ActivityFilter; page: number },
  { state: RootState }
>(LOGS_REDUCER + '/fetchActivity', async ({ filter, page }) =>
  LogService.getActivity({ page, ...(filter === 'all' ? {} : { kind: filter }) })
);

export const fetchVisitLogAction = createAsyncThunk<
  ServiceResult<ApiVisitLog>,
  { range: VisitLogRange },
  { state: RootState }
>(LOGS_REDUCER + '/fetchVisitLog', async ({ range }) => {
  const { date_from, date_to } = visitLogDates(range);
  return LogService.getVisitLog(date_from, date_to);
});

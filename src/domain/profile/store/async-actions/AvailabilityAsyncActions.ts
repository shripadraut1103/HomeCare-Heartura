import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import { serviceError } from '@/config/ApiError';
import type { ApiPage } from '@/domain/patients/interfaces/PatientApi';
import { toApiRange, toBlockDayWrite } from '@/domain/profile/availabilityMapper';
import type { ApiBlockDay, ApiWeeklyHours } from '@/domain/profile/interfaces/AvailabilityApi';
import type { AvailabilityRange, BlockedDay } from '@/domain/profile/interfaces/ProfileInterfaces';
import AvailabilityService from '@/domain/profile/store/services/AvailabilityServices';
import { AVAILABILITY_REDUCER, BLOCK_DAYS_REDUCER } from '@/store/constants/StoreConstants';
import type { RootState } from '@/store/storeConfig';
import type { ServiceResult } from '@/types/ServiceInterfaces';
import { toIsoDate } from '@/utils/dateFormat';

type WithProvider<T> = ServiceResult<T> & { providerId?: string };

export type BlockDayDraft = Omit<BlockedDay, 'id' | 'version'>;

const NO_PROVIDER = 'We couldn’t find your provider record. Please contact the office.';

async function resolveProviderId(state: RootState): Promise<ServiceResult<string>> {
  if (state.availability.providerId) return { data: state.availability.providerId };
  const memberId = state.auth.me?.member?.id;
  const result = await AvailabilityService.getProviders();
  if ('error' in result) return memberId ? { data: memberId } : result;
  const providers = result.data.results;
  const own =
    providers.find((provider) => provider.id === memberId) ??
    (providers.length === 1 ? providers[0] : undefined);
  if (own) return { data: own.id };
  return memberId ? { data: memberId } : serviceError('NOT_FOUND', NO_PROVIDER);
}

async function withProvider<T>(
  state: RootState,
  request: (providerId: string) => Promise<ServiceResult<T>>
): Promise<WithProvider<T>> {
  const provider = await resolveProviderId(state);
  if ('error' in provider) return provider;
  return { ...(await request(provider.data)), providerId: provider.data };
}

export const fetchWeeklyHoursAction = createAsyncThunk<
  WithProvider<ApiWeeklyHours>,
  void,
  { state: RootState }
>(
  AVAILABILITY_REDUCER + '/fetchWeeklyHours',
  async (_, { getState }) =>
    withProvider(getState(), (providerId) => AvailabilityService.getWeeklyHours(providerId)),
  { condition: (_, { getState }) => !getState().availability.loading }
);

export const saveWeeklyHoursAction = createAsyncThunk<
  WithProvider<ApiWeeklyHours>,
  AvailabilityRange[],
  { state: RootState }
>(AVAILABILITY_REDUCER + '/saveWeeklyHours', async (ranges, { getState }) => {
  const { version } = getState().availability;
  if (version === null)
    return serviceError('EDIT_CONFLICT', 'Reload your availability and try again.');
  return withProvider(getState(), (providerId) =>
    AvailabilityService.saveWeeklyHours(providerId, { version, ranges: ranges.map(toApiRange) })
  );
});

export const fetchBlockDaysAction = createAsyncThunk<
  WithProvider<ApiPage<ApiBlockDay>>,
  void,
  { state: RootState }
>(
  BLOCK_DAYS_REDUCER + '/fetch',
  async (_, { getState }) =>
    withProvider(getState(), (providerId) =>
      AvailabilityService.getBlockDays(providerId, toIsoDate(new Date()))
    ),
  { condition: (_, { getState }) => !getState().blockDays.loading }
);

export const createBlockDayAction = createAsyncThunk<
  WithProvider<ApiBlockDay>,
  BlockDayDraft,
  { state: RootState }
>(BLOCK_DAYS_REDUCER + '/create', async (draft, { getState }) =>
  withProvider(getState(), (providerId) =>
    AvailabilityService.createBlockDay(toBlockDayWrite(providerId, draft))
  )
);

export const updateBlockDayAction = createAsyncThunk<
  WithProvider<ApiBlockDay>,
  { id: string; draft: BlockDayDraft },
  { state: RootState }
>(BLOCK_DAYS_REDUCER + '/update', async ({ id, draft }, { getState }) => {
  const current = getState().blockDays.blockedDays.find((block) => block.id === id);
  if (!current) return serviceError('NOT_FOUND', 'This block isn’t there any more.');
  return withProvider(getState(), (providerId) =>
    AvailabilityService.updateBlockDay(id, {
      ...toBlockDayWrite(providerId, draft),
      version: current.version,
    })
  );
});

export const deleteBlockDayAction = createAsyncThunk<
  ServiceResult<void>,
  BlockedDay,
  { state: RootState }
>(BLOCK_DAYS_REDUCER + '/delete', async (block) =>
  AvailabilityService.deleteBlockDay(block.id, block.version)
);

export const restoreBlockDayAction = createAsyncThunk<
  ServiceResult<void>,
  { id: string },
  { state: RootState }
>(BLOCK_DAYS_REDUCER + '/restore', async ({ id }, { dispatch }) => {
  const result = await AvailabilityService.restoreBlockDay(id);
  if (!('error' in result)) void dispatch(fetchBlockDaysAction());
  return result;
});

export const undoBlockDayRemoval = createAction<{ id: string }>(BLOCK_DAYS_REDUCER + '/undoRemove');

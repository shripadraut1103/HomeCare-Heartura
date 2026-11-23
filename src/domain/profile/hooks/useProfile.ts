import { useCallback, useEffect, useState } from 'react';

import type {
  AvailabilityRange,
  BlockedDay,
  PreferencesState,
  ProviderProfile,
  SettingsSummary,
} from '@/domain/profile/interfaces/ProfileInterfaces';
import { MOCK_SETTINGS_SUMMARY } from '@/domain/profile/mocks/ProfileMocks';
import { fetchProfileAction } from '@/domain/profile/store/async-actions/ProfileAsyncActions';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export function useProfile(): ProviderProfile {
  return useAppSelector((state) => state.profile.profile);
}

export function useProfileLoader() {
  const dispatch = useAppDispatch();
  const loaded = useAppSelector((state) => state.profile.loaded);
  const loading = useAppSelector((state) => state.profile.loading);
  const error = useAppSelector((state) => state.profile.error);

  const reload = useCallback(() => {
    void dispatch(fetchProfileAction());
  }, [dispatch]);

  useEffect(() => {
    if (!loaded) reload();
  }, [loaded, reload]);

  return { loaded, loading, error, reload };
}

export function useSettingsSummary(): SettingsSummary {
  const [summary] = useState(MOCK_SETTINGS_SUMMARY);
  return summary;
}

export function useBlockedDays(): BlockedDay[] {
  return useAppSelector((state) => state.blockDays.blockedDays);
}

export function usePreferences(): PreferencesState {
  return useAppSelector((state) => state.preferences);
}

export function useAvailabilityRanges(): AvailabilityRange[] {
  return useAppSelector((state) => state.availability.ranges);
}

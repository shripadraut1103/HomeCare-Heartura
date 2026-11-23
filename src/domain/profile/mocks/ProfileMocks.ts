import type { SettingsSummary } from '@/domain/profile/interfaces/ProfileInterfaces';

/**
 * TEMPORARY: provider profile and settings until the API exists.
 * Delete this file once the profile slice and `useSettingsSummary` read from the service.
 */

export const MOCK_SETTINGS_SUMMARY: SettingsSummary = {
  notifications: { enabled: 5, total: 5 },
};

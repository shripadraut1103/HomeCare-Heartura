import { router } from 'expo-router';

import { countAvailableDays, getCurrentRange } from '@/domain/profile/availability';
import { AppVersionNote } from '@/domain/profile/components/AppVersionNote';
import { MenuRow } from '@/domain/profile/components/MenuRow';
import { ProfileCard } from '@/domain/profile/components/ProfileCard';
import { SettingsScreenLayout } from '@/domain/profile/components/SettingsScreenLayout';
import {
  useAvailabilityRanges,
  useBlockedDays,
  usePreferences,
  useSettingsSummary,
} from '@/domain/profile/hooks/useProfile';
import type { AppearancePreference } from '@/domain/profile/interfaces/ProfileInterfaces';

const APPEARANCE_LABELS: Record<AppearancePreference, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

export default function SettingsScreen() {
  const summary = useSettingsSummary();
  const blockedDays = useBlockedDays();
  const preferences = usePreferences();
  const ranges = useAvailabilityRanges();
  const currentRange = getCurrentRange(ranges);

  return (
    <SettingsScreenLayout title="Settings">
      <ProfileCard>
        <MenuRow
          icon={{ ios: 'clock', android: 'schedule' }}
          tone="blue"
          title="Availability"
          subtitle={
            currentRange
              ? `${plural(ranges.length, 'date range')} · ${plural(countAvailableDays(currentRange), 'day')} a week`
              : 'Not set'
          }
          onPress={() => router.push('/profile/availability')}
        />
        <MenuRow
          icon={{ ios: 'xmark.circle', android: 'cancel' }}
          tone="amber"
          title="Block days"
          subtitle={plural(blockedDays.length, 'blocked day')}
          onPress={() => router.push('/profile/block-days')}
        />
        <MenuRow
          icon={{ ios: 'bell', android: 'notifications' }}
          tone="teal"
          title="Notifications"
          subtitle={`${summary.notifications.enabled} of ${summary.notifications.total} on`}
          onPress={() => router.push('/profile/notifications')}
        />
        <MenuRow
          icon={{ ios: 'sun.max', android: 'light_mode' }}
          tone="purple"
          title="Appearance"
          subtitle={APPEARANCE_LABELS[preferences.appearance]}
          onPress={() => router.push('/profile/appearance')}
        />
        <MenuRow
          icon={{ ios: 'gearshape', android: 'settings' }}
          tone="rose"
          title="More"
          subtitle={`Face ID / fingerprint ${preferences.biometricUnlock ? 'on' : 'off'}`}
          onPress={() => router.push('/profile/more')}
        />
      </ProfileCard>
      <AppVersionNote />
    </SettingsScreenLayout>
  );
}

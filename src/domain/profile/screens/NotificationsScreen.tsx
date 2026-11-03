import { useState } from 'react';

import { ProfileCard } from '@/domain/profile/components/ProfileCard';
import { SettingsScreenLayout } from '@/domain/profile/components/SettingsScreenLayout';
import { ToggleRow } from '@/domain/profile/components/ToggleRow';
import { useProfile } from '@/domain/profile/hooks/useProfile';

type NotificationSetting = 'visitReminders' | 'scheduleChanges' | 'coverage' | 'units' | 'sms';

export default function NotificationsScreen() {
  const { contact } = useProfile();
  // TEMPORARY: local only; not saved or sent anywhere until the notifications API exists.
  const [enabled, setEnabled] = useState<Record<NotificationSetting, boolean>>({
    visitReminders: true,
    scheduleChanges: true,
    coverage: true,
    units: true,
    sms: true,
  });

  const rows: readonly { id: NotificationSetting; title: string; subtitle: string }[] = [
    {
      id: 'visitReminders',
      title: 'Visit reminders',
      subtitle: '30 minutes before each appointment',
    },
    {
      id: 'scheduleChanges',
      title: 'Schedule changes',
      subtitle: 'When the office adds, moves or cancels a visit',
    },
    {
      id: 'coverage',
      title: 'Coverage requests',
      subtitle: 'New patients near you that need a provider',
    },
    {
      id: 'units',
      title: 'Units and authorizations',
      subtitle: 'Weekly allotment changes and authorizations ending',
    },
    { id: 'sms', title: 'Also by text message', subtitle: `To ${contact.phone}` },
  ];

  return (
    <SettingsScreenLayout title="Notifications">
      <ProfileCard padded>
        {rows.map((row, index) => (
          <ToggleRow
            key={row.id}
            title={row.title}
            subtitle={row.subtitle}
            value={enabled[row.id]}
            onValueChange={(value) => setEnabled((current) => ({ ...current, [row.id]: value }))}
            divider={index < rows.length - 1}
          />
        ))}
      </ProfileCard>
    </SettingsScreenLayout>
  );
}

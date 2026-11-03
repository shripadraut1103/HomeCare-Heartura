import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { SectionHeader } from '@/components/ui/SectionHeader';
import { Spacing } from '@/constants/Theme';
import { AppVersionNote } from '@/domain/profile/components/AppVersionNote';
import { MenuRow } from '@/domain/profile/components/MenuRow';
import { ProfileCard } from '@/domain/profile/components/ProfileCard';
import { SettingsScreenLayout } from '@/domain/profile/components/SettingsScreenLayout';
import { ToggleRow } from '@/domain/profile/components/ToggleRow';
import { useBiometricSetting } from '@/domain/profile/hooks/useBiometricSetting';
import { useProfile } from '@/domain/profile/hooks/useProfile';

export default function MoreSettingsScreen() {
  const profile = useProfile();
  const biometric = useBiometricSetting();

  return (
    <SettingsScreenLayout title="More">
      <View style={styles.section}>
        <SectionHeader title="Security" />
        <ProfileCard padded>
          <ToggleRow
            title="Face ID / fingerprint"
            subtitle="Unlock the app with Face ID or a fingerprint instead of the password"
            value={biometric.enabled}
            disabled={biometric.isChecking}
            onValueChange={(value) => void biometric.setEnabled(value)}
          />
        </ProfileCard>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Account" />
        <ProfileCard>
          <MenuRow
            icon={{ ios: 'person', android: 'person' }}
            tone="blue"
            title="Profile"
            subtitle={profile.name}
            onPress={() => router.navigate('/profile')}
          />
        </ProfileCard>
      </View>

      <AppVersionNote />
    </SettingsScreenLayout>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.three - Spacing.one,
  },
});

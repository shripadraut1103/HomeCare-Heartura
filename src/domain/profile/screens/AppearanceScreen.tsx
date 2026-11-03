import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { SegmentedControl, type Segment } from '@/components/ui/SegmentedControl';
import { Spacing } from '@/constants/Theme';
import { ProfileCard } from '@/domain/profile/components/ProfileCard';
import { SettingsScreenLayout } from '@/domain/profile/components/SettingsScreenLayout';
import { usePreferences } from '@/domain/profile/hooks/useProfile';
import type { AppearancePreference } from '@/domain/profile/interfaces/ProfileInterfaces';
import { setAppearance } from '@/domain/profile/store/PreferencesReducer';
import { useAppDispatch } from '@/store/hooks';

const THEMES: readonly Segment<AppearancePreference>[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function AppearanceScreen() {
  const dispatch = useAppDispatch();
  const { appearance } = usePreferences();

  return (
    <SettingsScreenLayout title="Appearance">
      <ProfileCard padded>
        <View style={styles.body}>
          <ThemedText themeColor="textSecondary" style={styles.label}>
            Theme
          </ThemedText>
          <SegmentedControl
            segments={THEMES}
            value={appearance}
            onChange={(value) => dispatch(setAppearance(value))}
          />
        </View>
      </ProfileCard>
    </SettingsScreenLayout>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 500,
  },
});

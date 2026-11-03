import Constants from 'expo-constants';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useProfile } from '@/domain/profile/hooks/useProfile';

const appVersion = (Constants.expoConfig?.version ?? '1.0').split('.').slice(0, 2).join('.');

export function AppVersionNote() {
  const { agency } = useProfile();

  return (
    <ThemedText themeColor="textSecondary" style={styles.note}>
      Heartura Provider {appVersion} · {agency.name}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  note: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
  },
});

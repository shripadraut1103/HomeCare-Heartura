import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useProfile } from '@/domain/profile/hooks/useProfile';
import { APP_VERSION } from '@/utils/appVersion';

export function AppVersionNote() {
  const { agency } = useProfile();

  return (
    <ThemedText themeColor="textSecondary" style={styles.note}>
      Heartura Provider {APP_VERSION} · {agency.name}
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

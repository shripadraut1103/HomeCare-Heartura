import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Radius, Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

export function EmptyState({ message = 'Nothing here yet.' }: { message?: string }) {
  const theme = useTheme();

  return (
    <View
      style={[styles.empty, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
      <ThemedText themeColor="textSecondary" style={styles.text}>
        {message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    padding: Spacing.three + Spacing.one,
    borderRadius: Radius.medium,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 400,
  },
});

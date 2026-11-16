import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Pill } from '@/components/ui/Pill';
import { Spacing, type ThemeColor } from '@/constants/Theme';

export const EMPTY_VALUE = '—';

export function StatusPill({
  pill,
}: {
  pill: { label: string; color: ThemeColor; background: ThemeColor };
}) {
  return <Pill label={pill.label} dot color={pill.color} backgroundColor={pill.background} />;
}

export function EmptyRow({ text }: { text: string }) {
  return (
    <ThemedText themeColor="textSecondary" style={styles.empty}>
      {text}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.four,
  },
});

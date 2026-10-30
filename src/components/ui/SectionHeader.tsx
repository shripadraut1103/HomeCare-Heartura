import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

const ACCENT_BAR_WIDTH = 4;

type SectionHeaderProps = {
  title: string;
  count?: number;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function SectionHeader({ title, count, actionLabel, onActionPress }: SectionHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <View style={[styles.accentBar, { backgroundColor: theme.primary }]} />
      <ThemedText accessibilityRole="header" style={styles.title}>
        {title}
      </ThemedText>
      {count === undefined ? null : <Pill label={count} style={styles.count} />}
      {actionLabel ? (
        <Button
          variant="link"
          title={actionLabel}
          color="accent"
          style={styles.action}
          onPress={onActionPress}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + Spacing.one,
  },
  accentBar: {
    width: ACCENT_BAR_WIDTH,
    alignSelf: 'stretch',
    borderRadius: ACCENT_BAR_WIDTH / 2,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: 700,
  },
  count: {
    alignSelf: 'center',
  },
  action: {
    marginLeft: 'auto',
  },
});

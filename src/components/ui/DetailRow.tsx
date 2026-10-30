import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

const LABEL_WIDTH = 100;

type DetailRowProps = {
  label: string;
  children: ReactNode;
  isLast?: boolean;
};

export function DetailRow({ label, children, isLast = false }: DetailRowProps) {
  const theme = useTheme();

  return (
    <View style={[styles.row, !isLast && [styles.divider, { borderBottomColor: theme.border }]]}>
      <ThemedText themeColor="textSecondary" style={styles.label}>
        {label}
      </ThemedText>
      <View style={styles.value}>
        {typeof children === 'string' ? (
          <ThemedText style={styles.valueText}>{children}</ThemedText>
        ) : (
          children
        )}
      </View>
    </View>
  );
}

export const detailValueTextStyle = {
  fontSize: 16,
  lineHeight: 24,
  fontWeight: 400,
} as const;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: {
    width: LABEL_WIDTH,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: 400,
  },
  value: {
    flex: 1,
    gap: Spacing.one,
  },
  valueText: detailValueTextStyle,
});

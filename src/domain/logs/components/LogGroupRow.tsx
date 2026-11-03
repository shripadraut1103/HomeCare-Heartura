import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

type LogGroupRowProps = {
  isFirst: boolean;
  isLast: boolean;
  children: ReactNode;
};

export function LogGroupRow({ isFirst, isLast, children }: LogGroupRowProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: theme.background, borderColor: theme.border },
        isFirst && styles.first,
        isLast && styles.last,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  first: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
  },
  last: {
    borderBottomLeftRadius: Radius.large,
    borderBottomRightRadius: Radius.large,
  },
});

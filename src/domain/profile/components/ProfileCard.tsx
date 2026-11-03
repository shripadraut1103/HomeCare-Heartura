import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Radius, Shadows, Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

type ProfileCardProps = {
  children: ReactNode;
  padded?: boolean;
};

export function ProfileCard({ children, padded = false }: ProfileCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, padded && styles.padded, { backgroundColor: theme.background }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.large,
    overflow: 'hidden',
    ...Shadows.card,
  },
  padded: {
    paddingHorizontal: Spacing.three,
  },
});

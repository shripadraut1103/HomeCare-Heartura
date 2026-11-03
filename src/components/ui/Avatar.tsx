import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import type { ThemeColor } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';
import { getInitials } from '@/utils/nameFormat';

type AvatarProps = {
  name: string;
  size?: number;
  color?: ThemeColor;
  backgroundColor?: ThemeColor;
};

export function Avatar({
  name,
  size = 44,
  color = 'toneRoseFg',
  backgroundColor = 'toneRoseBg',
}: AvatarProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme[backgroundColor],
        },
      ]}>
      <ThemedText
        themeColor={color}
        style={[styles.initials, { fontSize: Math.round(size * 0.36) }]}>
        {getInitials(name)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: 600,
  },
});

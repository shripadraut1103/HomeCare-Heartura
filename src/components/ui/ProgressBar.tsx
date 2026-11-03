import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, type ThemeColor } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

const BAR_HEIGHT = 4;

type ProgressBarProps = {
  progress: number;
  color?: ThemeColor;
  trackColor?: ThemeColor;
  style?: StyleProp<ViewStyle>;
};

export function ProgressBar({
  progress,
  color = 'primary',
  trackColor = 'primaryMuted',
  style,
}: ProgressBarProps) {
  const theme = useTheme();
  const clamped = Math.min(Math.max(progress, 0), 1);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[styles.track, { backgroundColor: theme[trackColor] }, style]}>
      <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: theme[color] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: BAR_HEIGHT,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});

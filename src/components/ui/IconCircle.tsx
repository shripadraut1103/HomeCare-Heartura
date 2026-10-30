import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import type { ThemeColor } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

type IconCircleProps = {
  icon: IconName;
  color: ThemeColor;
  backgroundColor: ThemeColor;
  size?: number;
};

export function IconCircle({ icon, color, backgroundColor, size = 40 }: IconCircleProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme[backgroundColor],
        },
      ]}>
      <Icon name={icon} size={Math.round(size * 0.45)} color={theme[color]} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

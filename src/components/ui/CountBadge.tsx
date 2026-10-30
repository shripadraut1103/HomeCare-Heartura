import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Radius } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

const MIN_SIZE = 22;
const MAX_SHOWN = 99;

type CountBadgeProps = {
  count: number;
  style?: StyleProp<ViewStyle>;
};

export function CountBadge({ count, style }: CountBadgeProps) {
  const theme = useTheme();
  if (count <= 0) return null;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: theme.error, borderColor: theme.background },
        style,
      ]}>
      <ThemedText themeColor="onError" style={styles.label}>
        {count > MAX_SHOWN ? `${MAX_SHOWN}+` : count}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: MIN_SIZE,
    height: MIN_SIZE,
    paddingHorizontal: 5,
    borderRadius: Radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: 700,
  },
});

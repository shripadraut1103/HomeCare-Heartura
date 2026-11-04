import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

const HIT_SIZE = 40;
const ACTIVE_SIZE = 48;

type CalendarNavProps = {
  label: string;
  previousLabel: string;
  nextLabel: string;
  onPrevious: () => void;
  onNext: () => void;
  trailing?: ReactNode;
};

export function CalendarNav({
  label,
  previousLabel,
  nextLabel,
  onPrevious,
  onNext,
  trailing,
}: CalendarNavProps) {
  return (
    <View style={styles.row}>
      <NavIcon
        icon={{ ios: 'chevron.left', android: 'chevron_left' }}
        label={previousLabel}
        onPress={onPrevious}
      />
      <ThemedText accessibilityRole="header" numberOfLines={1} style={styles.label}>
        {label}
      </ThemedText>
      <NavIcon
        icon={{ ios: 'chevron.right', android: 'chevron_right' }}
        label={nextLabel}
        onPress={onNext}
      />
      {trailing}
    </View>
  );
}

type NavIconProps = {
  icon: IconName;
  label: string;
  onPress: () => void;
  expanded?: boolean;
  active?: boolean;
};

export function NavIcon({ icon, label, onPress, expanded, active = false }: NavIconProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={expanded === undefined ? undefined : { expanded }}
      hitSlop={4}
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      style={({ pressed }) => [
        styles.icon,
        active && [styles.active, { borderColor: theme.primary }],
        pressed && styles.pressed,
      ]}>
      <Icon name={icon} size={20} color={theme.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  label: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 600,
  },
  icon: {
    width: HIT_SIZE,
    height: HIT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    width: ACTIVE_SIZE,
    height: ACTIVE_SIZE,
    margin: (HIT_SIZE - ACTIVE_SIZE) / 2,
    borderRadius: ACTIVE_SIZE / 2,
    borderWidth: 2,
  },
  pressed: {
    opacity: 0.5,
  },
});

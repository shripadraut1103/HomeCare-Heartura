import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Radius, Spacing, type ThemeColor } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

const TILE_SIZE = 40;

export type MenuRowTone = 'blue' | 'amber' | 'teal' | 'purple' | 'rose';

const TONES: Record<MenuRowTone, { color: ThemeColor; background: ThemeColor }> = {
  blue: { color: 'toneBlueFg', background: 'toneBlueBg' },
  amber: { color: 'toneAmberFg', background: 'toneAmberBg' },
  teal: { color: 'accent', background: 'toneTealBg' },
  purple: { color: 'tonePurpleFg', background: 'tonePurpleBg' },
  rose: { color: 'toneRoseFg', background: 'toneRoseBg' },
};

type MenuRowProps = {
  icon: IconName;
  tone: MenuRowTone;
  title: string;
  subtitle?: string;
  titleColor?: ThemeColor;
  chevron?: boolean;
  trailing?: ReactNode;
  divider?: boolean;
  onPress?: () => void;
};

export function MenuRow({
  icon,
  tone,
  title,
  subtitle,
  titleColor,
  chevron = true,
  trailing,
  divider = false,
  onPress,
}: MenuRowProps) {
  const theme = useTheme();
  const { color, background } = TONES[tone];

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={[title, subtitle].filter(Boolean).join(', ')}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        divider && [styles.divider, { borderBottomColor: theme.border }],
        pressed && { backgroundColor: theme.backgroundElement },
      ]}>
      <View style={[styles.tile, { backgroundColor: theme[background] }]}>
        <Icon name={icon} size={20} color={theme[color]} />
      </View>
      <View style={styles.body}>
        <ThemedText numberOfLines={1} themeColor={titleColor} style={styles.title}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText numberOfLines={1} themeColor="textSecondary" style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {trailing}
      {chevron ? (
        <Icon
          name={{ ios: 'chevron.right', android: 'chevron_right' }}
          size={18}
          color={theme.textSecondary}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.small,
  },
  body: {
    flex: 1,
    gap: Spacing.half,
  },
  title: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 500,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: 400,
  },
});

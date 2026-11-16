import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type TextStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { Icon } from '@/components/ui/Icon';
import { Spacing, type ThemeColor } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

const ACCENT_WIDTH = 4;

export const ROW_ACCENTS: readonly ThemeColor[] = [
  'primary',
  'accent',
  'toneAmberFg',
  'tonePurpleFg',
  'toneRoseFg',
];

type ExpandableRowProps = {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  accent?: ThemeColor;
  expanded: boolean;
  onToggle: () => void;
  isFirst?: boolean;
  linkTitle?: boolean;
  titleLines?: number;
  titleStyle?: StyleProp<TextStyle>;
  children?: ReactNode;
};

export function ExpandableRow({
  title,
  subtitle,
  trailing,
  accent,
  expanded,
  onToggle,
  isFirst = false,
  linkTitle = false,
  titleLines,
  titleStyle,
  children,
}: ExpandableRowProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        !isFirst && [styles.divider, { borderTopColor: theme.border }],
        accent && [styles.accent, { borderLeftColor: theme[accent] }],
        expanded && { backgroundColor: theme.surfaceMuted },
      ]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
        onPress={() => {
          haptics.selection();
          onToggle();
        }}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}>
        <View style={styles.text}>
          <ThemedText
            themeColor={linkTitle ? 'primary' : undefined}
            numberOfLines={expanded ? undefined : titleLines}
            style={[styles.title, linkTitle && styles.link, titleStyle]}>
            {title}
          </ThemedText>
          {subtitle ? (
            <ThemedText themeColor="textSecondary" numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
        {trailing}
        <Icon
          name={
            expanded
              ? { ios: 'chevron.up', android: 'keyboard_arrow_up' }
              : { ios: 'chevron.down', android: 'keyboard_arrow_down' }
          }
          size={18}
          color={theme.textSecondary}
        />
      </Pressable>
      {expanded && children ? (
        <Animated.View entering={FadeIn.duration(180)} style={styles.body}>
          {children}
        </Animated.View>
      ) : null}
    </View>
  );
}

export function DetailGrid({ items }: { items: readonly { label: string; value: string }[] }) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.label} style={styles.cell}>
          <ThemedText themeColor="textSecondary" style={styles.cellLabel}>
            {item.label}
          </ThemedText>
          <ThemedText style={styles.cellValue}>{item.value}</ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  accent: {
    borderLeftWidth: ACCENT_WIDTH,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    flex: 1,
    gap: Spacing.half,
  },
  title: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: 600,
  },
  link: {
    alignSelf: 'flex-start',
    textDecorationLine: 'underline',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 400,
  },
  body: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: Spacing.three,
    columnGap: Spacing.three,
  },
  cell: {
    width: '47%',
    gap: Spacing.half,
  },
  cellLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 400,
  },
  cellValue: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 400,
  },
});

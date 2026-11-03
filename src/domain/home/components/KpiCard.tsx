import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Icon } from '@/components/ui/Icon';
import { Radius, Spacing, type ThemeColor } from '@/constants/Theme';
import type { HomeStat, StatTone } from '@/domain/home/interfaces/HomeInterfaces';
import { useTheme } from '@/hooks/useTheme';

const ICON_BOX_SIZE = 34;

const TONE_COLORS: Record<StatTone, { background: ThemeColor; foreground: ThemeColor }> = {
  blue: { background: 'toneBlueBg', foreground: 'toneBlueFg' },
  amber: { background: 'toneAmberBg', foreground: 'toneAmberFg' },
  red: { background: 'toneRedBg', foreground: 'toneRedFg' },
  rose: { background: 'toneRoseBg', foreground: 'toneRoseFg' },
};

export function KpiCard({ stat }: { stat: HomeStat }) {
  const theme = useTheme();
  const tone = TONE_COLORS[stat.tone];

  return (
    <View
      accessible
      accessibilityLabel={`${stat.count} ${stat.label}`}
      style={[styles.tile, { backgroundColor: theme[tone.background] }]}>
      <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
        <Icon name={stat.icon} size={18} color={theme[tone.foreground]} />
      </View>
      <ThemedText themeColor={tone.foreground} style={styles.count}>
        {stat.count}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.label}>
        {stat.label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    paddingVertical: Spacing.three - Spacing.one,
    paddingHorizontal: Spacing.two + Spacing.half,
    borderRadius: Radius.medium,
  },
  iconBox: {
    width: ICON_BOX_SIZE,
    height: ICON_BOX_SIZE,
    borderRadius: Radius.small,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three - Spacing.one,
  },
  count: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 700,
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: 500,
  },
});

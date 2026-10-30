import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Pill } from '@/components/ui/Pill';
import { Radius, Shadows, Spacing, type ThemeColor } from '@/constants/Theme';
import type { ScheduledVisit, VisitStatus } from '@/domain/home/interfaces/HomeInterfaces';
import { useTheme } from '@/hooks/useTheme';
import { formatTimeParts } from '@/utils/dateFormat';

const TIME_COLUMN_WIDTH = 74;

const STATUS_STYLE: Record<
  VisitStatus,
  { label: string; color: ThemeColor; background: ThemeColor }
> = {
  scheduled: { label: 'Scheduled', color: 'primary', background: 'primaryMuted' },
  inProgress: { label: 'In progress', color: 'toneAmberFg', background: 'toneAmberBg' },
  completed: { label: 'Completed', color: 'success', background: 'successMuted' },
  missed: { label: 'Missed', color: 'toneRedFg', background: 'toneRedBg' },
};

type VisitCardProps = {
  visit: ScheduledVisit;
  onPress?: (visit: ScheduledVisit) => void;
  style?: StyleProp<ViewStyle>;
};

export function VisitCard({ visit, onPress, style }: VisitCardProps) {
  const theme = useTheme();
  const { time, period } = formatTimeParts(new Date(visit.startsAt));
  const status = STATUS_STYLE[visit.status];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${time} ${period}, ${visit.durationMinutes} minutes, ${visit.patientName}, ${visit.details}, ${status.label}`}
      onPress={onPress ? () => onPress(visit) : undefined}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.background },
        pressed && styles.pressed,
        style,
      ]}>
      <View style={[styles.timeColumn, { borderRightColor: theme.border }]}>
        <ThemedText style={styles.time}>
          {time}
          <ThemedText themeColor="textSecondary" style={styles.period}>
            {' '}
            {period}
          </ThemedText>
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.duration}>
          {visit.durationMinutes} min
        </ThemedText>
      </View>

      <View style={styles.details}>
        <ThemedText numberOfLines={1} style={styles.name}>
          {visit.patientName}
          <ThemedText themeColor="textSecondary" style={styles.tag}>
            {' '}
            ({visit.patientTag})
          </ThemedText>
        </ThemedText>
        <ThemedText numberOfLines={1} themeColor="textSecondary" style={styles.meta}>
          {visit.details}
        </ThemedText>
      </View>

      <Pill
        label={status.label}
        color={status.color}
        backgroundColor={status.background}
        dot
        style={styles.status}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + Spacing.half,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three - Spacing.one,
    borderRadius: Radius.large,
    ...Shadows.card,
  },
  pressed: {
    opacity: 0.85,
  },
  timeColumn: {
    width: TIME_COLUMN_WIDTH,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  time: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 700,
  },
  period: {
    fontSize: 12,
    fontWeight: 500,
  },
  duration: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
  },
  details: {
    flex: 1,
    gap: Spacing.half,
  },
  name: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 700,
  },
  tag: {
    fontSize: 16,
    fontWeight: 400,
  },
  meta: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
  },
  status: {
    alignSelf: 'center',
  },
});

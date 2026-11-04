import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Radius, Spacing } from '@/constants/Theme';
import {
  isSameDay,
  isSameMonth,
  monthWeeks,
  WEEKDAY_LETTERS,
  WEEKDAY_NAMES,
} from '@/domain/schedule/calendar';
import type { VisitStatus } from '@/domain/visits/interfaces/VisitInterfaces';
import { VISIT_STATUS } from '@/domain/visits/visitStatus';
import { useTheme } from '@/hooks/useTheme';
import { formatLongDate, toIsoDate } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

const CELL_HEIGHT = 84;
const DAY_SIZE = 36;
const MARK_SIZE = 7;

type ScheduleMonthTableProps = {
  month: Date;
  selected: Date;
  onSelect: (day: Date) => void;
  statuses: ReadonlyMap<string, readonly VisitStatus[]>;
};

export function ScheduleMonthTable({
  month,
  selected,
  onSelect,
  statuses,
}: ScheduleMonthTableProps) {
  const theme = useTheme();
  const today = new Date();
  const weeks = monthWeeks(month);
  const divider = { borderColor: theme.border };

  return (
    <View style={[styles.table, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <View style={[styles.row, { backgroundColor: theme.surfaceMuted }]}>
        {WEEKDAY_LETTERS.map((letter, index) => (
          <ThemedText
            key={WEEKDAY_NAMES[index]}
            accessibilityLabel={WEEKDAY_NAMES[index]}
            themeColor="textSecondary"
            style={[styles.weekday, index < 6 && [styles.rightLine, divider]]}>
            {letter}
          </ThemedText>
        ))}
      </View>
      {weeks.map((week) => (
        <View key={toIsoDate(week[0])} style={[styles.row, styles.topLine, divider]}>
          {week.map((day, index) => {
            const key = toIsoDate(day);
            const marks = statuses.get(key) ?? [];
            const inMonth = isSameMonth(day, month);
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, selected);
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={`${formatLongDate(day)}${
                  marks.length
                    ? `, ${marks.map((status) => VISIT_STATUS[status].label).join(', ')}`
                    : ''
                }`}
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  if (isSelected) return;
                  haptics.selection();
                  onSelect(day);
                }}
                style={({ pressed }) => [
                  styles.cell,
                  index < 6 && [styles.rightLine, divider],
                  pressed && { backgroundColor: theme.surfaceMuted },
                ]}>
                <View
                  style={[
                    styles.day,
                    isToday && { backgroundColor: theme.primary },
                    isSelected && !isToday && { borderColor: theme.primary, borderWidth: 1.5 },
                  ]}>
                  <ThemedText
                    themeColor={isToday ? 'onPrimary' : inMonth ? 'text' : 'textSecondary'}
                    style={[styles.dayNumber, (isToday || isSelected) && styles.dayStrong]}>
                    {day.getDate()}
                  </ThemedText>
                </View>
                <View style={[styles.marks, !inMonth && styles.faded]}>
                  {marks.map((status, markIndex) => (
                    <View
                      key={`${status}-${markIndex}`}
                      style={[styles.mark, { backgroundColor: theme[VISIT_STATUS[status].dot] }]}
                    />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  topLine: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rightLine: {
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 500,
    paddingVertical: Spacing.two,
  },
  cell: {
    flex: 1,
    height: CELL_HEIGHT,
    alignItems: 'center',
    paddingTop: Spacing.one,
    gap: Spacing.one,
  },
  day: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    borderRadius: DAY_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 400,
    fontVariant: ['tabular-nums'],
  },
  dayStrong: {
    fontWeight: 700,
  },
  marks: {
    flexDirection: 'row',
    gap: Spacing.half,
    minHeight: MARK_SIZE,
  },
  mark: {
    width: MARK_SIZE,
    height: MARK_SIZE,
    borderRadius: MARK_SIZE / 2,
  },
  faded: {
    opacity: 0.4,
  },
});

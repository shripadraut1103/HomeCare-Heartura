import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Radius, Spacing } from '@/constants/Theme';
import {
  isSameDay,
  isSameMonth,
  monthWeeks,
  WEEKDAY_NAMES,
  WEEKDAY_SHORT,
} from '@/domain/schedule/calendar';
import { useTheme } from '@/hooks/useTheme';
import { formatLongDate, toIsoDate } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

const CELL_HEIGHT = 52;
const MARK_SIZE = 5;

type MonthGridProps = {
  month: Date;
  selected: Date;
  onSelect: (day: Date) => void;
  markedDays: ReadonlySet<string>;
  isDisabled?: (day: Date) => boolean;
};

export function MonthGrid({ month, selected, onSelect, markedDays, isDisabled }: MonthGridProps) {
  const theme = useTheme();
  const today = new Date();

  return (
    <View>
      <View style={styles.row}>
        {WEEKDAY_SHORT.map((label, index) => (
          <ThemedText
            key={label}
            accessibilityLabel={WEEKDAY_NAMES[index]}
            themeColor="textSecondary"
            style={styles.weekday}>
            {label}
          </ThemedText>
        ))}
      </View>
      {monthWeeks(month).map((week) => (
        <View key={toIsoDate(week[0])} style={styles.row}>
          {week.map((day) => {
            const isSelected = isSameDay(day, selected);
            const inMonth = isSameMonth(day, month);
            const disabled = isDisabled?.(day) ?? false;
            const marked = markedDays.has(toIsoDate(day));
            const isToday = isSameDay(day, today);
            return (
              <Pressable
                key={toIsoDate(day)}
                accessibilityRole="button"
                accessibilityLabel={`${formatLongDate(day)}${marked ? ', has visits' : ''}`}
                accessibilityState={{ selected: isSelected, disabled }}
                disabled={disabled}
                onPress={() => {
                  haptics.selection();
                  onSelect(day);
                }}
                style={[styles.cell, isSelected && { backgroundColor: theme.primary }]}>
                <ThemedText
                  themeColor={
                    isSelected
                      ? 'onPrimary'
                      : isToday
                        ? 'primary'
                        : inMonth
                          ? 'text'
                          : 'textSecondary'
                  }
                  style={[
                    styles.day,
                    (isToday || isSelected) && styles.dayStrong,
                    (!inMonth || disabled) && !isSelected && styles.faded,
                  ]}>
                  {day.getDate()}
                </ThemedText>
                <View
                  style={[
                    styles.mark,
                    marked && {
                      backgroundColor: isSelected ? theme.onPrimary : theme.accent,
                    },
                    (!inMonth || disabled) && !isSelected && styles.faded,
                  ]}
                />
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
    paddingVertical: Spacing.two,
  },
  cell: {
    flex: 1,
    height: CELL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
    borderRadius: Radius.small,
  },
  day: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: 400,
    fontVariant: ['tabular-nums'],
  },
  dayStrong: {
    fontWeight: 700,
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

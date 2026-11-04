import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeInLeft, FadeInRight } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { Spacing } from '@/constants/Theme';
import {
  addDays,
  addMonths,
  formatMonthYear,
  formatWeekRange,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  WEEKDAY_LETTERS,
  WEEKDAY_NAMES,
  weekDays,
} from '@/domain/schedule/calendar';
import { CalendarNav, NavIcon } from '@/domain/schedule/components/CalendarNav';
import { ScheduleMonthTable } from '@/domain/schedule/components/ScheduleMonthTable';
import type { VisitStatus } from '@/domain/visits/interfaces/VisitInterfaces';
import { ALL_VISIT_STATUSES, VISIT_STATUS } from '@/domain/visits/visitStatus';
import { useTheme } from '@/hooks/useTheme';
import { formatLongDate, toIsoDate } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

const DAY_SIZE = 44;
const MARK_SIZE = 5;
const LEGEND_DOT_SIZE = 7;
const SWIPE_ACTIVATION = 15;
const SWIPE_DISTANCE = 50;
const SWIPE_VELOCITY = 500;
const PAGE_DURATION = 220;

type Direction = -1 | 0 | 1;

const pageEntering = (direction: Direction) =>
  (direction > 0 ? FadeInRight : direction < 0 ? FadeInLeft : FadeIn).duration(PAGE_DURATION);

type ScheduleCalendarProps = {
  selected: Date;
  onSelect: (day: Date) => void;
  statuses: ReadonlyMap<string, readonly VisitStatus[]>;
};

export function ScheduleCalendar({ selected, onSelect, statuses }: ScheduleCalendarProps) {
  const [expanded, setExpanded] = useState(false);
  const [month, setMonth] = useState(() => startOfMonth(selected));
  const [direction, setDirection] = useState<Direction>(0);
  const [shown, setShown] = useState(selected);

  if (!isSameDay(shown, selected)) {
    setShown(selected);
    setDirection(selected > shown ? 1 : -1);
    if (!isSameMonth(selected, month)) setMonth(startOfMonth(selected));
  }

  const toggle = () => {
    setDirection(0);
    setMonth(startOfMonth(selected));
    setExpanded((current) => !current);
  };

  const step = (delta: 1 | -1) => {
    if (expanded) {
      setDirection(delta);
      setMonth((current) => addMonths(current, delta));
    } else {
      onSelect(addDays(selected, 7 * delta));
    }
  };

  const swipe = usePanGesture({
    runOnJS: true,
    activeOffsetX: [-SWIPE_ACTIVATION, SWIPE_ACTIVATION],
    failOffsetY: [-SWIPE_ACTIVATION, SWIPE_ACTIVATION],
    onDeactivate: (event) => {
      if (event.canceled) return;
      if (
        Math.abs(event.translationX) < SWIPE_DISTANCE &&
        Math.abs(event.velocityX) < SWIPE_VELOCITY
      ) {
        return;
      }
      haptics.selection();
      step(event.translationX < 0 ? 1 : -1);
    },
  });

  const expandToggle = (
    <NavIcon
      icon={
        expanded
          ? { ios: 'chevron.up', android: 'keyboard_arrow_up' }
          : { ios: 'chevron.down', android: 'keyboard_arrow_down' }
      }
      label={expanded ? 'Show week' : 'Show month'}
      expanded={expanded}
      active={expanded}
      onPress={toggle}
    />
  );

  return (
    <View style={styles.container}>
      <CalendarNav
        label={expanded ? formatMonthYear(month) : formatWeekRange(selected)}
        previousLabel={expanded ? 'Previous month' : 'Previous week'}
        nextLabel={expanded ? 'Next month' : 'Next week'}
        onPrevious={() => step(-1)}
        onNext={() => step(1)}
        trailing={expandToggle}
      />

      <GestureDetector gesture={swipe}>
        <View style={styles.pages}>
          {expanded ? (
            <Animated.View key={`month-${toIsoDate(month)}`} entering={pageEntering(direction)}>
              <ScheduleMonthTable
                month={month}
                selected={selected}
                statuses={statuses}
                onSelect={onSelect}
              />
            </Animated.View>
          ) : (
            <Animated.View
              key={`week-${toIsoDate(startOfWeek(selected))}`}
              entering={pageEntering(direction)}>
              <WeekRow selected={selected} onSelect={onSelect} statuses={statuses} />
            </Animated.View>
          )}
        </View>
      </GestureDetector>

      <StatusLegend />
    </View>
  );
}

function WeekRow({ selected, onSelect, statuses }: ScheduleCalendarProps) {
  const theme = useTheme();
  const today = new Date();

  return (
    <View style={styles.week}>
      {weekDays(selected).map((day) => {
        const isSelected = isSameDay(day, selected);
        const isToday = isSameDay(day, today);
        const marked = statuses.has(toIsoDate(day));
        return (
          <Pressable
            key={toIsoDate(day)}
            accessibilityRole="button"
            accessibilityLabel={`${formatLongDate(day)}${marked ? ', has visits' : ''}`}
            accessibilityState={{ selected: isSelected }}
            onPress={() => {
              if (isSelected) return;
              haptics.selection();
              onSelect(day);
            }}
            style={styles.weekDay}>
            <ThemedText
              themeColor="textSecondary"
              accessibilityLabel={WEEKDAY_NAMES[day.getDay()]}
              style={styles.weekLetter}>
              {WEEKDAY_LETTERS[day.getDay()]}
            </ThemedText>
            <View
              style={[
                styles.dayCircle,
                isSelected && { backgroundColor: theme.primary },
                isToday && !isSelected && { borderColor: theme.primary, borderWidth: 1.5 },
              ]}>
              <ThemedText
                themeColor={isSelected ? 'onPrimary' : isToday ? 'primary' : 'text'}
                style={styles.dayNumber}>
                {day.getDate()}
              </ThemedText>
            </View>
            <View style={[styles.mark, marked && { backgroundColor: theme.textSecondary }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

function StatusLegend() {
  const theme = useTheme();

  return (
    <View
      style={styles.legend}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      {ALL_VISIT_STATUSES.map((status) => (
        <View key={status} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme[VISIT_STATUS[status].dot] }]} />
          <ThemedText themeColor="textSecondary" style={styles.legendLabel}>
            {VISIT_STATUS[status].label}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  pages: {
    overflow: 'hidden',
  },
  week: {
    flexDirection: 'row',
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  weekLetter: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 500,
  },
  dayCircle: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    borderRadius: DAY_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: 600,
    fontVariant: ['tabular-nums'],
  },
  mark: {
    width: MARK_SIZE,
    height: MARK_SIZE,
    borderRadius: MARK_SIZE / 2,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: Spacing.two,
    rowGap: Spacing.one,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  legendDot: {
    width: LEGEND_DOT_SIZE,
    height: LEGEND_DOT_SIZE,
    borderRadius: LEGEND_DOT_SIZE / 2,
  },
  legendLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 400,
  },
});

import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/Theme';
import { VisitCard } from '@/domain/home/components/VisitCard';
import type { ScheduledVisit } from '@/domain/home/interfaces/HomeInterfaces';
import { useTheme } from '@/hooks/useTheme';

const RAIL_WIDTH = 24;
const DOT_SIZE = 16;
const LINE_WIDTH = 2;

type VisitTimelineItemProps = {
  visit: ScheduledVisit;
  isFirst: boolean;
  isLast: boolean;
  onPress?: (visit: ScheduledVisit) => void;
};

export function VisitTimelineItem({ visit, isFirst, isLast, onPress }: VisitTimelineItemProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.rail}>
        <View
          style={[
            styles.line,
            { backgroundColor: theme.border },
            isFirst && styles.lineFromCenter,
            isLast && styles.lineToCenter,
          ]}
        />
        <View style={[styles.dot, { backgroundColor: theme.primary }]} />
      </View>
      <VisitCard visit={visit} onPress={onPress} style={styles.card} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  rail: {
    width: RAIL_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    position: 'absolute',
    width: LINE_WIDTH,
    top: 0,
    bottom: -Spacing.three,
  },
  lineFromCenter: {
    top: '50%',
  },
  lineToCenter: {
    bottom: '50%',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  card: {
    flex: 1,
    marginLeft: Spacing.two,
  },
});

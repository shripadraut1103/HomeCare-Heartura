import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { InfoNote } from '@/components/ui/InfoNote';
import { Radius, Spacing } from '@/constants/Theme';
import { describeConflict } from '@/domain/schedule/bookingMapper';
import type {
  ApiBookingCheckResult,
  ApiConflict,
  ApiUnitsSummary,
} from '@/domain/schedule/interfaces/BookingApi';
import { useTheme } from '@/hooks/useTheme';
import { formatNumericDate, parseIsoDate } from '@/utils/dateFormat';

const WARNING = { ios: 'exclamationmark.triangle', android: 'warning' } as const;

const count = (value: number | null) => (value === null ? '—' : String(value));

export function UnitsTiles({ units }: { units: ApiUnitsSummary }) {
  const theme = useTheme();
  const tiles = [
    { value: `${units.visit}`, label: 'This visit' },
    { value: `${units.week_used} of ${count(units.week_allowed)}`, label: 'This week' },
    { value: count(units.remaining), label: 'Remaining incl. makeup' },
  ];

  return (
    <View style={styles.field}>
      <ThemedText themeColor="textSecondary" style={styles.label}>
        {`Units · week of ${formatNumericDate(parseIsoDate(units.week_start))}`}
      </ThemedText>
      <View style={styles.pair}>
        {tiles.map((tile) => (
          <View
            key={tile.label}
            accessible
            accessibilityLabel={`${tile.value} units ${tile.label}`}
            style={[styles.tile, { backgroundColor: theme.surfaceMuted }]}>
            <ThemedText style={styles.tileValue}>{tile.value}</ThemedText>
            <ThemedText themeColor="textSecondary" numberOfLines={2} style={styles.tileLabel}>
              {tile.label}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

type CheckNotesProps = {
  result: ApiBookingCheckResult | null;
  checking: boolean;
  error: string | null;
  evvRequired: boolean | undefined;
};

export function CheckNotes({ result, checking, error, evvRequired }: CheckNotesProps) {
  const theme = useTheme();
  const availability = result?.availability;
  const notes = [
    evvRequired === undefined
      ? null
      : evvRequired
        ? 'EVV required · clock in and out with GPS.'
        : 'No EVV · no clock in needed.',
    availability?.within_hours === false ? 'Outside the provider’s working hours.' : null,
    ...(availability?.blocked_by ?? []).map((block) => `Provider blocked: ${block.title}`),
  ].filter((note): note is string => Boolean(note));

  return (
    <View style={styles.field}>
      {checking ? (
        <View style={styles.checking}>
          <ActivityIndicator size="small" color={theme.textSecondary} />
          <ThemedText themeColor="textSecondary" style={styles.hint}>
            Checking this time…
          </ThemedText>
        </View>
      ) : null}
      {error ? (
        <ThemedText themeColor="error" style={styles.hint}>
          {error}
        </ThemedText>
      ) : null}
      {notes.map((note) => (
        <InfoNote key={note} text={note} collapsible={false} />
      ))}
    </View>
  );
}

export function ConflictList({ conflicts }: { conflicts: readonly ApiConflict[] }) {
  const theme = useTheme();

  return (
    <View style={[styles.conflicts, { backgroundColor: theme.toneAmberBg }]}>
      <InfoNote
        icon={WARNING}
        collapsible={false}
        text={
          conflicts.length === 0
            ? 'This time overlaps another visit.'
            : conflicts.length === 1
              ? 'This time overlaps another visit:'
              : `This time overlaps ${conflicts.length} other visits:`
        }
      />
      {conflicts.map((conflict) => {
        const { title, detail } = describeConflict(conflict);
        return (
          <View key={conflict.id} accessible style={styles.conflict}>
            <ThemedText themeColor="toneAmberFg" style={styles.conflictTitle}>
              {title}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.hint}>
              {detail}
            </ThemedText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
  },
  pair: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  tile: {
    flex: 1,
    gap: Spacing.half,
    padding: Spacing.three,
    borderRadius: Radius.medium,
  },
  tileValue: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: 600,
  },
  tileLabel: {
    fontSize: 14,
    lineHeight: 20,
  },
  checking: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  conflicts: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.medium,
  },
  conflict: {
    gap: Spacing.half,
  },
  conflictTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: 600,
  },
});

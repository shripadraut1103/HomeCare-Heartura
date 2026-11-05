import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Spacing } from '@/constants/Theme';
import { NoteSectionCard } from '@/domain/notes/components/NoteSectionCard';
import { DAILY_NOTE } from '@/domain/notes/dailyNote';
import { asText, type NoteForm } from '@/domain/notes/hooks/useNoteForm';
import type { NoteSection } from '@/domain/notes/interfaces/NoteInterfaces';
import { useTheme } from '@/hooks/useTheme';
import { formatTime } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

const LABEL_WIDTH = 64;

const EVV_SECTION: NoteSection = {
  id: 'evv',
  title: 'EVV · clock in and out',
  accent: 'primary',
  fields: [],
};

export function EvvClockCard({ form }: { form: NoteForm }) {
  const theme = useTheme();
  const clockedIn = asText(form.values[DAILY_NOTE.clockIn]);
  const clockedOut = asText(form.values[DAILY_NOTE.clockOut]);

  // TODO: capture the GPS position with expo-location once EVV is wired to the aggregator.
  const clock = (fieldId: string) => {
    haptics.success();
    form.setValue(fieldId, new Date().toISOString());
  };

  return (
    <NoteSectionCard
      section={EVV_SECTION}
      expanded={form.expanded.has(EVV_SECTION.id)}
      onToggle={form.toggleSection}>
      <View>
        <ClockRow label="IN" at={clockedIn} empty="Not clocked in" />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <ClockRow label="OUT" at={clockedOut} empty="Not clocked out" />
      </View>
      {!clockedIn ? (
        <Button
          title="Clock in"
          onPress={() => clock(DAILY_NOTE.clockIn)}
          icon={
            <Icon
              name={{ ios: 'location.fill.viewfinder', android: 'my_location' }}
              size={20}
              color={theme.onPrimary}
            />
          }
        />
      ) : !clockedOut ? (
        <Button
          title="Clock out"
          onPress={() => clock(DAILY_NOTE.clockOut)}
          icon={
            <Icon name={{ ios: 'clock', android: 'schedule' }} size={20} color={theme.onPrimary} />
          }
        />
      ) : null}
    </NoteSectionCard>
  );
}

function ClockRow({ label, at, empty }: { label: string; at: string; empty: string }) {
  return (
    <View style={styles.row}>
      <ThemedText themeColor="textSecondary" style={styles.label}>
        {label}
      </ThemedText>
      {at ? (
        <ThemedText style={styles.value}>
          <ThemedText style={[styles.value, styles.time]}>{formatTime(new Date(at))}</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.value}>
            {' · no GPS fix'}
          </ThemedText>
        </ThemedText>
      ) : (
        <ThemedText themeColor="textSecondary" style={styles.value}>
          {empty}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  label: {
    width: LABEL_WIDTH,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 600,
    letterSpacing: 1,
  },
  value: {
    flex: 1,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 400,
  },
  time: {
    fontWeight: 700,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});

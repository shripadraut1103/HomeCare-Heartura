import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { Select } from '@/components/ui/Select';
import { TextField } from '@/components/ui/TextField';
import { Radius, Spacing } from '@/constants/Theme';
import { addMinutes, DAILY_NOTE, minutesBetween, unitsFor } from '@/domain/notes/dailyNote';
import { asText, type NoteForm } from '@/domain/notes/hooks/useNoteForm';
import { useTheme } from '@/hooks/useTheme';

const MAX_MINUTES = 480;

export type VisitUnits = {
  used: number;
  authorized: number;
  weekOf: string;
  authorization?: string;
};

type VisitDetailsFieldsProps = {
  form: NoteForm;
  locations: readonly string[];
  units: VisitUnits;
};

export function VisitDetailsFields({ form, locations, units }: VisitDetailsFieldsProps) {
  const theme = useTheme();
  const start = asText(form.values[DAILY_NOTE.start]);
  const end = asText(form.values[DAILY_NOTE.end]);
  const minutes = minutesBetween(start, end);
  const [durationDraft, setDurationDraft] = useState<string | null>(null);

  const setStart = (next: Date) => {
    form.setValue(DAILY_NOTE.start, next.toISOString());
    form.setValue(DAILY_NOTE.end, addMinutes(next.toISOString(), minutes));
  };

  const setDay = (day: Date) => {
    const current = new Date(start);
    setStart(
      new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        current.getHours(),
        current.getMinutes()
      )
    );
  };

  const setEnd = (next: Date) => {
    const startAt = new Date(start);
    const sameDay = new Date(
      startAt.getFullYear(),
      startAt.getMonth(),
      startAt.getDate(),
      next.getHours(),
      next.getMinutes()
    );
    form.setValue(DAILY_NOTE.end, sameDay < startAt ? start : sameDay.toISOString());
  };

  const setDuration = (text: string) => {
    setDurationDraft(text);
    const value = Number.parseInt(text, 10);
    if (Number.isFinite(value) && value >= 0 && value <= MAX_MINUTES)
      form.setValue(DAILY_NOTE.end, addMinutes(start, value));
  };

  const remaining = Math.max(0, units.authorized - units.used);

  return (
    <>
      <View style={styles.columns}>
        <View style={styles.column}>
          <DateTimeField label="Date" mode="date" value={new Date(start)} onChange={setDay} />
        </View>
        <View style={styles.column}>
          <DateTimeField
            label="Start time"
            mode="time"
            value={new Date(start)}
            onChange={setStart}
          />
        </View>
      </View>
      <View style={styles.columns}>
        <View style={styles.column}>
          <DateTimeField label="End time" mode="time" value={new Date(end)} onChange={setEnd} />
        </View>
        <View style={styles.column}>
          <TextField
            label="Duration (min)"
            labelStyle={styles.label}
            value={durationDraft ?? String(minutes)}
            onChangeText={setDuration}
            onBlur={() => setDurationDraft(null)}
            keyboardType="number-pad"
            style={styles.input}
          />
        </View>
      </View>
      <View
        accessible
        accessibilityLabel={`${unitsFor(minutes)} units`}
        style={[styles.unitsBox, { backgroundColor: theme.surfaceMuted }]}>
        <ThemedText themeColor="textSecondary" style={styles.label}>
          Units
        </ThemedText>
        <ThemedText style={styles.unitsValue}>{unitsFor(minutes)}</ThemedText>
      </View>
      <Select
        label="Service location"
        labelStyle={styles.label}
        options={locations.map((location) => ({ value: location, label: location }))}
        value={asText(form.values[DAILY_NOTE.location]) || null}
        onChange={(value) => form.setValue(DAILY_NOTE.location, value)}
      />
      <View style={styles.authorization}>
        <ThemedText themeColor="textSecondary" style={styles.label}>
          {['Units', `week of ${units.weekOf}`, units.authorization].filter(Boolean).join(' · ')}
        </ThemedText>
        <View style={styles.columns}>
          <StatTile value={`${units.used} of ${units.authorized}`} label="Used" />
          <StatTile value={String(remaining)} label="Remaining" />
        </View>
      </View>
    </>
  );
}

function StatTile({ value, label }: { value: string; label: string }) {
  const theme = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={`${value} ${label}`}
      style={[styles.tile, { backgroundColor: theme.surfaceMuted }]}>
      <ThemedText style={styles.tileValue}>{value}</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.tileLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  columns: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 500,
  },
  input: {
    minHeight: 48,
    borderRadius: Radius.medium,
  },
  unitsBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Radius.medium,
  },
  unitsValue: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: 700,
  },
  authorization: {
    gap: Spacing.two + Spacing.half,
  },
  tile: {
    flex: 1,
    gap: Spacing.half,
    padding: Spacing.three,
    borderRadius: Radius.medium,
  },
  tileValue: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: 700,
  },
  tileLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 400,
  },
});

import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { Spacing } from '@/constants/Theme';
import { DetailGrid, ExpandableRow, ROW_ACCENTS } from '@/domain/patients/components/ExpandableRow';
import { PatientCardShell } from '@/domain/patients/components/PatientCardShell';
import type { HistoryEntry } from '@/domain/patients/interfaces/PatientInterfaces';
import { COLLAPSED_HISTORY, historyView } from '@/domain/patients/patientHistory';
import { useTheme } from '@/hooks/useTheme';

const CLAMPED_LINES = 2;
const CLAMP_LENGTH = 90;

export function HistoryList({
  entries,
  empty,
}: {
  entries: readonly HistoryEntry[];
  empty: string;
}) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? entries : entries.slice(0, COLLAPSED_HISTORY);

  const toggle = (id: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (entries.length === 0) {
    return (
      <PatientCardShell>
        <ThemedText themeColor="textSecondary" style={styles.empty}>
          {empty}
        </ThemedText>
      </PatientCardShell>
    );
  }

  return (
    <PatientCardShell>
      {visible.map((entry, index) => {
        const view = historyView(entry);
        const note = view.note;
        return (
          <ExpandableRow
            key={entry.id}
            isFirst={index === 0}
            accent={ROW_ACCENTS[index % ROW_ACCENTS.length]}
            title={entry.title}
            subtitle={view.subtitle}
            expanded={expanded.has(entry.id)}
            onToggle={() => toggle(entry.id)}
            trailing={
              entry.status ? (
                entry.status === 'active' ? (
                  <Pill label="Active" dot color="success" backgroundColor="successMuted" />
                ) : (
                  <Pill label="Resolved" dot />
                )
              ) : undefined
            }>
            <DetailGrid
              items={
                note && !note.wide
                  ? [...view.fields, { label: 'Note', value: note.text }]
                  : view.fields
              }
            />
            {note?.wide ? <NoteText text={note.text} /> : null}
          </ExpandableRow>
        );
      })}
      {entries.length > COLLAPSED_HISTORY ? (
        <View style={[styles.showAll, { borderTopColor: theme.border }]}>
          <Button
            variant="link"
            color="accent"
            title={showAll ? 'Show less' : `Show all ${entries.length}`}
            onPress={() => setShowAll((current) => !current)}
          />
        </View>
      ) : null}
    </PatientCardShell>
  );
}

function NoteText({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const clamped = text.length > CLAMP_LENGTH;

  return (
    <View style={styles.note}>
      <ThemedText themeColor="textSecondary" style={styles.label}>
        Note
      </ThemedText>
      <ThemedText numberOfLines={clamped && !open ? CLAMPED_LINES : undefined} style={styles.value}>
        {text}
      </ThemedText>
      {clamped ? (
        <Button
          variant="link"
          color="accent"
          title={open ? 'Less' : 'More'}
          style={styles.more}
          onPress={() => setOpen((current) => !current)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.four,
  },
  showAll: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  note: {
    gap: Spacing.half,
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 400,
  },
  value: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 400,
  },
  more: {
    alignSelf: 'flex-start',
    paddingHorizontal: 0,
  },
});

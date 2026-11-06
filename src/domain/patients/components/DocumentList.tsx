import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { Spacing } from '@/constants/Theme';
import { DetailGrid, ExpandableRow, ROW_ACCENTS } from '@/domain/patients/components/ExpandableRow';
import { PatientCardShell } from '@/domain/patients/components/PatientCardShell';
import type { PatientDocument } from '@/domain/patients/interfaces/PatientInterfaces';
import { DOCUMENT_STATUS } from '@/domain/patients/patientDocuments';
import { useTheme } from '@/hooks/useTheme';

const COLLAPSED_DOCUMENTS = 4;

type DocumentListProps = {
  documents: readonly PatientDocument[];
  onOpenDetails: (document: PatientDocument) => void;
};

export function DocumentList({ documents, onOpenDetails }: DocumentListProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? documents : documents.slice(0, COLLAPSED_DOCUMENTS);

  const toggle = (id: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (documents.length === 0) {
    return (
      <PatientCardShell>
        <ThemedText themeColor="textSecondary" style={styles.empty}>
          No documents yet.
        </ThemedText>
      </PatientCardShell>
    );
  }

  return (
    <PatientCardShell>
      {visible.map((document, index) => {
        const status = DOCUMENT_STATUS[document.status];
        return (
          <ExpandableRow
            key={document.id}
            isFirst={index === 0}
            accent={ROW_ACCENTS[index % ROW_ACCENTS.length]}
            title={document.title}
            subtitle={`${document.kind} · ${document.author}`}
            expanded={expanded.has(document.id)}
            onToggle={() => toggle(document.id)}
            trailing={
              <Pill
                label={status.label}
                dot
                color={status.color}
                backgroundColor={status.background}
              />
            }>
            <DetailGrid
              items={[
                { label: 'Type', value: document.kind },
                { label: 'From', value: document.author },
                { label: 'Uploaded', value: document.date },
              ]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open details, ${document.title}`}
              hitSlop={8}
              onPress={() => onOpenDetails(document)}
              style={({ pressed }) => [styles.details, pressed && styles.pressed]}>
              <ThemedText themeColor="accent" style={styles.detailsLabel}>
                Open details
              </ThemedText>
              <Icon
                name={{ ios: 'chevron.right', android: 'chevron_right' }}
                size={14}
                color={theme.accent}
              />
            </Pressable>
          </ExpandableRow>
        );
      })}
      {documents.length > COLLAPSED_DOCUMENTS ? (
        <View style={[styles.showAll, { borderTopColor: theme.border }]}>
          <Button
            variant="link"
            color="accent"
            title={showAll ? 'Show less' : `Show all ${documents.length}`}
            onPress={() => setShowAll((current) => !current)}
          />
        </View>
      ) : null}
    </PatientCardShell>
  );
}

const styles = StyleSheet.create({
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.four,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.one + Spacing.half,
  },
  detailsLabel: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 600,
  },
  pressed: {
    opacity: 0.6,
  },
  showAll: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});

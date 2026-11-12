import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { Radius, Spacing } from '@/constants/Theme';
import { DetailGrid, ExpandableRow, ROW_ACCENTS } from '@/domain/patients/components/ExpandableRow';
import { PatientCardShell } from '@/domain/patients/components/PatientCardShell';
import type { ChartRecord } from '@/domain/patients/interfaces/PatientInterfaces';
import {
  hasFullNote,
  recordDetails,
  recordPill,
  recordSubtitle,
  SERVICE_NAME,
} from '@/domain/patients/patientRecords';
import { useTheme } from '@/hooks/useTheme';

const COLLAPSED_RECORDS = 4;

type RecordListProps = {
  records: readonly ChartRecord[];
  carePlans: readonly ChartRecord[];
  empty: string;
  onOpen: (record: ChartRecord) => void;
};

export function RecordList({ records, carePlans, empty, onOpen }: RecordListProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? records : records.slice(0, COLLAPSED_RECORDS);

  const toggle = (id: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (records.length === 0) {
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
      {visible.map((record, index) => {
        const pill = recordPill(record);
        const daily = record.kind === 'daily';
        const linked = !daily && hasFullNote(record);
        const carePlan = carePlans.find((plan) => plan.id === record.carePlanId);
        return (
          <ExpandableRow
            key={record.id}
            isFirst={index === 0}
            accent={ROW_ACCENTS[index % ROW_ACCENTS.length]}
            linkTitle={linked}
            title={daily ? record.date : record.title}
            subtitle={recordSubtitle(record)}
            expanded={expanded.has(record.id)}
            onToggle={() => toggle(record.id)}
            trailing={
              pill ? (
                <Pill label={pill.label} dot color={pill.color} backgroundColor={pill.background} />
              ) : undefined
            }>
            <DetailGrid items={recordDetails(record)} />
            {carePlan ? (
              <View style={styles.carePlan}>
                <ThemedText themeColor="textSecondary" style={styles.carePlanLabel}>
                  Care plan from this evaluation
                </ThemedText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Care plan, ${carePlan.planStart} to ${carePlan.planEnd}`}
                  onPress={() => onOpen(carePlan)}
                  style={({ pressed }) => [
                    styles.carePlanCard,
                    { backgroundColor: theme.background, borderColor: theme.border },
                    pressed && styles.pressed,
                  ]}>
                  <View style={styles.flex}>
                    <ThemedText style={styles.carePlanTitle}>Care plan</ThemedText>
                    <ThemedText
                      themeColor="textSecondary"
                      numberOfLines={1}
                      style={styles.carePlanMeta}>
                      {carePlan.planStart} – {carePlan.planEnd} ·{' '}
                      {SERVICE_NAME[carePlan.discipline]}
                    </ThemedText>
                  </View>
                  <Icon
                    name={{ ios: 'chevron.right', android: 'chevron_right' }}
                    size={16}
                    color={theme.textSecondary}
                  />
                </Pressable>
              </View>
            ) : null}
            {hasFullNote(record) ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${daily ? 'Open details' : 'View full note'}, ${record.title}`}
                hitSlop={8}
                onPress={() => onOpen(record)}
                style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
                <ThemedText themeColor="accent" style={styles.linkLabel}>
                  {daily ? 'Open details' : 'View full note'}
                </ThemedText>
                <Icon
                  name={{ ios: 'chevron.right', android: 'chevron_right' }}
                  size={14}
                  color={theme.accent}
                />
              </Pressable>
            ) : null}
          </ExpandableRow>
        );
      })}
      {records.length > COLLAPSED_RECORDS ? (
        <View style={[styles.showAll, { borderTopColor: theme.border }]}>
          <Button
            variant="link"
            color="accent"
            title={showAll ? 'Show less' : `Show all ${records.length}`}
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
  carePlan: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  carePlanLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 500,
  },
  carePlanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  flex: {
    flex: 1,
  },
  carePlanTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 600,
  },
  carePlanMeta: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 400,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.one + Spacing.half,
  },
  linkLabel: {
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

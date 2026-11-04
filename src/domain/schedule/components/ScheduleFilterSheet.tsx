import { BottomSheetView, useBottomSheetModal, type BottomSheetModal } from '@gorhom/bottom-sheet';
import { useState, type Ref } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Spacing, type ThemeColor } from '@/constants/Theme';
import { usePatients } from '@/domain/patients/hooks/usePatients';
import {
  EMPTY_SCHEDULE_FILTER,
  type ScheduleFilter,
} from '@/domain/schedule/interfaces/ScheduleInterfaces';
import type { VisitStatus } from '@/domain/visits/interfaces/VisitInterfaces';
import { ALL_VISIT_STATUSES, VISIT_STATUS } from '@/domain/visits/visitStatus';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

const ALL_PATIENTS = 'all';

const STATUS_LABELS = ALL_VISIT_STATUSES.map((status) => VISIT_STATUS[status].label);
const STATUS_DOTS = Object.fromEntries(
  ALL_VISIT_STATUSES.map((status) => [VISIT_STATUS[status].label, VISIT_STATUS[status].dot])
) as Record<string, ThemeColor>;
const statusFromLabel = (label: string) =>
  ALL_VISIT_STATUSES.find((status) => VISIT_STATUS[status].label === label) as VisitStatus;

export type ScheduleFilterSheetData = { filter: ScheduleFilter };

type ScheduleFilterSheetProps = {
  ref: Ref<BottomSheetModal<ScheduleFilterSheetData>>;
  onApply: (filter: ScheduleFilter) => void;
};

export function ScheduleFilterSheet({ ref, onApply }: ScheduleFilterSheetProps) {
  return (
    <AppBottomSheet<ScheduleFilterSheetData> ref={ref}>
      {({ data }) => (
        <FilterContent initial={data?.filter ?? EMPTY_SCHEDULE_FILTER} onApply={onApply} />
      )}
    </AppBottomSheet>
  );
}

function FilterContent({
  initial,
  onApply,
}: {
  initial: ScheduleFilter;
  onApply: ScheduleFilterSheetProps['onApply'];
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();
  const patients = usePatients();
  const [filter, setFilter] = useState(initial);

  const patientOptions: SelectOption<string>[] = [
    { value: ALL_PATIENTS, label: 'All my patients' },
    ...patients.map((patient) => ({ value: patient.id, label: patient.name })),
  ];

  const toggleStatus = (label: string) => {
    const status = statusFromLabel(label);
    setFilter((current) => ({
      ...current,
      statuses: current.statuses.includes(status)
        ? current.statuses.filter((item) => item !== status)
        : [...current.statuses, status],
    }));
  };

  const close = () => dismiss();
  const reset = () => {
    haptics.selection();
    setFilter(EMPTY_SCHEDULE_FILTER);
  };
  const apply = () => {
    onApply(filter);
    dismiss();
  };

  return (
    <BottomSheetView style={{ paddingBottom: insets.bottom + Spacing.three }}>
      <SheetHeader title="Filter" onClose={close} />
      <View style={styles.body}>
        <View style={styles.field}>
          <Select
            label="Patient"
            options={patientOptions}
            value={filter.patientId ?? ALL_PATIENTS}
            onChange={(value) =>
              setFilter((current) => ({
                ...current,
                patientId: value === ALL_PATIENTS ? null : value,
              }))
            }
          />
          <ThemedText themeColor="textSecondary" style={styles.hint}>
            See one patient’s visits; open the month to find their days.
          </ThemedText>
        </View>
        <View style={styles.field}>
          <ThemedText themeColor="textSecondary" style={styles.label}>
            Status
          </ThemedText>
          <ChipGroup
            options={STATUS_LABELS}
            selected={filter.statuses.map((status) => VISIT_STATUS[status].label)}
            onToggle={toggleStatus}
            dotColors={STATUS_DOTS}
          />
        </View>
      </View>
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Button title="Reset" variant="secondary" style={styles.flex} onPress={reset} />
        <Button title="Show results" style={styles.flex} onPress={apply} />
      </View>
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  field: {
    gap: Spacing.two,
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
  footer: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  flex: {
    flex: 1,
  },
});

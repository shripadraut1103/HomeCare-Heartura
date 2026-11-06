import { BottomSheetView, useBottomSheetModal, type BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import type { Ref } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { ThemedText } from '@/components/ThemedText';
import { Icon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { Radius, Shadows, Spacing } from '@/constants/Theme';
import { PATIENT_STATUS, STATUS_ORDER, type StatusFilter } from '@/domain/patients/patientList';
import { useRequestCount } from '@/domain/requests/hooks/useRequests';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

export type PatientFilterSheetData = {
  status: StatusFilter;
  counts: Record<StatusFilter, number>;
};

type PatientFilterSheetProps = {
  ref: Ref<BottomSheetModal<PatientFilterSheetData>>;
  onChange: (status: StatusFilter) => void;
};

export function PatientFilterSheet({ ref, onChange }: PatientFilterSheetProps) {
  return (
    <AppBottomSheet<PatientFilterSheetData> ref={ref}>
      {({ data }) => (data ? <FilterContent {...data} onChange={onChange} /> : null)}
    </AppBottomSheet>
  );
}

function FilterContent({
  status,
  counts,
  onChange,
}: PatientFilterSheetData & Pick<PatientFilterSheetProps, 'onChange'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();
  const requests = useRequestCount('waiting');

  const choose = (next: StatusFilter) => {
    haptics.selection();
    onChange(next);
    dismiss();
  };

  const openRequests = () => {
    dismiss();
    router.push('/patient-requests');
  };

  const options: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    ...STATUS_ORDER.map((key) => ({ key, label: PATIENT_STATUS[key].filterLabel })),
  ];

  return (
    <BottomSheetView style={[styles.body, { paddingBottom: insets.bottom + Spacing.four }]}>
      <SheetHeader title="Filter patients" onClose={() => dismiss()} />
      <View style={styles.content}>
        <ThemedText
          themeColor="textSecondary"
          style={[styles.groupLabel, { backgroundColor: theme.surfaceMuted }]}>
          STATUS
        </ThemedText>
        <View
          style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
          {options.map((option) => (
            <FilterRow
              key={option.key}
              label={option.label}
              count={counts[option.key]}
              selected={option.key === status}
              onPress={() => choose(option.key)}
            />
          ))}
          <FilterRow label="Requests" count={requests} selected={false} onPress={openRequests} />
        </View>
      </View>
    </BottomSheetView>
  );
}

function FilterRow({
  label,
  count,
  selected,
  onPress,
}: {
  label: string;
  count: number;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label}, ${count}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.surfaceMuted }]}>
      <ThemedText style={styles.rowLabel}>{label}</ThemedText>
      <Pill label={count} color="primary" backgroundColor="toneBlueBg" />
      <View style={styles.check}>
        {selected ? (
          <Icon
            name={{ ios: 'checkmark', android: 'check' }}
            size={20}
            color={theme.textSecondary}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: Spacing.two,
  },
  content: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  groupLabel: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.small,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 600,
    letterSpacing: 1.2,
    overflow: 'hidden',
  },
  card: {
    paddingVertical: Spacing.one,
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    ...Shadows.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 56,
    paddingHorizontal: Spacing.four,
  },
  rowLabel: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 400,
  },
  check: {
    width: 22,
    alignItems: 'center',
  },
});

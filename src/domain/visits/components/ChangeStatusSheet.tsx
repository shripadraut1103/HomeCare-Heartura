import { BottomSheetView, useBottomSheetModal, type BottomSheetModal } from '@gorhom/bottom-sheet';
import { useState, type Ref } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { RadioList, type RadioOption } from '@/components/ui/RadioList';
import { Spacing } from '@/constants/Theme';
import type { VisitStatus } from '@/domain/visits/interfaces/VisitInterfaces';
import { setVisitStatus } from '@/domain/visits/store/VisitsReducer';
import { EDITABLE_VISIT_STATUSES, VISIT_STATUS } from '@/domain/visits/visitStatus';
import { useTheme } from '@/hooks/useTheme';
import { useAppDispatch } from '@/store/hooks';
import { haptics } from '@/utils/haptics';

export type ChangeStatusSheetData = { visitId: string; status: VisitStatus };

const OPTIONS: RadioOption<VisitStatus>[] = EDITABLE_VISIT_STATUSES.map((status) => ({
  value: status,
  label: VISIT_STATUS[status].label,
  dotColor: VISIT_STATUS[status].dot,
}));

export function ChangeStatusSheet({ ref }: { ref: Ref<BottomSheetModal<ChangeStatusSheetData>> }) {
  return (
    <AppBottomSheet<ChangeStatusSheetData> ref={ref} stackBehavior="push">
      {({ data }) => (data ? <ChangeStatusContent {...data} /> : null)}
    </AppBottomSheet>
  );
}

function ChangeStatusContent({ visitId, status }: ChangeStatusSheetData) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { dismiss } = useBottomSheetModal();
  const [selected, setSelected] = useState(status);

  const close = () => dismiss();
  const save = () => {
    if (selected !== status) {
      dispatch(setVisitStatus({ visitId, status: selected }));
      haptics.success();
    }
    dismiss();
  };

  return (
    <BottomSheetView style={{ paddingBottom: insets.bottom + Spacing.three }}>
      <SheetHeader title="Change status" onClose={close} />
      <View style={styles.body}>
        <ThemedText themeColor="textSecondary" style={styles.label}>
          Status
        </ThemedText>
        <RadioList options={OPTIONS} value={selected} onChange={setSelected} />
      </View>
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Button variant="secondary" title="Cancel" style={styles.cancel} onPress={close} />
        <Button title="Save" style={styles.save} onPress={save} />
      </View>
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 500,
    marginBottom: Spacing.one,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cancel: {
    flex: 1,
  },
  save: {
    flex: 2,
  },
});

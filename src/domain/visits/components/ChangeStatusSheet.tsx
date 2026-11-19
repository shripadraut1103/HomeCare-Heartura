import {
  BottomSheetTextInput,
  BottomSheetView,
  useBottomSheetModal,
  type BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { useState, type Ref } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { RadioList, type RadioOption } from '@/components/ui/RadioList';
import { TextField, type TextFieldProps } from '@/components/ui/TextField';
import { Spacing } from '@/constants/Theme';
import { EnvConfig } from '@/config/EnvConfig';
import { toApiVisitStatus } from '@/domain/visits/appointmentMapper';
import type { VisitStatus } from '@/domain/visits/interfaces/VisitInterfaces';
import {
  changeVisitStatusAction,
  fetchVisitAction,
} from '@/domain/visits/store/async-actions/VisitAsyncActions';
import { setVisitStatus } from '@/domain/visits/store/VisitsReducer';
import { EDITABLE_VISIT_STATUSES, VISIT_STATUS } from '@/domain/visits/visitStatus';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useVisit } from '@/domain/visits/hooks/useVisits';
import { useTheme } from '@/hooks/useTheme';
import { useAppDispatch } from '@/store/hooks';
import { haptics } from '@/utils/haptics';

const SheetTextInput = BottomSheetTextInput as NonNullable<TextFieldProps['InputComponent']>;
const NOTE_MAX_LENGTH = 500;

export type ChangeStatusSheetData = { visitId: string; status: VisitStatus; version?: number };

const OPTIONS: RadioOption<VisitStatus>[] = EDITABLE_VISIT_STATUSES.map((status) => ({
  value: status,
  label: VISIT_STATUS[status].label,
  dotColor: VISIT_STATUS[status].dot,
}));

export function ChangeStatusSheet({ ref }: { ref: Ref<BottomSheetModal<ChangeStatusSheetData>> }) {
  return (
    <AppBottomSheet<ChangeStatusSheetData>
      ref={ref}
      stackBehavior="push"
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize">
      {({ data }) => (data ? <ChangeStatusContent {...data} /> : null)}
    </AppBottomSheet>
  );
}

function ChangeStatusContent({ visitId, status, version: openedVersion }: ChangeStatusSheetData) {
  const version = useVisit(visitId)?.version ?? openedVersion;
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { dismiss } = useBottomSheetModal();
  const [selected, setSelected] = useState(status);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const close = () => dismiss();
  const fail = (message: string) => {
    haptics.error();
    dispatch(setToastMessage({ message, type: 'error' }));
  };

  const save = async () => {
    if (selected === status) return dismiss();
    if (!EnvConfig.apiUrl) {
      dispatch(setVisitStatus({ visitId, status: selected }));
      haptics.success();
      return dismiss();
    }
    const apiStatus = toApiVisitStatus(selected);
    if (!apiStatus || !version) return fail('This status can’t be changed here.');
    setSaving(true);
    const result = await dispatch(
      changeVisitStatusAction({
        visitId,
        status: apiStatus,
        version,
        ...(note.trim() ? { note: note.trim() } : {}),
      })
    );
    setSaving(false);
    const payload = changeVisitStatusAction.fulfilled.match(result) ? result.payload : null;
    if (!payload || 'error' in payload) {
      if (payload?.code === 'EDIT_CONFLICT') void dispatch(fetchVisitAction({ visitId }));
      return fail(payload?.error ?? 'Couldn’t change the status. Try again.');
    }
    haptics.success();
    dispatch(setToastMessage({ message: `Visit marked ${VISIT_STATUS[selected].label}` }));
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
        <View style={styles.noteField}>
          <TextField
            label="Note"
            labelHint="(optional)"
            value={note}
            onChangeText={setNote}
            maxLength={NOTE_MAX_LENGTH}
            placeholder="For example: patient was sick"
            multiline
            textAlignVertical="top"
            style={styles.note}
            InputComponent={SheetTextInput}
          />
        </View>
      </View>
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Button
          variant="secondary"
          title="Cancel"
          style={styles.cancel}
          disabled={saving}
          onPress={close}
        />
        <Button title="Save" style={styles.save} loading={saving} onPress={save} />
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
  noteField: {
    marginTop: Spacing.three,
  },
  note: {
    minHeight: 72,
    paddingTop: Spacing.three,
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

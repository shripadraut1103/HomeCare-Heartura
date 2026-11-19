import {
  BottomSheetScrollView,
  BottomSheetTextInput,
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
import { DateTimeField } from '@/components/ui/DateTimeField';
import { Select } from '@/components/ui/Select';
import { TextField, type TextFieldProps } from '@/components/ui/TextField';
import { Spacing } from '@/constants/Theme';
import { conflictsFrom } from '@/domain/schedule/bookingMapper';
import { CheckNotes, ConflictList } from '@/domain/schedule/components/BookingCheckSummary';
import { useBookingCheck, useSchedulingReference } from '@/domain/schedule/hooks/useBooking';
import type { ApiConflict, ApiPayer, ApiVisitType } from '@/domain/schedule/interfaces/BookingApi';
import { useVisit } from '@/domain/visits/hooks/useVisits';
import type { Visit } from '@/domain/visits/interfaces/VisitInterfaces';
import {
  fetchVisitAction,
  rescheduleVisitAction,
} from '@/domain/visits/store/async-actions/VisitAsyncActions';
import { useTheme } from '@/hooks/useTheme';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { confirm } from '@/utils/confirm';
import { formatRelativeDay, formatTime, toIsoDate, toTimeOfDay } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

const SheetTextInput = BottomSheetTextInput as NonNullable<TextFieldProps['InputComponent']>;
const MAX_LENGTH = 500;
const FAILED = 'Couldn’t reschedule the visit. Try again.';

export type RescheduleSheetData = { visitId: string };

export function RescheduleSheet({ ref }: { ref: Ref<BottomSheetModal<RescheduleSheetData>> }) {
  return (
    <AppBottomSheet<RescheduleSheetData>
      ref={ref}
      stackBehavior="push"
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize">
      {({ data }) => (data ? <RescheduleLoader visitId={data.visitId} /> : null)}
    </AppBottomSheet>
  );
}

function RescheduleLoader({ visitId }: RescheduleSheetData) {
  const visit = useVisit(visitId);
  return visit ? <RescheduleContent visit={visit} /> : null;
}

function durationOptions(rule: { min: number; max: number; step: number } | undefined) {
  if (!rule) return [];
  const options = [];
  for (let minutes = rule.min; minutes <= rule.max; minutes += Math.max(rule.step, 1)) {
    options.push({ value: String(minutes), label: `${minutes} min` });
  }
  return options;
}

function RescheduleContent({ visit }: { visit: Visit }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { dismiss } = useBottomSheetModal();
  const { reference } = useSchedulingReference();
  const [start, setStart] = useState(() => new Date(visit.startsAt));
  const [minutes, setMinutes] = useState(String(visit.durationMinutes));
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rejected, setRejected] = useState<{ key: string; conflicts: ApiConflict[] } | null>(null);
  const booking = visit.booking;

  const check = useBookingCheck(
    booking
      ? {
          patient: visit.patientId,
          provider: booking.providerId,
          service_code: booking.serviceCode,
          visit_type: booking.visitType as ApiVisitType,
          date: toIsoDate(start),
          start_time: toTimeOfDay(start),
          duration_min: Number(minutes),
          place_of_service: booking.placeOfService,
          address: booking.addressId,
          payer: booking.payer as ApiPayer,
          exclude: visit.id,
        }
      : null
  );
  const rejectedNow = rejected !== null && rejected.key === check.key;
  const conflicts = rejectedNow ? rejected.conflicts : (check.result?.conflicts ?? []);
  const needsOverride = rejectedNow || conflicts.length > 0;
  const noteMissing = !note.trim();
  const reasonMissing = needsOverride && !reason.trim();

  const setDay = (day: Date) =>
    setStart(
      (current) =>
        new Date(
          day.getFullYear(),
          day.getMonth(),
          day.getDate(),
          current.getHours(),
          current.getMinutes()
        )
    );

  const fail = (message: string) => {
    haptics.error();
    dispatch(setToastMessage({ message, type: 'error' }));
  };

  const save = async () => {
    if (!visit.version || !booking) return fail(FAILED);
    if (noteMissing || reasonMissing) {
      setShowErrors(true);
      haptics.error();
      return;
    }
    if (
      needsOverride &&
      !(await confirm({
        title: 'Reschedule anyway?',
        message: 'The new time overlaps another visit.',
        confirmLabel: 'Reschedule anyway',
      }))
    ) {
      return;
    }
    setSaving(true);
    const result = await dispatch(
      rescheduleVisitAction({
        visitId: visit.id,
        body: {
          version: visit.version,
          date: toIsoDate(start),
          start_time: toTimeOfDay(start),
          duration_min: Number(minutes),
          note: note.trim(),
          override_conflicts: needsOverride,
          conflict_reason: needsOverride ? reason.trim() : '',
        },
      })
    );
    setSaving(false);
    const payload = rescheduleVisitAction.fulfilled.match(result) ? result.payload : null;
    if (!payload || 'error' in payload) {
      if (payload?.code === 'SCHEDULE_CONFLICT') {
        setRejected({ key: check.key, conflicts: conflictsFrom(payload) ?? conflicts });
        return fail('The new time overlaps another visit. Add a reason to book anyway.');
      }
      if (payload?.code === 'EDIT_CONFLICT') void dispatch(fetchVisitAction({ visitId: visit.id }));
      return fail(payload?.error || FAILED);
    }
    void dispatch(fetchVisitAction({ visitId: visit.id }));
    haptics.success();
    dispatch(
      setToastMessage({
        message: `Visit rescheduled to ${formatRelativeDay(start)} at ${formatTime(start)}`,
      })
    );
    dismiss();
  };

  return (
    <BottomSheetScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.three }}>
      <SheetHeader title="Reschedule visit" onClose={() => dismiss()} />
      <View style={styles.body}>
        <ThemedText themeColor="textSecondary" style={styles.hint}>
          The current visit is kept as Rescheduled and a new visit is booked.
        </ThemedText>
        <View style={styles.pair}>
          <View style={styles.flex}>
            <DateTimeField
              label="Date"
              mode="date"
              required
              value={start}
              minimumDate={new Date()}
              onChange={setDay}
            />
          </View>
          <View style={styles.flex}>
            <DateTimeField
              label="Start time"
              mode="time"
              required
              value={start}
              onChange={setStart}
            />
          </View>
        </View>
        <Select
          label="Duration"
          required
          options={durationOptions(reference?.duration)}
          value={minutes}
          onChange={setMinutes}
        />
        <CheckNotes
          result={check.result}
          checking={check.checking}
          error={check.error}
          evvRequired={undefined}
        />
        {needsOverride ? (
          <>
            <ConflictList conflicts={conflicts} />
            <TextField
              label="Reason for booking anyway"
              required
              value={reason}
              onChangeText={setReason}
              maxLength={MAX_LENGTH}
              error={showErrors && reasonMissing ? 'Add a reason to book anyway' : undefined}
              InputComponent={SheetTextInput}
            />
          </>
        ) : null}
        <TextField
          label="Why is it moving?"
          required
          value={note}
          onChangeText={setNote}
          maxLength={MAX_LENGTH}
          error={showErrors && noteMissing ? 'Add a note' : undefined}
          placeholder="For example: family asked for the afternoon"
          multiline
          textAlignVertical="top"
          style={styles.note}
          InputComponent={SheetTextInput}
        />
      </View>
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Button
          variant="secondary"
          title="Cancel"
          style={styles.cancel}
          disabled={saving}
          onPress={() => dismiss()}
        />
        <Button
          title={needsOverride ? 'Reschedule anyway' : 'Reschedule'}
          style={styles.save}
          loading={saving}
          disabled={!booking}
          onPress={save}
        />
      </View>
    </BottomSheetScrollView>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
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
  flex: {
    flex: 1,
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

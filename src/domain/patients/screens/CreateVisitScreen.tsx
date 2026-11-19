import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { FormTextField } from '@/components/ui/FormTextField';
import { InfoNote } from '@/components/ui/InfoNote';
import { Select } from '@/components/ui/Select';
import { Spacing } from '@/constants/Theme';
import { ModalFormLayout } from '@/domain/profile/components/ModalFormLayout';
import {
  CheckNotes,
  ConflictList,
  UnitsTiles,
} from '@/domain/schedule/components/BookingCheckSummary';
import { PatientPicker } from '@/domain/schedule/components/PatientPicker';
import { useAppointmentForm } from '@/domain/schedule/hooks/useAppointmentForm';
import { parseIsoDate } from '@/utils/dateFormat';

type VisitFor = 'new' | 'cancelled' | 'rescheduled';

const VISIT_FOR: readonly { value: VisitFor; label: string; hint: string }[] = [
  {
    value: 'new',
    label: 'New appointment',
    hint: 'A visit with no earlier appointment behind it.',
  },
  {
    value: 'cancelled',
    label: 'Cancelled appointment',
    hint: 'Makes up for an appointment that was cancelled.',
  },
  {
    value: 'rescheduled',
    label: 'Rescheduled appointment',
    hint: 'Replaces an appointment that was moved to another time.',
  },
];

const DEFAULT_MINUTES = 45;

function durationOptions(rule: { min: number; max: number; step: number }, perUnit: number) {
  const options = [];
  for (let minutes = rule.min; minutes <= rule.max; minutes += Math.max(rule.step, 1)) {
    options.push({
      value: String(minutes),
      label: `${minutes} min · ${Math.floor(minutes / Math.max(perUnit, 1))} units`,
    });
  }
  return options;
}

export default function CreateVisitScreen() {
  const { patientId, date } = useLocalSearchParams<{ patientId?: string; date?: string }>();
  const [visitFor, setVisitFor] = useState<VisitFor>('new');
  const form = useAppointmentForm({
    date: date ? parseIsoDate(date) : undefined,
    patientId,
    startNow: true,
    duration: DEFAULT_MINUTES,
  });
  const { patient, scheduling, values } = form;
  const reference = scheduling.reference;
  const ready = Boolean(patient && form.plan && reference);
  const durations = reference
    ? durationOptions(reference.duration, reference.minutes_per_unit)
    : [];

  const setDay = (day: Date) => {
    form.changeDate(day);
    if (values.startTime) {
      form.set(
        'startTime',
        new Date(
          day.getFullYear(),
          day.getMonth(),
          day.getDate(),
          values.startTime.getHours(),
          values.startTime.getMinutes()
        )
      );
    }
  };

  // TODO: link makeup and rescheduled visits to the appointment they replace once the API has a field for it.
  const create = () =>
    form.submit(
      visitFor === 'new' ? undefined : VISIT_FOR.find((item) => item.value === visitFor)?.label
    );

  return (
    <ModalFormLayout
      title="Create Visit"
      footer={
        <>
          <Button
            title="Cancel"
            variant="secondary"
            style={styles.cancel}
            disabled={form.saving}
            onPress={() => router.back()}
          />
          <Button
            title={form.needsOverride ? 'Create Anyway' : 'Create Visit'}
            style={styles.submit}
            disabled={!form.canSubmit}
            loading={form.saving}
            accessibilityHint={form.canSubmit ? undefined : 'Fill in the required fields first'}
            onPress={create}
          />
        </>
      }>
      {!reference && scheduling.error ? (
        <View style={styles.field}>
          <ThemedText themeColor="error" style={styles.hint}>
            {scheduling.error}
          </ThemedText>
          <Button title="Try again" variant="secondary" onPress={scheduling.retry} />
        </View>
      ) : null}

      <View style={styles.field}>
        <Select
          label="Visit for"
          required
          options={VISIT_FOR}
          value={visitFor}
          onChange={setVisitFor}
        />
        <ThemedText themeColor="textSecondary" style={styles.hint}>
          {VISIT_FOR.find((item) => item.value === visitFor)?.hint}
        </ThemedText>
      </View>

      <PatientPicker
        selected={patient}
        onSelect={form.selectPatient}
        onClear={form.clearPatient}
        loading={Boolean(values.patientId) && !patient}
        error={form.planError ?? form.errors.patientId?.message}
      />

      <View
        pointerEvents={ready ? 'auto' : 'none'}
        style={[styles.details, !ready && styles.locked]}>
        <View style={styles.pair}>
          <View style={styles.flex}>
            <Select
              label="Service"
              required
              options={form.services}
              value={values.service}
              onChange={form.changeService}
              error={form.errors.service?.message}
              disabled={form.services.length < 2}
            />
          </View>
          <View style={styles.flex}>
            <Select
              label="Provider"
              required
              options={form.providers}
              value={values.provider}
              onChange={(value) => form.set('provider', value)}
              error={form.errors.provider?.message}
              disabled={form.providers.length < 2}
            />
          </View>
        </View>

        <Select
          label="Visit type"
          required
          options={form.visitTypes}
          value={values.visitType}
          onChange={(value) => form.set('visitType', value)}
          disabled={form.visitTypes.length < 2}
        />

        <View style={styles.field}>
          <Select
            label="Service location"
            required
            options={form.places}
            value={values.location}
            onChange={(value) => form.set('location', value)}
            error={form.errors.location?.message}
          />
          {values.location && form.evvRequired !== undefined ? (
            <InfoNote
              text={
                form.evvRequired
                  ? 'EVV required · clock in and out with GPS.'
                  : 'EVV exempt · no clock in needed.'
              }
            />
          ) : null}
        </View>

        <View style={styles.pair}>
          <View style={styles.flex}>
            <DateTimeField
              label="Date"
              mode="date"
              value={values.date}
              onChange={setDay}
              minimumDate={new Date()}
            />
          </View>
          <View style={styles.flex}>
            <DateTimeField
              label="Start time"
              mode="time"
              value={values.startTime}
              onChange={(time) => form.set('startTime', time)}
              error={form.errors.startTime?.message}
            />
          </View>
        </View>

        <Select
          label="Duration"
          required
          options={durations}
          value={values.duration || null}
          onChange={(value) => form.set('duration', value)}
          error={form.errors.duration?.message}
        />

        <View style={styles.field}>
          <Select
            label="Payer"
            required
            options={form.payers}
            value={values.payer}
            onChange={(value) => form.set('payer', value)}
            error={form.errors.payer?.message}
          />
          {ready && values.service && form.payers.length === 0 ? (
            <ThemedText themeColor="error" style={styles.hint}>
              No authorization covers this date and private pay is off for this patient.
            </ThemedText>
          ) : null}
        </View>

        {form.check.result?.units ? <UnitsTiles units={form.check.result.units} /> : null}

        <CheckNotes
          result={form.check.result}
          checking={form.check.checking}
          error={form.check.error}
          evvRequired={undefined}
        />

        {form.needsOverride ? (
          <>
            <ConflictList conflicts={form.conflicts} />
            <FormTextField
              control={form.control}
              name="conflictReason"
              label="Reason for booking anyway"
              required
              placeholder="For example: family asked for back-to-back visits"
              maxLength={500}
            />
          </>
        ) : null}
      </View>
    </ModalFormLayout>
  );
}

const styles = StyleSheet.create({
  cancel: {
    flex: 1,
  },
  submit: {
    flex: 2,
  },
  details: {
    gap: Spacing.four,
  },
  locked: {
    opacity: 0.45,
  },
  field: {
    gap: Spacing.one + Spacing.half,
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
});

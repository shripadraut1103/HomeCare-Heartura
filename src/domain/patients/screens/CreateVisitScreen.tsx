import { nanoid } from '@reduxjs/toolkit';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { Icon } from '@/components/ui/Icon';
import { InfoNote } from '@/components/ui/InfoNote';
import { Select } from '@/components/ui/Select';
import { Radius, Spacing } from '@/constants/Theme';
import { usePatientChart, usePatients } from '@/domain/patients/hooks/usePatients';
import type { Patient } from '@/domain/patients/interfaces/PatientInterfaces';
import {
  authorizationFor,
  payerLabel,
  unitCheck,
  unitsForMinutes,
  VISIT_DURATIONS,
} from '@/domain/patients/visitUnits';
import { ModalFormLayout } from '@/domain/profile/components/ModalFormLayout';
import { useProfile } from '@/domain/profile/hooks/useProfile';
import { findLocation, SERVICE_LOCATIONS } from '@/domain/schedule/appointmentOptions';
import { startOfWeek } from '@/domain/schedule/calendar';
import { PatientPicker } from '@/domain/schedule/components/PatientPicker';
import type { Visit } from '@/domain/visits/interfaces/VisitInterfaces';
import { addVisits, removeVisits } from '@/domain/visits/store/VisitsReducer';
import { useTheme } from '@/hooks/useTheme';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { formatNumericDate } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

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
const SLOT_MINUTES = 15;

const roundedNow = () => {
  const now = new Date();
  now.setMinutes(Math.floor(now.getMinutes() / SLOT_MINUTES) * SLOT_MINUTES, 0, 0);
  return now;
};

export default function CreateVisitScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const provider = useProfile();
  const patients = usePatients();
  const { patientId } = useLocalSearchParams<{ patientId?: string }>();
  const [visitFor, setVisitFor] = useState<VisitFor>('new');
  const [patient, setPatient] = useState<Patient | undefined>(() =>
    patients.find((item) => item.id === patientId)
  );
  const [location, setLocation] = useState<string | null>(patient?.serviceLocation ?? null);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [start, setStart] = useState(roundedNow);
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES);
  const chart = usePatientChart(patient?.id);

  const services = chart?.services.filter((service) => service.status !== 'ended') ?? [];
  const service = services.find((item) => item.id === serviceId) ?? services[0];
  const privatePay = service?.payer === 'Private pay';
  const payer = privatePay
    ? 'Private pay'
    : (patient?.payers.find(authorizationFor) ?? patient?.payers[0] ?? '');
  const authorization = privatePay ? undefined : authorizationFor(payer);
  const units = patient && authorization ? unitCheck(minutes, patient.units) : null;
  const evvRequired = findLocation(location)?.label.includes('EVV required') ?? false;
  const canCreate = Boolean(patient && service && location) && (units?.fits ?? true);

  const selectPatient = (next: Patient) => {
    setPatient(next);
    setLocation(next.serviceLocation);
    setServiceId(null);
  };

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

  const create = () => {
    if (!patient || !service || !canCreate) return;
    const place = findLocation(location);
    const visit: Visit = {
      id: `visit-${nanoid()}`,
      patientId: patient.id,
      patientName: patient.name,
      patientTag: patient.tag,
      startsAt: start.toISOString(),
      durationMinutes: minutes,
      status: 'scheduled',
      visitType: 'Daily visit',
      discipline: service.name,
      summary: [patient.discipline, 'Daily visit', place?.short].filter(Boolean).join(' · '),
      providerName: provider.name,
      location: place?.label ?? '',
      address: patient.address,
      phone: patient.phone,
      guardian: patient.guardian,
      payer,
      units: {
        summary: `${patient.units.usedThisWeek} of ${patient.units.authorizedPerWeek} this week · ${patient.units.remainingInclMakeup} remaining incl. makeup`,
        detail: `This visit: ${unitsForMinutes(minutes)} units (${minutes} min). Used when the note is saved.`,
      },
      notes:
        visitFor === 'new' ? undefined : VISIT_FOR.find((item) => item.value === visitFor)?.label,
    };
    // TODO: link cancelled and rescheduled visits to the appointment they replace once the API exists.
    dispatch(addVisits([visit]));
    dispatch(
      setToastMessage({
        message: `Visit created for ${patient.name}`,
        action: { label: 'Undo', onPress: removeVisits({ ids: [visit.id] }) },
      })
    );
    haptics.success();
    router.back();
  };

  return (
    <ModalFormLayout
      title="Create Visit"
      footer={
        <>
          <Button
            title="Cancel"
            variant="secondary"
            style={styles.cancel}
            onPress={() => router.back()}
          />
          <Button
            title="Create Visit"
            style={styles.submit}
            disabled={!canCreate}
            accessibilityHint={canCreate ? undefined : 'Fill in the required fields first'}
            onPress={create}
          />
        </>
      }>
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
        patients={patients}
        selected={patient}
        onSelect={selectPatient}
        onClear={() => setPatient(undefined)}
      />

      <View
        pointerEvents={patient ? 'auto' : 'none'}
        style={[styles.details, !patient && styles.locked]}>
        <View style={styles.pair}>
          <View style={styles.flex}>
            <Select
              label="Service"
              options={services.map((item) => ({ value: item.id, label: item.name }))}
              value={service?.id ?? null}
              onChange={setServiceId}
              disabled={services.length < 2}
            />
          </View>
          <View style={[styles.field, styles.flex]}>
            <ThemedText themeColor="textSecondary" style={styles.label}>
              Provider
            </ThemedText>
            <View
              accessible
              accessibilityLabel={`Provider, ${provider.name}`}
              style={[styles.provider, { borderColor: theme.border }]}>
              <ThemedText numberOfLines={1} style={styles.providerName}>
                {provider.name}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.field}>
          <Select
            label="Service location"
            required
            options={SERVICE_LOCATIONS}
            value={location}
            onChange={setLocation}
          />
          {location ? (
            <InfoNote
              text={
                evvRequired
                  ? 'EVV required · clock in and out with GPS.'
                  : 'EVV exempt · no clock in needed.'
              }
            />
          ) : null}
        </View>

        <View style={styles.pair}>
          <View style={styles.flex}>
            <DateTimeField label="Date" mode="date" value={start} onChange={setDay} />
          </View>
          <View style={styles.flex}>
            <DateTimeField label="Start time" mode="time" value={start} onChange={setStart} />
          </View>
        </View>

        <Select
          label="Duration"
          options={VISIT_DURATIONS.map((value) => ({
            value: String(value),
            label: `${value} min · ${unitsForMinutes(value)} units`,
          }))}
          value={String(minutes)}
          onChange={(value) => setMinutes(Number(value))}
        />

        <Select
          label="Payer"
          options={payer ? [{ value: payer, label: payerLabel(payer) }] : []}
          value={payer || null}
          onChange={() => {}}
          disabled
        />

        {patient && units && authorization ? (
          <View style={styles.field}>
            <ThemedText themeColor="textSecondary" style={styles.label}>
              Authorization {authorization} · week of {formatNumericDate(startOfWeek(start))}
            </ThemedText>
            <View style={styles.pair}>
              <View
                accessible
                accessibilityLabel={`${patient.units.usedThisWeek} of ${patient.units.authorizedPerWeek} this week`}
                style={[styles.tile, { backgroundColor: theme.surfaceMuted }]}>
                <ThemedText style={styles.tileValue}>
                  {patient.units.usedThisWeek} of {patient.units.authorizedPerWeek}
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.tileLabel}>
                  This week
                </ThemedText>
              </View>
              <View
                accessible
                accessibilityLabel={`${units.available} remaining including ${units.makeup} makeup`}
                style={[styles.tile, { backgroundColor: theme.surfaceMuted }]}>
                <ThemedText style={styles.tileValue}>{units.available}</ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.tileLabel}>
                  Remaining incl. makeup ({units.makeup})
                </ThemedText>
              </View>
            </View>
            <ThemedText themeColor="primary" style={styles.summary}>
              {patient.units.usedThisWeek} of {patient.units.authorizedPerWeek} this week ·{' '}
              {units.available} remaining incl. makeup
            </ThemedText>
            {!units.fits ? (
              <View style={styles.warning}>
                <Icon
                  name={{ ios: 'lock', android: 'lock' }}
                  size={18}
                  color={theme.textSecondary}
                />
                <ThemedText themeColor="textSecondary" style={styles.warningText}>
                  This visit needs {units.needed} units but only {units.available}{' '}
                  {units.available === 1 ? 'is' : 'are'} available now, and units can’t be used
                  before the week they’re released. Shorten it.
                </ThemedText>
              </View>
            ) : null}
          </View>
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
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 500,
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
  provider: {
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.medium,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  providerName: {
    fontSize: 17,
    lineHeight: 24,
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
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 400,
  },
  summary: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 600,
  },
  warning: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  warningText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: 400,
  },
});

import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Button } from '@/components/ui/Button';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { Select } from '@/components/ui/Select';
import { TextField } from '@/components/ui/TextField';
import type { Attachment } from '@/domain/communications/interfaces/CommunicationInterfaces';
import { SingleFileField } from '@/domain/patients/components/SingleFileField';
import { usePatient, usePatientChart } from '@/domain/patients/hooks/usePatients';
import type { CoverageLevel } from '@/domain/patients/interfaces/PatientInterfaces';
import {
  COVERAGE_LABELS,
  COVERAGE_LEVELS,
  nextCoverage,
  PAYERS,
  relationshipFor,
  SELF_SUFFIX,
} from '@/domain/patients/patientInsurance';
import { addInsurancePlan } from '@/domain/patients/store/PatientsReducer';
import { ModalFormLayout } from '@/domain/profile/components/ModalFormLayout';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { formatNumericDate } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

const COVERAGE_OPTIONS = COVERAGE_LEVELS.map((value) => ({ value, label: COVERAGE_LABELS[value] }));
const PAYER_OPTIONS = PAYERS.map(({ name }) => ({ value: name, label: name }));

export default function AddInsuranceScreen() {
  const dispatch = useAppDispatch();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const patient = usePatient(patientId);
  const chart = usePatientChart(patientId);
  const [coverage, setCoverage] = useState<CoverageLevel>(() =>
    nextCoverage(chart?.insurancePlans ?? [])
  );
  const [payer, setPayer] = useState(PAYERS[0].name);
  const [planName, setPlanName] = useState('');
  const [memberId, setMemberId] = useState('');
  const [subscriber, setSubscriber] = useState(() =>
    patient ? `${patient.name}${SELF_SUFFIX}` : ''
  );
  const [effectiveFrom, setEffectiveFrom] = useState<Date | null>(() => new Date());
  const [effectiveTo, setEffectiveTo] = useState<Date | null>(null);
  const [cardFront, setCardFront] = useState<Attachment | null>(null);
  const [cardBack, setCardBack] = useState<Attachment | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const isDirty =
    [planName, memberId].some((value) => value.trim() !== '') ||
    cardFront !== null ||
    cardBack !== null;
  const { leave } = useUnsavedChangesGuard(isDirty, 'This insurance hasn’t been saved.');

  const save = () => {
    if (!memberId.trim()) {
      setShowErrors(true);
      haptics.error();
      return;
    }
    // TODO: save to the insurance API and upload the card images once it exists.
    dispatch(
      addInsurancePlan({
        patientId,
        plan: {
          coverage,
          name: payer,
          memberId: memberId.trim(),
          relationship: relationshipFor(subscriber) || 'Self',
          planName: planName.trim() || undefined,
          planType: PAYERS.find((item) => item.name === payer)?.planType,
          effectiveStart: effectiveFrom ? formatNumericDate(effectiveFrom) : undefined,
          effectiveEnd: effectiveTo ? formatNumericDate(effectiveTo) : undefined,
          cardFront: cardFront?.uri,
          cardBack: cardBack?.uri,
        },
      })
    );
    haptics.success();
    dispatch(setToastMessage({ message: 'Insurance added' }));
    leave();
  };

  return (
    <ModalFormLayout
      title="Add insurance"
      footer={
        <>
          <Button
            title="Cancel"
            variant="secondary"
            style={styles.cancel}
            onPress={() => router.back()}
          />
          <Button title="Save" style={styles.save} onPress={save} />
        </>
      }>
      <Select
        label="Coverage"
        required
        options={COVERAGE_OPTIONS}
        value={coverage}
        onChange={setCoverage}
      />
      <Select label="Payer" required options={PAYER_OPTIONS} value={payer} onChange={setPayer} />
      <TextField
        label="Plan"
        value={planName}
        onChangeText={setPlanName}
        placeholder="e.g. Fee-for-service"
      />
      <TextField
        label="Member / Medicaid ID"
        required
        value={memberId}
        onChangeText={setMemberId}
        error={showErrors && !memberId.trim() ? 'Required' : undefined}
        autoCapitalize="characters"
        autoCorrect={false}
      />
      <TextField label="Subscriber" value={subscriber} onChangeText={setSubscriber} />
      <DateTimeField
        label="Effective from"
        mode="date"
        value={effectiveFrom}
        onChange={setEffectiveFrom}
      />
      <DateTimeField
        label="Effective to"
        mode="date"
        value={effectiveTo}
        onChange={setEffectiveTo}
        onClear={() => setEffectiveTo(null)}
      />
      <SingleFileField label="Insurance card · front" file={cardFront} onChange={setCardFront} />
      <SingleFileField label="Insurance card · back" file={cardBack} onChange={setCardBack} />
    </ModalFormLayout>
  );
}

const styles = StyleSheet.create({
  cancel: {
    flex: 1,
  },
  save: {
    flex: 2,
  },
});

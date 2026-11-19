import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { Button } from '@/components/ui/Button';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { Select } from '@/components/ui/Select';
import { TextField } from '@/components/ui/TextField';
import { useChartActions } from '@/domain/patients/hooks/useChartActions';
import { usePatientChart } from '@/domain/patients/hooks/usePatients';
import type {
  ApiCoverageOptions,
  ApiInsuredRelationship,
} from '@/domain/patients/interfaces/PatientApi';
import type { CoverageLevel } from '@/domain/patients/interfaces/PatientInterfaces';
import {
  COVERAGE_LABELS,
  COVERAGE_LEVELS,
  INSURED_RELATIONSHIPS,
  nextCoverage,
} from '@/domain/patients/patientInsurance';
import { fetchCoverageOptionsAction } from '@/domain/patients/store/async-actions/PatientAsyncActions';
import { ModalFormLayout } from '@/domain/profile/components/ModalFormLayout';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { toIsoDate } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

const COVERAGE_OPTIONS = COVERAGE_LEVELS.map((value) => ({ value, label: COVERAGE_LABELS[value] }));

export default function AddInsuranceScreen() {
  const dispatch = useAppDispatch();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const chart = usePatientChart(patientId);
  const actions = useChartActions(patientId);
  const [options, setOptions] = useState<ApiCoverageOptions | null>(null);
  const [coverage, setCoverage] = useState<CoverageLevel>(() =>
    nextCoverage(chart?.insurancePlans ?? [])
  );
  const [payer, setPayer] = useState<string | null>(null);
  const [planName, setPlanName] = useState('');
  const [memberId, setMemberId] = useState('');
  const [relationship, setRelationship] = useState<string>('self');
  const [effectiveFrom, setEffectiveFrom] = useState<Date | null>(() => new Date());
  const [effectiveTo, setEffectiveTo] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const isDirty = [planName, memberId].some((value) => value.trim() !== '') || payer !== null;
  const { leave } = useUnsavedChangesGuard(isDirty, 'This insurance hasn’t been saved.');

  useEffect(() => {
    void dispatch(fetchCoverageOptionsAction()).then((result) => {
      const payload = fetchCoverageOptionsAction.fulfilled.match(result) ? result.payload : null;
      if (payload && 'data' in payload) setOptions(payload.data);
      else
        dispatch(
          setToastMessage({ message: payload?.error || 'Couldn’t load payers.', type: 'error' })
        );
    });
  }, [dispatch]);

  const payerOptions = (options?.payers ?? []).map(({ value, label }) => ({ value, label }));
  const relationshipOptions = options?.insured_relationships.length
    ? options.insured_relationships
    : INSURED_RELATIONSHIPS;

  const save = async () => {
    if (!memberId.trim() || !payer) {
      setShowErrors(true);
      haptics.error();
      return;
    }
    const payerType = options?.payers.find((item) => item.value === payer)?.payer_type;
    const planType = options?.plan_types.some((item) => item.value === payerType)
      ? payerType
      : undefined;
    setSaving(true);
    const saved = await actions.addCoverage({
      payer,
      plan: planName.trim(),
      ...(planType ? { plan_type: planType } : {}),
      member_id: memberId.trim(),
      effective_start: effectiveFrom ? toIsoDate(effectiveFrom) : null,
      effective_end: effectiveTo ? toIsoDate(effectiveTo) : null,
      priority: coverage,
      insured_relationship: relationship as ApiInsuredRelationship,
    });
    setSaving(false);
    if (!saved) return;
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
          <Button
            title="Save"
            style={styles.save}
            loading={saving}
            disabled={saving}
            onPress={() => void save()}
          />
        </>
      }>
      <Select
        label="Coverage"
        required
        options={COVERAGE_OPTIONS}
        value={coverage}
        onChange={setCoverage}
      />
      <Select
        label="Payer"
        required
        placeholder={options ? 'Select' : 'Loading payers…'}
        disabled={!options}
        options={payerOptions}
        value={payer}
        onChange={setPayer}
        error={showErrors && !payer ? 'Choose a payer' : undefined}
      />
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
      <Select
        label="Relationship to the patient"
        options={relationshipOptions}
        value={relationship}
        onChange={setRelationship}
      />
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
      {/* TODO: add the insurance card front / back once the documents upload accepts card_front and card_back. */}
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

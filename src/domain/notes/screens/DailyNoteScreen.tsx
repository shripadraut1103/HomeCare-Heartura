import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { FloatingActionMenu } from '@/components/ui/FloatingActionMenu';
import { Icon } from '@/components/ui/Icon';
import { IconCircle } from '@/components/ui/IconCircle';
import { StepProgress } from '@/components/ui/StepProgress';
import { Radius, Shadows, Spacing } from '@/constants/Theme';
import {
  AddComponentSheet,
  type AddComponentSheetData,
} from '@/domain/notes/components/AddComponentSheet';
import { BillingCodesFields } from '@/domain/notes/components/BillingCodesFields';
import {
  CaregiverSignatureSheet,
  type CaregiverSignatureSheetData,
} from '@/domain/notes/components/CaregiverSignatureSheet';
import { EvvClockCard } from '@/domain/notes/components/EvvClockCard';
import { FormField } from '@/domain/notes/components/FormField';
import { IncidentReportSheet } from '@/domain/notes/components/IncidentReportSheet';
import { NoteEditorLayout, NoteNotFound } from '@/domain/notes/components/NoteEditorLayout';
import { NotePatientCard } from '@/domain/notes/components/NotePatientCard';
import { NoteSectionList } from '@/domain/notes/components/NoteSectionList';
import {
  getDefaultTemplateId,
  NoteTemplateSelect,
} from '@/domain/notes/components/NoteTemplateSelect';
import { VisitDetailsFields } from '@/domain/notes/components/VisitDetailsFields';
import {
  DAILY_NOTE,
  dailyNoteGoals,
  dailyNotePrefill,
  goalsSection,
  minutesBetween,
  unitsFor,
} from '@/domain/notes/dailyNote';
import { asText, useNoteForm } from '@/domain/notes/hooks/useNoteForm';
import {
  useDailyNoteDefaults,
  useNoteTemplates,
  usePendingNote,
} from '@/domain/notes/hooks/useNotes';
import type {
  IncidentReport,
  NoteField,
  NoteSection,
  Signature,
} from '@/domain/notes/interfaces/NoteInterfaces';
import { withComponents } from '@/domain/notes/noteComponents';
import { INTAKE_STEP, INTAKE_STEPS } from '@/domain/notes/noteRules';
import { IspSheet, type IspSheetData } from '@/domain/patients/components/IspSheet';
import { usePatient } from '@/domain/patients/hooks/usePatients';
import { addPatientIncident } from '@/domain/patients/store/PatientsReducer';
import { useTheme } from '@/hooks/useTheme';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import {
  formatNumericDate,
  formatRelativeDay,
  formatTime,
  formatTimeRange,
} from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

const DISCIPLINES: Record<string, string> = {
  PT: 'Physical therapy',
  OT: 'Occupational therapy',
  ST: 'Speech therapy',
};

const AUTHORIZATION = /PA \d+/;

const INCIDENTS_SECTION: Omit<NoteSection, 'fields'> = {
  id: 'incidents',
  title: 'Incident reports',
  accent: 'error',
};

export default function DailyNoteScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { id } = useLocalSearchParams<{ id: string }>();
  const note = usePendingNote(id);
  const patient = usePatient(note?.patientId);
  const defaults = useDailyNoteDefaults();
  const { templates, sections: baseSections, components } = useNoteTemplates('dailyNote');
  const [templateId, setTemplateId] = useState(() => getDefaultTemplateId(templates));
  const [addedIds, setAddedIds] = useState<readonly string[]>([]);
  const [signature, setSignature] = useState<Signature | null>(null);
  const [incidents, setIncidents] = useState<readonly IncidentReport[]>([]);
  const sections = [
    ...withComponents(baseSections, components, addedIds),
    goalsSection(note ? dailyNoteGoals(note, defaults.goals) : defaults.goals),
    ...(incidents.length > 0 ? [{ ...INCIDENTS_SECTION, fields: [] }] : []),
  ];
  const form = useNoteForm(sections, note ? dailyNotePrefill(note, defaults) : undefined);
  const { leave } = useUnsavedChangesGuard(
    form.isDirty || signature !== null || incidents.length > 0,
    'What you’ve entered in this daily note will be lost.'
  );
  const ispSheet = useRef<BottomSheetModal<IspSheetData>>(null);
  const signatureSheet = useRef<BottomSheetModal<CaregiverSignatureSheetData>>(null);
  const componentSheet = useRef<BottomSheetModal<AddComponentSheetData>>(null);
  const incidentSheet = useRef<BottomSheetModal>(null);

  const draft = note?.draft;
  if (!note || !draft) return <NoteNotFound title="Daily note" />;

  const visitAt = new Date(draft.visitAt);
  const start = new Date(asText(form.values[DAILY_NOTE.start]) || draft.visitAt);
  const end = new Date(asText(form.values[DAILY_NOTE.end]) || draft.visitAt);
  const minutes = minutesBetween(start.toISOString(), end.toISOString());
  const visitLabel = `${formatNumericDate(start)} · ${formatTimeRange(start, end)}`;
  const location = asText(form.values[DAILY_NOTE.location]);
  const authorization =
    patient?.payers.map((payer) => AUTHORIZATION.exec(payer)?.[0]).find(Boolean) ??
    (patient ? undefined : defaults.authorization);

  const summaryFields: NoteField[] = [
    { label: 'Patient', value: note.patientName },
    { label: 'Visit', value: visitLabel },
    { label: 'Provider', value: defaults.provider },
    { label: 'Diagnosis', value: asText(form.values[DAILY_NOTE.diagnosis]) || '—' },
    { label: 'Service location', value: location.split(' · ')[0] || '—' },
    { label: 'Duration', value: `${minutes} min · ${unitsFor(minutes)} units` },
    { label: 'Outcome', value: 'Hidden for your role' },
  ].flatMap(({ label, value }, index): NoteField[] => [
    ...(index > 0 ? [{ type: 'divider' } as const] : []),
    { type: 'readOnly', id: `dailyNote.summary.${label}`, label, value },
  ]);

  const saveDraft = () => {
    haptics.success();
    dispatch(setToastMessage({ message: 'Daily note saved as draft' }));
    leave();
  };

  const complete = () => {
    const valid = form.validate();
    const missing = [
      !asText(form.values[DAILY_NOTE.clockOut]) && 'clock out',
      !signature && 'caregiver signature',
    ].filter(Boolean);
    if (!valid || missing.length > 0) {
      haptics.error();
      if (!asText(form.values[DAILY_NOTE.clockOut])) form.expandSections(['evv']);
      if (missing.length > 0)
        dispatch(
          setToastMessage({
            message: `Add the ${missing.join(' and ')} before completing.`,
            type: 'warning',
          })
        );
      return;
    }
    // TEMPORARY: completes locally; submit to the notes service once the API exists.
    haptics.success();
    dispatch(setToastMessage({ message: 'Daily note completed' }));
    leave();
  };

  const addComponents = (componentIds: string[]) => {
    if (componentIds.length === 0) return;
    setAddedIds((current) => [...current, ...componentIds]);
    form.expandSections(
      components
        .filter((component) => componentIds.includes(component.id))
        .map((component) => component.sectionId)
    );
    haptics.success();
    dispatch(
      setToastMessage({
        message: componentIds.length === 1 ? 'Component added' : 'Components added',
      })
    );
  };

  const saveIncident = (incident: IncidentReport) => {
    // TODO: send the incident to the incidents API so the office is notified.
    setIncidents((current) => [...current, incident]);
    dispatch(
      addPatientIncident({
        patientId: note.patientId,
        incident: { ...incident, reportedBy: defaults.provider },
      })
    );
    form.expandSections([INCIDENTS_SECTION.id]);
    haptics.success();
    dispatch(setToastMessage({ message: 'Incident saved to the note' }));
  };

  const saveSignature = (next: Signature) => {
    setSignature(next);
    haptics.success();
    dispatch(setToastMessage({ message: 'Caregiver signature saved' }));
  };

  return (
    <NoteEditorLayout
      title="Daily note"
      subtitle={`${note.patientName} · ${formatTime(visitAt)}`}
      top={
        <StepProgress
          steps={INTAKE_STEPS}
          current={INTAKE_STEP.dailyNote}
          selectable={note.kind === 'dailyNote' ? [] : [INTAKE_STEP.carePlan]}
          onSelect={() => router.back()}
        />
      }
      banner={
        <NotePatientCard
          patientName={note.patientName}
          details={`${draft.discipline} · ${formatRelativeDay(visitAt)} · DOB ${draft.dateOfBirth}`}
          meta={draft.savedAt ? `Saved · ${formatTime(new Date(draft.savedAt))}` : undefined}
          avatarColor="accent"
          avatarBackground="toneTealBg"
          trailing={
            <Button
              title="ISP"
              variant="secondary"
              size="small"
              accessibilityLabel="Individual service plan"
              onPress={() =>
                ispSheet.current?.present({
                  patientId: note.patientId,
                  patientName: note.patientName,
                })
              }
              icon={
                <Icon
                  name={{ ios: 'doc', android: 'description' }}
                  size={18}
                  color={theme.primary}
                />
              }
              color="primary"
            />
          }
        />
      }
      overlay={
        <>
          <IspSheet ref={ispSheet} />
          <CaregiverSignatureSheet ref={signatureSheet} onSave={saveSignature} />
          <AddComponentSheet
            ref={componentSheet}
            sections={sections}
            grouped
            onAdd={addComponents}
          />
          <IncidentReportSheet ref={incidentSheet} onSave={saveIncident} />
        </>
      }
      floating={
        <FloatingActionMenu
          accessibilityLabel="Add to daily note"
          actions={[
            {
              key: 'component',
              icon: { ios: 'plus', android: 'add' },
              iconColor: 'primary',
              title: 'Add component',
              description: 'Add a section to this template',
              onPress: () =>
                componentSheet.current?.present({
                  available: components.filter((component) => !addedIds.includes(component.id)),
                }),
            },
            {
              key: 'incident',
              icon: { ios: 'exclamationmark.triangle', android: 'warning' },
              iconColor: 'toneAmberFg',
              title: 'Incident',
              description: 'Report a fall, injury or event',
              onPress: () => incidentSheet.current?.present(),
            },
          ]}
        />
      }
      footer={
        <View style={styles.actions}>
          <Button
            title="Save as draft"
            variant="secondary"
            style={styles.draft}
            onPress={saveDraft}
          />
          <Button title="Save & complete" style={styles.complete} onPress={complete} />
        </View>
      }>
      <EvvClockCard form={form} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          signature ? `Caregiver signature, signed by ${signature.signer}` : 'Caregiver signature'
        }
        onPress={() =>
          signatureSheet.current?.present({
            signer: note.patientName,
            service: DISCIPLINES[draft.discipline] ?? draft.discipline,
            performedOn: `${formatNumericDate(start)}, ${formatTimeRange(start, end)}`,
            signature: signature ?? undefined,
          })
        }
        style={({ pressed }) => [
          styles.signatureCard,
          { backgroundColor: theme.background, borderColor: theme.border },
          pressed && { backgroundColor: theme.surfaceMuted },
        ]}>
        <IconCircle
          icon={
            signature
              ? { ios: 'checkmark', android: 'check' }
              : { ios: 'signature', android: 'signature' }
          }
          color={signature ? 'success' : 'primary'}
          backgroundColor={signature ? 'successMuted' : 'primaryMuted'}
          size={48}
        />
        <View style={styles.signatureText}>
          <ThemedText style={styles.signatureTitle}>Caregiver signature</ThemedText>
          {signature ? (
            <ThemedText themeColor="textSecondary" numberOfLines={1} style={styles.signatureMeta}>
              Signed by {signature.signer} · {formatTime(new Date(signature.signedAt))}
            </ThemedText>
          ) : null}
        </View>
        <Icon
          name={{ ios: 'chevron.right', android: 'chevron_right' }}
          size={18}
          color={theme.textSecondary}
        />
      </Pressable>
      <NoteTemplateSelect templates={templates} value={templateId} onChange={setTemplateId} />
      <NoteSectionList
        sections={sections}
        form={form}
        bodies={{
          visit: (
            <VisitDetailsFields
              form={form}
              locations={defaults.serviceLocations}
              units={{
                used: patient?.units.usedThisWeek ?? 0,
                authorized: patient?.units.authorizedPerWeek ?? 0,
                weekOf: defaults.unitsWeekOf,
                authorization,
              }}
            />
          ),
          billing: (
            <BillingCodesFields
              form={form}
              codes={defaults.procedureCodes}
              authorized={authorization !== undefined}
            />
          ),
          summary: summaryFields.map((field, index) => (
            <FormField key={index} field={field} form={form} />
          )),
          incidents: incidents.map((incident, index) => (
            <View key={incident.id} style={styles.incident}>
              {index > 0 ? (
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
              ) : null}
              <ThemedText themeColor="textSecondary" style={styles.incidentTime}>
                {formatNumericDate(new Date(incident.occurredAt))} ·{' '}
                {formatTime(new Date(incident.occurredAt))}
              </ThemedText>
              <ThemedText style={styles.incidentText}>{incident.description}</ThemedText>
            </View>
          )),
        }}
      />
    </NoteEditorLayout>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  draft: {
    flex: 2,
  },
  complete: {
    flex: 3,
  },
  signatureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
    ...Shadows.card,
  },
  signatureText: {
    flex: 1,
  },
  signatureTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 600,
  },
  signatureMeta: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 400,
  },
  incident: {
    gap: Spacing.one,
  },
  incidentTime: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 600,
  },
  incidentText: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 400,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: Spacing.three,
  },
});

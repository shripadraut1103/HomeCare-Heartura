import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { StepProgress } from '@/components/ui/StepProgress';
import { Spacing } from '@/constants/Theme';
import {
  AddComponentSheet,
  type AddComponentSheetData,
} from '@/domain/notes/components/AddComponentSheet';
import {
  CopyFromPreviousSheet,
  type CopyFromPreviousSheetData,
} from '@/domain/notes/components/CopyFromPreviousSheet';
import { NoteEditorLayout, NoteNotFound } from '@/domain/notes/components/NoteEditorLayout';
import { NotePatientCard } from '@/domain/notes/components/NotePatientCard';
import { NoteSectionList } from '@/domain/notes/components/NoteSectionList';
import {
  getDefaultTemplateId,
  NoteTemplateSelect,
} from '@/domain/notes/components/NoteTemplateSelect';
import { useNoteForm } from '@/domain/notes/hooks/useNoteForm';
import { useNoteTemplates, usePendingNote } from '@/domain/notes/hooks/useNotes';
import type { PreviousNote } from '@/domain/notes/interfaces/NoteInterfaces';
import { withComponents } from '@/domain/notes/noteComponents';
import { carePlanPrefill, INTAKE_STEP, INTAKE_STEPS } from '@/domain/notes/noteRules';
import { IspSheet, type IspSheetData } from '@/domain/patients/components/IspSheet';
import { useTheme } from '@/hooks/useTheme';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { confirm } from '@/utils/confirm';
import { formatRelativeDay, formatTime } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

export default function CarePlanScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { id } = useLocalSearchParams<{ id: string }>();
  const note = usePendingNote(id);
  const { templates, sections: baseSections, components } = useNoteTemplates('carePlan');
  const [templateId, setTemplateId] = useState(() => getDefaultTemplateId(templates));
  const [addedIds, setAddedIds] = useState<readonly string[]>([]);
  const sections = withComponents(baseSections, components, addedIds);
  const form = useNoteForm(sections, note ? carePlanPrefill(note) : undefined);
  useUnsavedChangesGuard(form.isDirty, 'What you’ve entered in this care plan will be lost.');
  const ispSheet = useRef<BottomSheetModal<IspSheetData>>(null);
  const copySheet = useRef<BottomSheetModal<CopyFromPreviousSheetData>>(null);
  const componentSheet = useRef<BottomSheetModal<AddComponentSheetData>>(null);

  const draft = note?.draft;
  if (!note || !draft) return <NoteNotFound title="Care plan" />;

  const visitAt = new Date(draft.visitAt);

  const openDailyNote = () =>
    router.push({ pathname: '/daily-note/[id]', params: { id: note.id } });

  const saveAndContinue = () => {
    haptics.success();
    dispatch(setToastMessage({ message: 'Care plan saved as draft' }));
    openDailyNote();
  };

  const copyFrom = (previous: PreviousNote) => {
    const apply = () => {
      form.applyValues(previous.answers);
      haptics.success();
    };
    const overwrites = form.countOverwrites(previous.answers);
    if (overwrites === 0) {
      apply();
      return;
    }
    void confirm({
      title: 'Replace your answers?',
      message: `${overwrites} ${overwrites === 1 ? 'answer you’ve entered' : 'answers you’ve entered'} will be replaced with the ones from the ${previous.title.toLowerCase()} of ${previous.date}.`,
      confirmLabel: 'Replace',
      destructive: true,
    }).then((replace) => {
      if (replace) apply();
    });
  };

  // TEMPORARY: adds components to this note only; persist them to the template once the API exists.
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

  const completeAndSign = () => {
    if (!form.validate()) {
      haptics.error();
      return;
    }
  };

  return (
    <NoteEditorLayout
      title="Care plan"
      subtitle={`${note.patientName} · ${formatTime(visitAt)}`}
      top={
        <StepProgress
          steps={INTAKE_STEPS}
          current={INTAKE_STEP.carePlan}
          selectable={
            note.kind === 'evaluation'
              ? [INTAKE_STEP.evaluation, INTAKE_STEP.dailyNote]
              : [INTAKE_STEP.dailyNote]
          }
          onSelect={(index) => (index === INTAKE_STEP.dailyNote ? openDailyNote() : router.back())}
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
          <CopyFromPreviousSheet ref={copySheet} onPick={copyFrom} />
          <AddComponentSheet ref={componentSheet} sections={sections} onAdd={addComponents} />
        </>
      }
      floating={
        <FloatingActionButton
          accessibilityLabel="Add component"
          onPress={() =>
            componentSheet.current?.present({
              available: components.filter((component) => !addedIds.includes(component.id)),
            })
          }
        />
      }
      footer={
        <View style={styles.actions}>
          <Button
            title="Save as draft & continue to daily note"
            variant="secondary"
            onPress={saveAndContinue}
          />
          <Button
            title="Complete & sign"
            onPress={completeAndSign}
            icon={
              <Icon
                name={{ ios: 'signature', android: 'signature' }}
                size={20}
                color={theme.onPrimary}
              />
            }
          />
        </View>
      }>
      <View style={styles.templateRow}>
        <View style={styles.template}>
          <NoteTemplateSelect templates={templates} value={templateId} onChange={setTemplateId} />
        </View>
        <IconButton
          icon={{ ios: 'doc.on.doc', android: 'content_copy' }}
          accessibilityLabel="Copy from a previous care plan"
          onPress={() =>
            copySheet.current?.present({
              kind: 'carePlan',
              patientId: note.patientId,
              patientName: note.patientName,
            })
          }
        />
      </View>
      <NoteSectionList sections={sections} form={form} />
    </NoteEditorLayout>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: Spacing.three - Spacing.one,
  },
  templateRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.three - Spacing.one,
  },
  template: {
    flex: 1,
  },
});

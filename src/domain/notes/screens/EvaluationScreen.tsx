import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { StepProgress } from '@/components/ui/StepProgress';
import { Spacing } from '@/constants/Theme';
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
import { IspSheet, type IspSheetData } from '@/domain/patients/components/IspSheet';
import { useTheme } from '@/hooks/useTheme';
import { formatRelativeDay, formatTime } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

const INTAKE_STEPS = ['Evaluation', 'Care plan', 'Daily note'] as const;

export default function EvaluationScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const note = usePendingNote(id);
  const { templates, sections } = useNoteTemplates('evaluation');
  const [templateId, setTemplateId] = useState(() => getDefaultTemplateId(templates));
  const form = useNoteForm(sections, note?.draft?.prefill);
  const ispSheet = useRef<BottomSheetModal<IspSheetData>>(null);
  const copySheet = useRef<BottomSheetModal<CopyFromPreviousSheetData>>(null);

  const draft = note?.draft;
  if (!note || !draft) return <NoteNotFound title="Evaluation" />;

  const visitAt = new Date(draft.visitAt);

  const saveAndContinue = () => {
    haptics.success();
    router.back();
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
    Alert.alert(
      'Replace your answers?',
      `${overwrites} ${overwrites === 1 ? 'answer you’ve entered' : 'answers you’ve entered'} will be replaced with the ones from the ${previous.title.toLowerCase()} of ${previous.date}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Replace', style: 'destructive', onPress: apply },
      ]
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
      title="Evaluation"
      subtitle={`${note.patientName} · ${formatTime(visitAt)}`}
      top={<StepProgress steps={INTAKE_STEPS} current={0} />}
      banner={
        <NotePatientCard
          patientName={note.patientName}
          details={`${draft.discipline} · ${formatRelativeDay(visitAt)} · DOB ${draft.dateOfBirth}`}
          meta={draft.savedAt ? `Saved · ${formatTime(new Date(draft.savedAt))}` : undefined}
          avatarColor="tonePurpleFg"
          avatarBackground="tonePurpleBg"
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
        </>
      }
      floating={<FloatingActionButton accessibilityLabel="Add to evaluation" />}
      footer={
        <View style={styles.actions}>
          <Button
            title="Save as draft & continue to care plan"
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
          accessibilityLabel="Copy from a previous evaluation"
          onPress={() =>
            copySheet.current?.present({ patientId: note.patientId, patientName: note.patientName })
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

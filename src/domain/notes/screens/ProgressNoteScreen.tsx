import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Spacing } from '@/constants/Theme';
import { NoteEditorLayout, NoteNotFound } from '@/domain/notes/components/NoteEditorLayout';
import { NotePatientCard } from '@/domain/notes/components/NotePatientCard';
import { NoteSectionList } from '@/domain/notes/components/NoteSectionList';
import { NoteStatusPill } from '@/domain/notes/components/NoteStatusPill';
import {
  getDefaultTemplateId,
  NoteTemplateSelect,
} from '@/domain/notes/components/NoteTemplateSelect';
import { useNoteForm } from '@/domain/notes/hooks/useNoteForm';
import { useNoteTemplates, useProgressNoteDue } from '@/domain/notes/hooks/useNotes';
import { getProgressNoteStatus } from '@/domain/notes/noteStyles';
import { useTheme } from '@/hooks/useTheme';
import { formatRelativeDay, formatTime } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

export default function ProgressNoteScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const note = useProgressNoteDue(id);
  const { templates, sections } = useNoteTemplates('progress');
  const [templateId, setTemplateId] = useState(() => getDefaultTemplateId(templates));
  const form = useNoteForm(sections, note?.prefill);

  if (!note) return <NoteNotFound title="Progress note" />;

  const visitAt = new Date(note.visitAt);

  const saveDraft = () => {
    haptics.success();
    router.back();
  };

  const completeAndSign = () => {
    if (!form.validate()) {
      haptics.error();
      return;
    }
  };

  return (
    <NoteEditorLayout
      title="Progress note"
      subtitle={`${note.patientName} · ${formatTime(visitAt)}`}
      banner={
        <NotePatientCard
          patientName={note.patientName}
          details={`${note.discipline} · ${formatRelativeDay(visitAt)} · DOB ${note.dateOfBirth}`}
          trailing={<NoteStatusPill status={getProgressNoteStatus(note, 'Due')} />}
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
          <Button
            title="Complete & sign"
            style={styles.sign}
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
      <NoteTemplateSelect templates={templates} value={templateId} onChange={setTemplateId} />
      <NoteSectionList sections={sections} form={form} note={note} />
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
  sign: {
    flex: 3,
  },
});

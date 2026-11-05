import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/Theme';
import { FormField } from '@/domain/notes/components/FormField';
import { NoteSectionCard } from '@/domain/notes/components/NoteSectionCard';
import type { NoteForm } from '@/domain/notes/hooks/useNoteForm';
import type { NoteSection, ProgressNoteDue } from '@/domain/notes/interfaces/NoteInterfaces';

type NoteSectionListProps = {
  sections: readonly NoteSection[];
  form: NoteForm;
  note?: ProgressNoteDue;
  bodies?: Partial<Record<string, ReactNode>>;
};

export function NoteSectionList({ sections, form, note, bodies }: NoteSectionListProps) {
  return (
    <View style={styles.list}>
      {sections.map((section) => (
        <NoteSectionCard
          key={section.id}
          section={section}
          expanded={form.expanded.has(section.id)}
          onToggle={form.toggleSection}>
          {bodies?.[section.id]}
          {section.fields.map((field, index) => (
            <FormField key={index} field={field} note={note} form={form} />
          ))}
        </NoteSectionCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.three,
  },
});

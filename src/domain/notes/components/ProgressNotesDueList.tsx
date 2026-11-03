import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useRef } from 'react';
import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';

import { useTabBarSpace } from '@/components/AppTabs';
import { ThemedText } from '@/components/ThemedText';
import { InfoNote } from '@/components/ui/InfoNote';
import { Spacing } from '@/constants/Theme';
import { NoteCard } from '@/domain/notes/components/NoteCard';
import {
  ProgressNoteInfoSheet,
  type ProgressNoteInfoSheetData,
} from '@/domain/notes/components/ProgressNoteInfoSheet';
import type { ProgressNoteDue } from '@/domain/notes/interfaces/NoteInterfaces';
import { isProgressNoteDueNow, VISITS_PER_PROGRESS_NOTE } from '@/domain/notes/noteRules';
import { getProgressNoteStatus } from '@/domain/notes/noteStyles';

const DOCUMENT = { ios: 'doc', android: 'description' } as const;

const keyExtractor = (note: ProgressNoteDue) => note.id;

export function ProgressNotesDueList({ notes }: { notes: ProgressNoteDue[] }) {
  const tabBarSpace = useTabBarSpace();
  const infoSheet = useRef<BottomSheetModal<ProgressNoteInfoSheetData>>(null);

  const openNote = (note: ProgressNoteDue) =>
    isProgressNoteDueNow(note)
      ? router.push({ pathname: '/progress-note/[id]', params: { id: note.id } })
      : infoSheet.current?.present({ noteId: note.id });

  const renderNote: ListRenderItem<ProgressNoteDue> = ({ item }) => {
    const dueNow = isProgressNoteDueNow(item);
    return (
      <NoteCard
        icon={DOCUMENT}
        iconColor={dueNow ? 'toneAmberFg' : 'toneBlueFg'}
        iconBackground={dueNow ? 'toneAmberBg' : 'toneBlueBg'}
        title={`${item.patientName} · ${item.discipline}`}
        lines={
          item.treatedBy
            ? [item.details, `Treated by ${item.treatedBy} · you write the progress note`]
            : [item.details]
        }
        status={getProgressNoteStatus(item)}
        progress={item.visitsCompleted / item.visitsPerNote}
        onPress={() => openNote(item)}
      />
    );
  };

  return (
    <>
      <FlatList
        data={notes}
        keyExtractor={keyExtractor}
        renderItem={renderNote}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={
          <InfoNote
            text={`A progress note is created automatically at every ${VISITS_PER_PROGRESS_NOTE}th visit, as a draft for you to complete.`}
            style={styles.info}
          />
        }
        ListEmptyComponent={
          <ThemedText themeColor="textSecondary" style={styles.empty}>
            No progress notes due.
          </ThemedText>
        }
        contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}
        showsVerticalScrollIndicator={false}
      />
      <ProgressNoteInfoSheet ref={infoSheet} />
    </>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
  },
  info: {
    paddingBottom: Spacing.two,
  },
  separator: {
    height: Spacing.three - Spacing.one,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.five,
  },
});

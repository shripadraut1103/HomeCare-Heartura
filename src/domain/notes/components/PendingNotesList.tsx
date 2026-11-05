import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useRef } from 'react';
import { SectionList, StyleSheet, View, type SectionListRenderItem } from 'react-native';

import { useTabBarSpace } from '@/components/AppTabs';
import { InfoNote } from '@/components/ui/InfoNote';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Spacing } from '@/constants/Theme';
import {
  AssistantNoteReviewSheet,
  type AssistantNoteReviewSheetData,
} from '@/domain/notes/components/AssistantNoteReviewSheet';
import { NoteCard } from '@/domain/notes/components/NoteCard';
import type { PendingNote, PendingNoteOwner } from '@/domain/notes/interfaces/NoteInterfaces';
import { PENDING_NOTE_ICON, PENDING_NOTE_STATUS } from '@/domain/notes/noteStyles';

const SECTION_TITLES: Record<PendingNoteOwner, string> = {
  mine: 'My notes',
  assistant: 'Assistant notes to sign',
};

const OWNERS: readonly PendingNoteOwner[] = ['mine', 'assistant'];

type NoteSection = { owner: PendingNoteOwner; data: PendingNote[] };

const keyExtractor = (note: PendingNote) => note.id;

export function PendingNotesList({ notes }: { notes: PendingNote[] }) {
  const tabBarSpace = useTabBarSpace();
  const reviewSheet = useRef<BottomSheetModal<AssistantNoteReviewSheetData>>(null);

  const openNote = (note: PendingNote) => {
    if (note.review) reviewSheet.current?.present({ noteId: note.id });
    else if (note.kind === 'evaluation' && note.draft)
      router.push({ pathname: '/evaluation/[id]', params: { id: note.id } });
    else if (note.kind === 'carePlan' && note.draft)
      router.push({ pathname: '/care-plan/[id]', params: { id: note.id } });
    else if (note.kind === 'dailyNote' && note.draft)
      router.push({ pathname: '/daily-note/[id]', params: { id: note.id } });
  };

  const renderNote: SectionListRenderItem<PendingNote, NoteSection> = ({ item }) => (
    <NoteCard
      icon={PENDING_NOTE_ICON[item.kind]}
      iconColor="toneBlueFg"
      iconBackground="toneBlueBg"
      title={`${item.patientName} · ${item.label}`}
      lines={[item.details]}
      status={PENDING_NOTE_STATUS[item.status]}
      onPress={() => openNote(item)}
    />
  );

  const sections: NoteSection[] = OWNERS.map((owner) => ({
    owner,
    data: notes.filter((note) => note.owner === owner),
  })).filter((section) => section.data.length > 0);

  return (
    <>
      <SectionList
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={renderNote}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <SectionHeader title={SECTION_TITLES[section.owner]} count={section.data.length} />
          </View>
        )}
        ItemSeparatorComponent={Separator}
        ListFooterComponent={
          <InfoNote
            text="Evaluations and care plans saved as drafts count as pending until you submit them."
            style={styles.footnote}
          />
        }
        stickySectionHeadersEnabled={false}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}
        showsVerticalScrollIndicator={false}
      />
      <AssistantNoteReviewSheet ref={reviewSheet} />
    </>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.three,
  },
  sectionHeader: {
    paddingTop: Spacing.five,
    paddingBottom: Spacing.three,
  },
  separator: {
    height: Spacing.three - Spacing.one,
  },
  footnote: {
    paddingTop: Spacing.three,
  },
});

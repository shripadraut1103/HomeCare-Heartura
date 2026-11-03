import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SegmentedControl, type Segment } from '@/components/ui/SegmentedControl';
import { TabPanel } from '@/components/ui/TabPanel';
import { Spacing } from '@/constants/Theme';
import { PendingNotesList } from '@/domain/notes/components/PendingNotesList';
import { ProgressNotesDueList } from '@/domain/notes/components/ProgressNotesDueList';
import { usePendingNotes, useProgressNotesDue } from '@/domain/notes/hooks/useNotes';
import type { NotesTab } from '@/domain/notes/interfaces/NoteInterfaces';
import { VISITS_PER_PROGRESS_NOTE } from '@/domain/notes/noteRules';
import { useTheme } from '@/hooks/useTheme';

const TABS: readonly Segment<NotesTab>[] = [
  { value: 'pending', label: 'Pending notes' },
  { value: 'progress', label: 'Progress notes due' },
];

const TITLES: Record<NotesTab, string> = {
  pending: 'Pending notes',
  progress: 'Progress notes due',
};

export default function NotesScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<NotesTab>(params.tab === 'progress' ? 'progress' : 'pending');
  const pendingNotes = usePendingNotes();
  const progressNotes = useProgressNotesDue();

  const mine = pendingNotes.filter((note) => note.owner === 'mine').length;
  const subtitle =
    tab === 'pending'
      ? `${pendingNotes.length} waiting · ${mine} mine, ${pendingNotes.length - mine} to co-sign`
      : `${progressNotes.length} due · every ${VISITS_PER_PROGRESS_NOTE}th visit`;

  return (
    <ThemedView type="backgroundScreen" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.container}>
        <ScreenHeader title={TITLES[tab]} subtitle={subtitle} />
        <View
          style={[
            styles.tabs,
            { backgroundColor: theme.backgroundElement, borderBottomColor: theme.border },
          ]}>
          <SegmentedControl segments={TABS} value={tab} onChange={setTab} />
        </View>
        <TabPanel tab={tab}>
          {tab === 'pending' ? (
            <PendingNotesList notes={pendingNotes} />
          ) : (
            <ProgressNotesDueList notes={progressNotes} />
          )}
        </TabPanel>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabs: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

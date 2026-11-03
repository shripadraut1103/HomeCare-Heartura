import { BottomSheetView, useBottomSheetModal, type BottomSheetModal } from '@gorhom/bottom-sheet';
import type { Ref } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { DetailRow } from '@/components/ui/DetailRow';
import { Spacing } from '@/constants/Theme';
import { useProgressNoteDue } from '@/domain/notes/hooks/useNotes';
import { formatRelativeDay, formatTime } from '@/utils/dateFormat';

export type ProgressNoteInfoSheetData = { noteId: string };

export function ProgressNoteInfoSheet({
  ref,
}: {
  ref: Ref<BottomSheetModal<ProgressNoteInfoSheetData>>;
}) {
  return (
    <AppBottomSheet<ProgressNoteInfoSheetData> ref={ref}>
      {({ data }) => (data ? <ProgressNoteInfoContent {...data} /> : null)}
    </AppBottomSheet>
  );
}

function ProgressNoteInfoContent({ noteId }: ProgressNoteInfoSheetData) {
  const insets = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();
  const note = useProgressNoteDue(noteId);
  if (!note) return null;

  const nextVisit = new Date(note.visitAt);
  const rows = (
    [
      ['Visits', `${note.visitsCompleted} of ${note.visitsPerNote} since the last progress note`],
      ['Treated by', note.treatedBy],
      ['Next visit', `${formatRelativeDay(nextVisit)} · ${formatTime(nextVisit)}`],
      [
        'Who writes it',
        `You${note.treatedBy ? ', as the supervising therapist' : ''}. It is created as a draft at visit ${note.visitsPerNote}.`,
      ],
    ] satisfies [label: string, value: string | undefined][]
  ).filter((row): row is [string, string] => row[1] !== undefined);

  return (
    <BottomSheetView style={{ paddingBottom: insets.bottom + Spacing.three }}>
      <SheetHeader title={`Progress note · ${note.patientName}`} onClose={() => dismiss()} />
      <View style={styles.body}>
        {rows.map(([label, value], index) => (
          <DetailRow key={label} label={label} isLast={index === rows.length - 1}>
            {value}
          </DetailRow>
        ))}
      </View>
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
});

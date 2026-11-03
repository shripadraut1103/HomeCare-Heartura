import { BottomSheetView, useBottomSheetModal, type BottomSheetModal } from '@gorhom/bottom-sheet';
import type { Ref } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { ThemedText } from '@/components/ThemedText';
import { Icon } from '@/components/ui/Icon';
import { Radius, Shadows, Spacing } from '@/constants/Theme';
import { usePreviousEvaluations } from '@/domain/notes/hooks/useNotes';
import type { PreviousNote } from '@/domain/notes/interfaces/NoteInterfaces';
import { useTheme } from '@/hooks/useTheme';
import { getFirstName } from '@/utils/nameFormat';

const ICON_TILE_SIZE = 44;

export type CopyFromPreviousSheetData = { patientId: string; patientName: string };

type CopyFromPreviousSheetProps = {
  ref: Ref<BottomSheetModal<CopyFromPreviousSheetData>>;
  onPick: (note: PreviousNote) => void;
};

export function CopyFromPreviousSheet({ ref, onPick }: CopyFromPreviousSheetProps) {
  return (
    <AppBottomSheet<CopyFromPreviousSheetData> ref={ref}>
      {({ data }) => (data ? <PreviousList {...data} onPick={onPick} /> : null)}
    </AppBottomSheet>
  );
}

function PreviousList({
  patientId,
  patientName,
  onPick,
}: CopyFromPreviousSheetData & Pick<CopyFromPreviousSheetProps, 'onPick'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();
  const notes = usePreviousEvaluations(patientId);
  const chart = `${getFirstName(patientName)}’s chart`;

  const pick = (note: PreviousNote) => {
    dismiss();
    onPick(note);
  };

  return (
    <BottomSheetView style={{ paddingBottom: insets.bottom + Spacing.four }}>
      <SheetHeader title="Copy from a previous evaluation" onClose={() => dismiss()} />
      <View style={styles.body}>
        {notes.length === 0 ? (
          <ThemedText themeColor="textSecondary" style={styles.empty}>
            No earlier evaluations in {chart}.
          </ThemedText>
        ) : (
          <View
            style={[styles.list, { backgroundColor: theme.background, borderColor: theme.border }]}>
            {notes.map((note, index) => (
              <Pressable
                key={note.id}
                accessibilityRole="button"
                accessibilityHint="Copies its answers into this evaluation"
                onPress={() => pick(note)}
                style={({ pressed }) => [
                  styles.row,
                  index > 0 && [styles.divider, { borderTopColor: theme.border }],
                  pressed && { backgroundColor: theme.surfaceMuted },
                ]}>
                <View style={[styles.iconTile, { backgroundColor: theme.toneTealBg }]}>
                  <Icon
                    name={{ ios: 'doc', android: 'description' }}
                    size={22}
                    color={theme.accent}
                  />
                </View>
                <View style={styles.text}>
                  <ThemedText numberOfLines={1} style={styles.title}>
                    {note.title} · {note.date}
                  </ThemedText>
                  <ThemedText themeColor="textSecondary" numberOfLines={1} style={styles.meta}>
                    {note.status} · {chart}
                  </ThemedText>
                </View>
                <Icon
                  name={{ ios: 'chevron.right', android: 'chevron_right' }}
                  size={18}
                  color={theme.textSecondary}
                />
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  list: {
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    ...Shadows.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three - Spacing.one,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  iconTile: {
    width: ICON_TILE_SIZE,
    height: ICON_TILE_SIZE,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: 600,
  },
  meta: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: 400,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.four,
  },
});

import {
  BottomSheetScrollView,
  BottomSheetTextInput,
  useBottomSheetModal,
  type BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { useRef, useState, type ComponentRef, type Ref } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { DetailRow, detailValueTextStyle } from '@/components/ui/DetailRow';
import { DICTATION_BUTTON_SIZE, DictationButton } from '@/components/ui/DictationButton';
import { InfoNote } from '@/components/ui/InfoNote';
import { Pill } from '@/components/ui/Pill';
import { TextField, type TextFieldProps } from '@/components/ui/TextField';
import { Radius, Spacing } from '@/constants/Theme';
import { usePendingNote, usePendingNotes } from '@/domain/notes/hooks/useNotes';
import type { AssistantNoteReview } from '@/domain/notes/interfaces/NoteInterfaces';
import { removePendingNote, restorePendingNote } from '@/domain/notes/store/NotesReducer';
import { useTheme } from '@/hooks/useTheme';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { formatNumericDate, formatTime, formatTimeRange } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';
import { getFirstName } from '@/utils/nameFormat';

const SNAP_POINTS = ['92%'];
const SheetTextInput = BottomSheetTextInput as NonNullable<TextFieldProps['InputComponent']>;

export type AssistantNoteReviewSheetData = { noteId: string };

export function AssistantNoteReviewSheet({
  ref,
}: {
  ref: Ref<BottomSheetModal<AssistantNoteReviewSheetData>>;
}) {
  return (
    <AppBottomSheet<AssistantNoteReviewSheetData>
      ref={ref}
      snapPoints={SNAP_POINTS}
      enableDynamicSizing={false}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize">
      {({ data }) => (data ? <ReviewContent {...data} /> : null)}
    </AppBottomSheet>
  );
}

function ReviewContent({ noteId }: AssistantNoteReviewSheetData) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { dismiss } = useBottomSheetModal();
  const commentRef = useRef<ComponentRef<typeof TextInput>>(null);
  const current = usePendingNote(noteId);
  const pendingNotes = usePendingNotes();
  const [note] = useState(current);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState<string>();

  const review = note?.review;
  if (!note || !review) return null;

  const author = getFirstName(review.author);

  const finish = (message: string) => {
    const index = pendingNotes.findIndex((item) => item.id === noteId);
    dispatch(removePendingNote({ noteId }));
    dispatch(
      setToastMessage({
        message,
        action: { label: 'Undo', onPress: restorePendingNote({ note, index }) },
      })
    );
    haptics.success();
    dismiss();
  };

  const approve = () => finish(`Signed ${author}’s note for ${note.patientName}`);
  const sendBack = () => {
    if (comment.trim() === '') {
      setCommentError(`Tell ${author} what to fix before sending it back.`);
      haptics.error();
      commentRef.current?.focus();
      return;
    }
    finish(`Sent back to ${author}`);
  };

  return (
    <View style={styles.container}>
      <SheetHeader title={`Review · ${note.patientName}`} onClose={() => dismiss()} />

      <BottomSheetScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled">
        <View style={styles.statusRow}>
          <Pill label="Ready for supervisor" dot dotColor="text" />
          <ThemedText themeColor="textSecondary" numberOfLines={1} style={styles.noteType}>
            {review.noteType} · {review.discipline}
          </ThemedText>
        </View>

        <ReviewDetails review={review} />

        {review.sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.sectionText}>
              {section.text}
            </ThemedText>
          </View>
        ))}

        <TextField
          ref={commentRef}
          InputComponent={SheetTextInput}
          label={`Comment for ${author}`}
          labelHint="(required to send back)"
          labelStyle={styles.commentLabel}
          placeholder="e.g. Fix the procedure code, then sign again"
          value={comment}
          onChangeText={(text) => {
            setComment(text);
            if (commentError) setCommentError(undefined);
          }}
          error={commentError}
          multiline
          textAlignVertical="top"
          style={styles.comment}
          accessory={
            <DictationButton
              label={`comment for ${author}`}
              onPress={() => commentRef.current?.focus()}
            />
          }
        />

        <InfoNote
          icon={{ ios: 'lock', android: 'lock' }}
          text={
            <>
              You can’t edit an assistant’s note. <Strong>Approve & sign</Strong> adds your
              signature, name, title and license under {author}’s. <Strong>Send back</Strong>{' '}
              removes {author}’s signature; the note returns to their pending list with your
              comment.
            </>
          }
        />
      </BottomSheetScrollView>

      <View
        style={[
          styles.footer,
          { borderTopColor: theme.border, paddingBottom: insets.bottom + Spacing.three },
        ]}>
        <Button title="Send back" variant="secondary" style={styles.flex} onPress={sendBack} />
        <Button title="Approve & sign" style={styles.flex} onPress={approve} />
      </View>
    </View>
  );
}

function ReviewDetails({ review }: { review: AssistantNoteReview }) {
  const signedAt = new Date(review.signedAt);
  const start = new Date(review.visitStart);
  const end = new Date(start.getTime() + review.durationMinutes * 60_000);

  return (
    <View>
      <DetailRow label="Author">
        <ThemedText style={detailValueTextStyle}>{review.author}</ThemedText>
        <ThemedText themeColor="textSecondary" style={detailValueTextStyle}>
          Signed {formatNumericDate(signedAt)} {formatTime(signedAt)}
        </ThemedText>
      </DetailRow>
      <DetailRow label="Visit">
        <ThemedText style={detailValueTextStyle}>{formatNumericDate(start)}</ThemedText>
        <ThemedText style={detailValueTextStyle}>
          {formatTimeRange(start, end)} · {review.durationMinutes} min
        </ThemedText>
      </DetailRow>
      <DetailRow label="Billing">
        <ThemedText style={detailValueTextStyle}>
          {review.billing.code} · {review.billing.units} units
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={detailValueTextStyle}>
          {review.billing.authorization}
        </ThemedText>
      </DetailRow>
      <DetailRow label="Location">{review.location}</DetailRow>
    </View>
  );
}

function Strong({ children }: { children: string }) {
  return (
    <ThemedText themeColor="textSecondary" style={styles.strong}>
      {children}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  noteType: {
    flexShrink: 1,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 400,
  },
  section: {
    gap: Spacing.one,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 700,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 400,
  },
  commentLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 500,
  },
  comment: {
    minHeight: 96,
    paddingTop: Spacing.three - Spacing.one,
    paddingBottom: Spacing.three - Spacing.one,
    paddingRight: DICTATION_BUTTON_SIZE + Spacing.three,
    borderRadius: Radius.medium,
  },
  strong: {
    fontWeight: 700,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  flex: {
    flex: 1,
  },
});

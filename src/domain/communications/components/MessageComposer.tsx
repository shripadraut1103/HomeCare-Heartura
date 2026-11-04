import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Radius, Spacing } from '@/constants/Theme';
import {
  addAttachments,
  formatFileSize,
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENTS,
} from '@/domain/communications/attachments';
import { AttachmentTray } from '@/domain/communications/components/AttachmentTray';
import { EmojiSheet } from '@/domain/communications/components/EmojiSheet';
import {
  PhotoSourceSheet,
  type PhotoSource,
} from '@/domain/communications/components/PhotoSourceSheet';
import { useAttachmentPicker } from '@/domain/communications/hooks/useAttachmentPicker';
import type { Attachment } from '@/domain/communications/interfaces/CommunicationInterfaces';
import { useTheme } from '@/hooks/useTheme';
import type { ToastType } from '@/store/common-reducer/ToastReducer';
import { haptics } from '@/utils/haptics';

const SEND_SIZE = 52;
const INPUT_MAX_HEIGHT = 120;
const MAX_LENGTH = 2000;

type MessageComposerProps = {
  onSend: (body: string, attachments: Attachment[]) => void;
  onFocus?: () => void;
  onNotice: (message: string, type?: ToastType) => void;
};

export function MessageComposer({ onSend, onFocus, onNotice }: MessageComposerProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const picker = useAttachmentPicker();
  const photoSheet = useRef<BottomSheetModal>(null);
  const emojiSheet = useRef<BottomSheetModal>(null);
  const [text, setText] = useState('');
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const canSend = text.trim().length > 0 || attachments.length > 0;
  const room = MAX_ATTACHMENTS - attachments.length;

  const send = () => {
    if (!canSend) return;
    haptics.tap();
    onSend(text.trim(), attachments);
    setText('');
    setSelection({ start: 0, end: 0 });
    setAttachments([]);
  };

  const attach = (picked: Attachment[]) => {
    if (picked.length === 0) return;
    const result = addAttachments(attachments, picked);
    setAttachments(result.attachments);
    if (result.tooLarge > 0) {
      onNotice(`Files must be ${formatFileSize(MAX_ATTACHMENT_BYTES)} or smaller.`, 'warning');
    } else if (result.overLimit > 0) {
      onNotice(`You can attach up to ${MAX_ATTACHMENTS} items.`, 'warning');
    }
  };

  const run = async (pick: () => Promise<Attachment[]>) => {
    try {
      attach(await pick());
    } catch {
      onNotice('Couldn’t attach that. Please try again.', 'error');
    }
  };

  const ensureRoom = () => {
    if (room > 0) return true;
    onNotice(`You can attach up to ${MAX_ATTACHMENTS} items.`, 'warning');
    return false;
  };

  const openPhotos = () => {
    if (!ensureRoom()) return;
    Keyboard.dismiss();
    photoSheet.current?.present();
  };

  const pickPhotos = (source: PhotoSource) =>
    run(source === 'camera' ? picker.takePhoto : () => picker.pickImages(room));

  const pickFiles = () => {
    if (!ensureRoom()) return;
    void run(picker.pickDocuments);
  };

  const openEmoji = () => {
    Keyboard.dismiss();
    emojiSheet.current?.present();
  };

  const insertEmoji = (emoji: string) => {
    if (text.length + emoji.length > MAX_LENGTH) return;
    const start = Math.min(selection.start, text.length);
    const end = Math.min(selection.end, text.length);
    setText(text.slice(0, start) + emoji + text.slice(end));
    const cursor = start + emoji.length;
    setSelection({ start: cursor, end: cursor });
  };

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          paddingBottom: Math.max(insets.bottom, Spacing.three),
        },
      ]}>
      {attachments.length > 0 ? (
        <AttachmentTray
          attachments={attachments}
          onRemove={(id) => setAttachments((current) => current.filter((item) => item.id !== id))}
        />
      ) : null}
      <View style={styles.row}>
        <ComposerIcon
          icon={{ ios: 'paperclip', android: 'attach_file' }}
          label="Attach photo"
          onPress={openPhotos}
        />
        <ComposerIcon
          icon={{ ios: 'square.and.arrow.up', android: 'upload' }}
          label="Upload file"
          onPress={pickFiles}
        />
        <ComposerIcon
          icon={{ ios: 'face.smiling', android: 'mood' }}
          label="Emoji"
          onPress={openEmoji}
        />
        <TextInput
          accessibilityLabel="Message"
          value={text}
          onChangeText={setText}
          onSelectionChange={({ nativeEvent }) => setSelection(nativeEvent.selection)}
          onFocus={onFocus}
          placeholder="Message"
          placeholderTextColor={theme.textSecondary}
          multiline
          maxLength={MAX_LENGTH}
          style={[
            styles.input,
            { color: theme.text, backgroundColor: theme.surfaceMuted, borderColor: theme.border },
          ]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send"
          accessibilityState={{ disabled: !canSend }}
          disabled={!canSend}
          onPress={send}
          style={({ pressed }) => [
            styles.send,
            { backgroundColor: theme.primary },
            !canSend && styles.disabled,
            pressed && styles.pressed,
          ]}>
          <Icon
            name={{ ios: 'arrow.right', android: 'arrow_forward' }}
            size={22}
            color={theme.onPrimary}
          />
        </Pressable>
      </View>

      <PhotoSourceSheet ref={photoSheet} onPick={(source) => void pickPhotos(source)} />
      <EmojiSheet ref={emojiSheet} onSelect={insertEmoji} />
    </View>
  );
}

function ComposerIcon({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      style={({ pressed }) => [styles.icon, pressed && styles.pressed]}>
      <Icon name={icon} size={24} color={theme.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingTop: Spacing.three - Spacing.one,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  icon: {
    width: 40,
    height: SEND_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: SEND_SIZE,
    maxHeight: INPUT_MAX_HEIGHT,
    marginHorizontal: Spacing.one,
    paddingHorizontal: Spacing.three + Spacing.one,
    paddingTop: Spacing.three - Spacing.one,
    paddingBottom: Spacing.three - Spacing.one,
    borderRadius: Radius.large * 2,
    borderWidth: 1,
    fontSize: 17,
  },
  send: {
    width: SEND_SIZE,
    height: SEND_SIZE,
    borderRadius: SEND_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.6,
  },
});

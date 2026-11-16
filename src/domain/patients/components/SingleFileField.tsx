import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Icon } from '@/components/ui/Icon';
import { Radius, Spacing } from '@/constants/Theme';
import { formatFileSize } from '@/domain/communications/attachments';
import { useAttachmentPicker } from '@/domain/communications/hooks/useAttachmentPicker';
import type { Attachment } from '@/domain/communications/interfaces/CommunicationInterfaces';
import { FileSourceSheet, type FileSource } from '@/domain/patients/components/FileSourceSheet';
import { checkUploads, MAX_UPLOAD_BYTES, UPLOAD_TYPES } from '@/domain/patients/patientDocuments';
import { useTheme } from '@/hooks/useTheme';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { haptics } from '@/utils/haptics';

type SingleFileFieldProps = {
  label: string;
  file: Attachment | null;
  onChange: (file: Attachment | null) => void;
};

export function SingleFileField({ label, file, onChange }: SingleFileFieldProps) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const picker = useAttachmentPicker();
  const sourceSheet = useRef<BottomSheetModal>(null);
  const limit = formatFileSize(MAX_UPLOAD_BYTES);

  const pick = async (source: FileSource) => {
    try {
      const picked =
        source === 'files'
          ? await picker.pickDocuments(UPLOAD_TYPES)
          : source === 'camera'
            ? await picker.takePhoto()
            : await picker.pickImages(1);
      if (picked.length === 0) return;
      const [accepted] = checkUploads(picked.slice(0, 1)).accepted;
      if (accepted) onChange(accepted);
      else
        dispatch(
          setToastMessage({
            message: `Only PDF, JPG or PNG files up to ${limit} can be uploaded.`,
            type: 'warning',
          })
        );
    } catch {
      dispatch(
        setToastMessage({ message: 'Couldn’t add that file. Please try again.', type: 'error' })
      );
    }
  };

  return (
    <View style={styles.field}>
      <ThemedText themeColor="textSecondary" style={styles.label}>
        {label}
      </ThemedText>
      {file ? (
        <View style={[styles.file, { borderColor: theme.border }]}>
          <Icon
            name={
              file.kind === 'image'
                ? { ios: 'photo', android: 'image' }
                : { ios: 'doc.text', android: 'description' }
            }
            size={20}
            color={theme.primary}
          />
          <View style={styles.fileText}>
            <ThemedText numberOfLines={1} style={styles.fileName}>
              {file.name}
            </ThemedText>
            {file.size !== undefined ? (
              <ThemedText themeColor="textSecondary" style={styles.fileSize}>
                {formatFileSize(file.size)}
              </ThemedText>
            ) : null}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${file.name}`}
            hitSlop={8}
            onPress={() => onChange(null)}>
            <Icon name={{ ios: 'xmark', android: 'close' }} size={18} color={theme.textSecondary} />
          </Pressable>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label}: choose a file or take a photo`}
          accessibilityHint={`PDF, JPG or PNG, up to ${limit}`}
          onPress={() => {
            haptics.tap();
            sourceSheet.current?.present();
          }}
          style={({ pressed }) => [
            styles.drop,
            { backgroundColor: theme.toneBlueBg, borderColor: theme.border },
            pressed && styles.pressed,
          ]}>
          <View style={[styles.dropIcon, { backgroundColor: theme.background }]}>
            <Icon
              name={{ ios: 'square.and.arrow.up', android: 'upload' }}
              size={22}
              color={theme.primary}
            />
          </View>
          <ThemedText themeColor="primary" style={styles.dropTitle}>
            Choose a file or take a photo
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.dropHint}>
            PDF, JPG or PNG · up to {limit}
          </ThemedText>
        </Pressable>
      )}
      <FileSourceSheet ref={sourceSheet} onPick={(source) => void pick(source)} />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 500,
  },
  file: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.half,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  fileText: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 500,
  },
  fileSize: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 400,
  },
  drop: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.large,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  dropIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 600,
    textAlign: 'center',
  },
  dropHint: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 400,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});

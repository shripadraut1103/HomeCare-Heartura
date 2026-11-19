import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { Icon } from '@/components/ui/Icon';
import { Select } from '@/components/ui/Select';
import { TextField } from '@/components/ui/TextField';
import { Radius, Spacing } from '@/constants/Theme';
import { formatFileSize } from '@/domain/communications/attachments';
import { useAttachmentPicker } from '@/domain/communications/hooks/useAttachmentPicker';
import type { Attachment } from '@/domain/communications/interfaces/CommunicationInterfaces';
import { FileSourceSheet, type FileSource } from '@/domain/patients/components/FileSourceSheet';
import { usePatientDocuments } from '@/domain/patients/hooks/usePatientDocuments';
import type {
  ApiDocumentCategory,
  ApiDocumentSection,
} from '@/domain/patients/interfaces/PatientApi';
import {
  checkUploads,
  DOCUMENT_SECTIONS,
  DOCUMENT_TYPES,
  MAX_UPLOAD_BYTES,
  UPLOAD_TYPES,
} from '@/domain/patients/patientDocuments';
import { ModalFormLayout } from '@/domain/profile/components/ModalFormLayout';
import { useTheme } from '@/hooks/useTheme';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { setToastMessage, type ToastType } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { haptics } from '@/utils/haptics';

const LIBRARY_LIMIT = 10;

export default function UploadDocumentScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const picker = useAttachmentPicker();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const documents = usePatientDocuments(patientId);
  const sourceSheet = useRef<BottomSheetModal>(null);
  const [section, setSection] = useState<ApiDocumentSection>(DOCUMENT_SECTIONS[0].value);
  const [kind, setKind] = useState<ApiDocumentCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [documentDate, setDocumentDate] = useState<Date | null>(() => new Date());
  const [name, setName] = useState('');
  const [files, setFiles] = useState<readonly Attachment[]>([]);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const { leave } = useUnsavedChangesGuard(
    files.length > 0 || name.trim().length > 0 || kind !== null,
    'This document hasn’t been uploaded yet.'
  );

  const notice = (message: string, type?: ToastType) =>
    dispatch(setToastMessage({ message, type }));

  const addFiles = async (source: FileSource) => {
    try {
      const picked =
        source === 'files'
          ? await picker.pickDocuments(UPLOAD_TYPES)
          : source === 'camera'
            ? await picker.takePhoto()
            : await picker.pickImages(LIBRARY_LIMIT);
      if (picked.length === 0) return;
      const { accepted, rejected } = checkUploads(picked);
      setFiles((current) => [...current, ...accepted]);
      if (rejected > 0)
        notice(
          `Only PDF, JPG or PNG files up to ${formatFileSize(MAX_UPLOAD_BYTES)} can be uploaded.`,
          'warning'
        );
    } catch {
      notice('Couldn’t add that file. Please try again.', 'error');
    }
  };

  const upload = async () => {
    if (!kind || files.length === 0) {
      setShowErrors(true);
      haptics.error();
      return;
    }
    setSaving(true);
    const uploaded = await documents.upload(
      files,
      { section, category: kind, name, documentDate },
      uploadedCount
    );
    setSaving(false);
    if (uploaded === 0) return;
    notice(uploaded === 1 ? 'Document uploaded' : `${uploaded} documents uploaded`);
    if (uploaded === files.length) leave();
    else {
      setUploadedCount((count) => count + uploaded);
      setFiles((current) => current.slice(uploaded));
    }
  };

  return (
    <ModalFormLayout
      title="Upload document"
      footer={
        <>
          <Button
            title="Cancel"
            variant="secondary"
            style={styles.cancel}
            onPress={() => router.back()}
          />
          <Button
            title="Upload"
            style={styles.submit}
            loading={saving}
            disabled={saving}
            onPress={() => void upload()}
          />
        </>
      }>
      <Select
        label="Section"
        required
        options={DOCUMENT_SECTIONS}
        value={section}
        onChange={setSection}
      />
      <Select
        label="Type"
        required
        placeholder="Select"
        options={DOCUMENT_TYPES}
        value={kind}
        onChange={setKind}
        error={showErrors && !kind ? 'Choose a type' : undefined}
      />
      <DateTimeField
        label="Document date"
        mode="date"
        value={documentDate}
        onChange={setDocumentDate}
        onClear={() => setDocumentDate(null)}
      />
      <TextField
        label="Name"
        value={name}
        onChangeText={setName}
        placeholder="Defaults to the file name"
      />

      <View style={styles.field}>
        <ThemedText themeColor="textSecondary" style={styles.label}>
          Files<ThemedText themeColor="error">{'  *'}</ThemedText>
        </ThemedText>
        {files.length > 0 ? (
          <View style={[styles.files, { borderColor: theme.border }]}>
            {files.map((file, index) => (
              <View
                key={file.id}
                style={[
                  styles.file,
                  index > 0 && [styles.divider, { borderTopColor: theme.border }],
                ]}>
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
                  onPress={() =>
                    setFiles((current) => current.filter((item) => item.id !== file.id))
                  }>
                  <Icon
                    name={{ ios: 'xmark', android: 'close' }}
                    size={18}
                    color={theme.textSecondary}
                  />
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choose files or take a photo"
          accessibilityHint="PDF, JPG or PNG, up to 10 MB each"
          onPress={() => {
            haptics.tap();
            sourceSheet.current?.present();
          }}
          style={({ pressed }) => [
            styles.drop,
            {
              backgroundColor: theme.toneBlueBg,
              borderColor: showErrors && files.length === 0 ? theme.error : theme.border,
            },
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
            {files.length > 0 ? 'Add more files' : 'Choose files or take a photo'}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.dropHint}>
            PDF, JPG or PNG · up to {formatFileSize(MAX_UPLOAD_BYTES)} each
          </ThemedText>
        </Pressable>
        {showErrors && files.length === 0 ? (
          <ThemedText themeColor="error" style={styles.label}>
            Add at least one file
          </ThemedText>
        ) : null}
      </View>

      <FileSourceSheet ref={sourceSheet} onPick={(source) => void addFiles(source)} />
    </ModalFormLayout>
  );
}

const styles = StyleSheet.create({
  cancel: {
    flex: 1,
  },
  submit: {
    flex: 2,
  },
  field: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 500,
  },
  files: {
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  file: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.half,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
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
    paddingVertical: Spacing.five,
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

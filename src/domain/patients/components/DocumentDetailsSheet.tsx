import { BottomSheetView, useBottomSheetModal, type BottomSheetModal } from '@gorhom/bottom-sheet';
import type { Ref } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { Button } from '@/components/ui/Button';
import { DetailRow } from '@/components/ui/DetailRow';
import { Pill } from '@/components/ui/Pill';
import { Spacing } from '@/constants/Theme';
import type { PatientDocument } from '@/domain/patients/interfaces/PatientInterfaces';
import { DOCUMENT_STATUS } from '@/domain/patients/patientDocuments';
import { useTheme } from '@/hooks/useTheme';

export type DocumentDetailsSheetData = { document: PatientDocument };

type DocumentDetailsSheetProps = {
  ref: Ref<BottomSheetModal<DocumentDetailsSheetData>>;
  onOpenFile: (document: PatientDocument) => void;
};

export function DocumentDetailsSheet({ ref, onOpenFile }: DocumentDetailsSheetProps) {
  return (
    <AppBottomSheet<DocumentDetailsSheetData> ref={ref}>
      {({ data }) => (data ? <DetailsContent {...data} onOpenFile={onOpenFile} /> : null)}
    </AppBottomSheet>
  );
}

function DetailsContent({
  document,
  onOpenFile,
}: DocumentDetailsSheetData & Pick<DocumentDetailsSheetProps, 'onOpenFile'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();
  const status = DOCUMENT_STATUS[document.status];

  return (
    <BottomSheetView style={{ paddingBottom: insets.bottom + Spacing.three }}>
      <SheetHeader title={document.title} onClose={() => dismiss()} />
      <View style={styles.body}>
        <DetailRow label="Status">
          <Pill label={status.label} dot color={status.color} backgroundColor={status.background} />
        </DetailRow>
        <DetailRow label="Type">{document.kind}</DetailRow>
        <DetailRow label="From">{document.author}</DetailRow>
        <DetailRow label="Document date">{document.documentDate ?? '—'}</DetailRow>
        <DetailRow label="Uploaded">{document.date}</DetailRow>
        <DetailRow label="Section">{document.section ?? '—'}</DetailRow>
        <DetailRow label="File" isLast>
          {document.fileName ?? '—'}
        </DetailRow>
      </View>
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Button
          title="Open file"
          variant="secondary"
          style={styles.flex}
          onPress={() => onOpenFile(document)}
        />
        <Button title="Done" style={styles.flex} onPress={() => dismiss()} />
      </View>
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
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

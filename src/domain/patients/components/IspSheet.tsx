import {
  BottomSheetScrollView,
  useBottomSheetModal,
  type BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import type { Ref } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { DetailRow } from '@/components/ui/DetailRow';
import { Icon } from '@/components/ui/Icon';
import { InfoNote } from '@/components/ui/InfoNote';
import { Pill } from '@/components/ui/Pill';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Spacing } from '@/constants/Theme';
import { useIsp } from '@/domain/patients/hooks/useIsp';
import { useTheme } from '@/hooks/useTheme';

const MAX_HEIGHT_RATIO = 0.9;

export type IspSheetData = { patientId: string; patientName: string };

export function IspSheet({ ref }: { ref: Ref<BottomSheetModal<IspSheetData>> }) {
  const { height } = useWindowDimensions();

  return (
    <AppBottomSheet<IspSheetData> ref={ref} maxDynamicContentSize={height * MAX_HEIGHT_RATIO}>
      {({ data }) => (data ? <IspContent {...data} /> : null)}
    </AppBottomSheet>
  );
}

function IspContent({ patientId, patientName }: IspSheetData) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();
  const isp = useIsp(patientId);
  const planYear = isp ? `${isp.planStart} – ${isp.planEnd}` : '';

  const openDocuments = () => {
    dismiss();
    router.navigate({
      pathname: '/patient/[id]/visits',
      params: { id: patientId, tab: 'documents' },
    });
  };

  return (
    <View>
      <SheetHeader title={`ISP · ${patientName}`} onClose={() => dismiss()} />
      <BottomSheetScrollView contentContainerStyle={styles.body}>
        {isp ? (
          <>
            <View style={styles.intro}>
              <Pill label="Current" dot color="success" backgroundColor="successMuted" />
              <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                Individual Service Plan · {planYear}
              </ThemedText>
            </View>
            <View>
              <DetailRow label="Plan year">{planYear}</DetailRow>
              <DetailRow label="Signed">{isp.signedOn}</DetailRow>
              <DetailRow label="Services">{isp.services}</DetailRow>
              <DetailRow label="File" isLast>
                <View style={styles.file}>
                  <Icon
                    name={{ ios: 'doc', android: 'description' }}
                    size={18}
                    color={theme.textSecondary}
                  />
                  <ThemedText style={styles.fileName}>{isp.fileName}</ThemedText>
                </View>
              </DetailRow>
            </View>
            <View style={styles.section}>
              <SectionLabel title="Outcomes" />
              {isp.outcomes.map((outcome, index) => (
                <View key={outcome} style={styles.item}>
                  <ThemedText style={[styles.itemText, styles.marker]}>{index + 1}.</ThemedText>
                  <ThemedText style={[styles.itemText, styles.flex]}>{outcome}</ThemedText>
                </View>
              ))}
            </View>
            <View style={styles.section}>
              <SectionLabel title="Risks and supports" />
              {isp.risks.map((risk) => (
                <View key={risk} style={styles.item}>
                  <ThemedText style={[styles.itemText, styles.marker]}>•</ThemedText>
                  <ThemedText style={[styles.itemText, styles.flex]}>{risk}</ThemedText>
                </View>
              ))}
            </View>
            <InfoNote
              collapsible
              text={
                isp.older.length > 0
                  ? `Read only. Older ISPs (${isp.older
                      .map((older) => `${older.label} · signed ${older.signedOn}`)
                      .join('; ')}) are in Documents.`
                  : 'Read only. The support coordinator updates the ISP.'
              }
            />
          </>
        ) : (
          <ThemedText themeColor="textSecondary" style={styles.empty}>
            No ISP on file for {patientName}.
          </ThemedText>
        )}
      </BottomSheetScrollView>
      <View
        style={[
          styles.footer,
          { borderTopColor: theme.border, paddingBottom: insets.bottom + Spacing.three },
        ]}>
        <Button
          title="Older ISPs · Documents"
          variant="secondary"
          style={styles.documents}
          onPress={openDocuments}
        />
        <Button title="Done" style={styles.flex} onPress={() => dismiss()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
  },
  intro: {
    gap: Spacing.three,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 400,
  },
  file: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  fileName: {
    flexShrink: 1,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 400,
  },
  section: {
    gap: Spacing.two,
  },
  item: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingLeft: Spacing.two,
  },
  marker: {
    minWidth: 18,
  },
  itemText: {
    fontSize: 17,
    lineHeight: 26,
    fontWeight: 400,
  },
  flex: {
    flex: 1,
  },
  documents: {
    flex: 2,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.five,
  },
});

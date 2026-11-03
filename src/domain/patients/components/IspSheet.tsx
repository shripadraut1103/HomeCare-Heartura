import {
  BottomSheetScrollView,
  useBottomSheetModal,
  type BottomSheetModal,
} from '@gorhom/bottom-sheet';
import type { Ref } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { ThemedText } from '@/components/ThemedText';
import { CopyButton } from '@/components/ui/CopyButton';
import { Icon } from '@/components/ui/Icon';
import { Spacing } from '@/constants/Theme';
import { useIsp } from '@/domain/patients/hooks/useIsp';
import type { IspSection } from '@/domain/patients/interfaces/PatientInterfaces';
import { useTheme } from '@/hooks/useTheme';

const SNAP_POINTS = ['92%'];

export type IspSheetData = { patientId: string; patientName: string };

export function IspSheet({ ref }: { ref: Ref<BottomSheetModal<IspSheetData>> }) {
  return (
    <AppBottomSheet<IspSheetData> ref={ref} snapPoints={SNAP_POINTS} enableDynamicSizing={false}>
      {({ data }) => (data ? <IspContent {...data} /> : null)}
    </AppBottomSheet>
  );
}

function IspContent({ patientId, patientName }: IspSheetData) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();
  const isp = useIsp(patientId);

  return (
    <View style={styles.container}>
      <SheetHeader title={`ISP · ${patientName}`} onClose={() => dismiss()} />
      <BottomSheetScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + Spacing.four }]}>
        {isp ? (
          <>
            <View style={[styles.document, { borderBottomColor: theme.border }]}>
              <Icon name={{ ios: 'doc', android: 'description' }} size={18} color={theme.primary} />
              <ThemedText themeColor="textSecondary" style={styles.documentText}>
                <ThemedText themeColor="textSecondary" style={styles.documentName}>
                  Individual Service Plan
                </ThemedText>
                {` · signed ${isp.signedOn}`}
              </ThemedText>
            </View>
            {isp.sections.map((section, index) => (
              <IspSectionView
                key={section.title}
                section={section}
                isLast={index === isp.sections.length - 1}
              />
            ))}
          </>
        ) : (
          <ThemedText themeColor="textSecondary" style={styles.empty}>
            No ISP on file for {patientName}.
          </ThemedText>
        )}
      </BottomSheetScrollView>
    </View>
  );
}

function IspSectionView({ section, isLast }: { section: IspSection; isLast: boolean }) {
  const theme = useTheme();

  return (
    <View
      style={[styles.section, !isLast && [styles.divider, { borderBottomColor: theme.border }]]}>
      <View style={styles.sectionHeader}>
        <ThemedText accessibilityRole="header" style={styles.sectionTitle}>
          {section.title}
        </ThemedText>
        <CopyButton text={section.lines.join('\n')} label={section.title.toLowerCase()} />
      </View>
      <View>
        {section.lines.map((line) => (
          <ThemedText key={line} themeColor="textSecondary" style={styles.line}>
            {line}
          </ThemedText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    paddingHorizontal: Spacing.four,
  },
  document: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  documentText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 400,
  },
  documentName: {
    fontWeight: 700,
  },
  section: {
    paddingVertical: Spacing.four - Spacing.one,
    gap: Spacing.three,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  sectionTitle: {
    flexShrink: 1,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 700,
  },
  line: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: 400,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.five,
  },
});

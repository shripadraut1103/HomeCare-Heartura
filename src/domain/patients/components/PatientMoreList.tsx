import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Radius, Spacing, type ThemeColor } from '@/constants/Theme';
import { PatientCardShell } from '@/domain/patients/components/PatientCardShell';
import {
  PatientInfoSheet,
  type PatientInfoKind,
  type PatientInfoSheetData,
} from '@/domain/patients/components/PatientInfoSheet';
import type { Patient, PatientChart } from '@/domain/patients/interfaces/PatientInterfaces';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

const TILE_SIZE = 48;

type RowTarget = { info: PatientInfoKind } | { tab: 'clinical' | 'visits' };

type Row = {
  key: string;
  icon: IconName;
  color: ThemeColor;
  background: ThemeColor;
  title: string;
  subtitle: string;
  target: RowTarget;
};

export function PatientMoreList({ patient, chart }: { patient: Patient; chart: PatientChart }) {
  const theme = useTheme();
  const infoSheet = useRef<BottomSheetModal<PatientInfoSheetData>>(null);
  const select = (target: RowTarget) => {
    haptics.selection();
    if ('info' in target) infoSheet.current?.present({ patientId: patient.id, kind: target.info });
    else if (target.tab === 'clinical')
      router.navigate({
        pathname: '/patient/[id]/clinical',
        params: { id: patient.id, section: 'history' },
      });
    else
      router.navigate({
        pathname: '/patient/[id]/visits',
        params: { id: patient.id, tab: 'documents' },
      });
  };

  const rows: Row[] = [
    {
      key: 'details',
      icon: { ios: 'person', android: 'person' },
      color: 'toneBlueFg',
      background: 'toneBlueBg',
      title: 'Patient details',
      subtitle: 'Name · Date of birth · Sex',
      target: { info: 'details' },
    },
    ...(chart.groupHome
      ? [
          {
            key: 'groupHome',
            icon: { ios: 'person.2', android: 'group' },
            color: 'toneAmberFg',
            background: 'toneAmberBg',
            title: 'Group home',
            subtitle: chart.groupHome.agency,
            target: { info: 'groupHome' },
          } satisfies Row,
        ]
      : []),
    {
      key: 'contact',
      icon: { ios: 'mappin.and.ellipse', android: 'location_on' },
      color: 'accent',
      background: 'toneTealBg',
      title: 'Address & phone',
      subtitle: patient.address,
      target: { info: 'contact' },
    },
    {
      key: 'allergies',
      icon: { ios: 'exclamationmark.triangle', android: 'warning' },
      color: 'tonePurpleFg',
      background: 'tonePurpleBg',
      title: 'Allergies',
      subtitle: chart.allergies.map((allergy) => allergy.name).join(', ') || 'No known allergies',
      target: { info: 'allergies' },
    },
    {
      key: 'insurance',
      icon: { ios: 'shield', android: 'shield' },
      color: 'toneRoseFg',
      background: 'toneRoseBg',
      title: 'Insurance',
      subtitle: chart.insurance.primary,
      target: { info: 'insurance' },
    },
    {
      key: 'notes',
      icon: { ios: 'doc', android: 'description' },
      color: 'success',
      background: 'successMuted',
      title: 'Notes',
      subtitle: chart.notes[0]?.text ?? 'No notes yet',
      target: { info: 'notes' },
    },
    {
      key: 'history',
      icon: { ios: 'clock', android: 'schedule' },
      color: 'toneBlueFg',
      background: 'toneBlueBg',
      title: 'Patient history',
      subtitle: 'Past history, read only',
      target: { tab: 'clinical' },
    },
    {
      key: 'documents',
      icon: { ios: 'doc', android: 'description' },
      color: 'toneAmberFg',
      background: 'toneAmberBg',
      title: 'Documents',
      subtitle: 'ISPs, referrals, reports',
      target: { tab: 'visits' },
    },
  ];

  return (
    <>
      <PatientCardShell>
        {rows.map((row, index) => (
          <Pressable
            key={row.key}
            accessibilityRole="button"
            accessibilityLabel={`${row.title}, ${row.subtitle}`}
            onPress={() => select(row.target)}
            style={({ pressed }) => [
              styles.row,
              index > 0 && [styles.divider, { borderTopColor: theme.border }],
              pressed && { backgroundColor: theme.surfaceMuted },
            ]}>
            <View style={[styles.tile, { backgroundColor: theme[row.background] }]}>
              <Icon name={row.icon} size={22} color={theme[row.color]} />
            </View>
            <View style={styles.text}>
              <ThemedText style={styles.title}>{row.title}</ThemedText>
              <ThemedText themeColor="textSecondary" numberOfLines={1} style={styles.subtitle}>
                {row.subtitle}
              </ThemedText>
            </View>
            <Icon
              name={{ ios: 'chevron.right', android: 'chevron_right' }}
              size={18}
              color={theme.textSecondary}
            />
          </Pressable>
        ))}
      </PatientCardShell>
      <PatientInfoSheet ref={infoSheet} />
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: Spacing.half,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 500,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 400,
  },
});

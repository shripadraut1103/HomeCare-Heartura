import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router, useLocalSearchParams } from 'expo-router';
import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';
import { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFloatingTabBarStyle } from '@/components/AppTabs';
import { TabBarButton } from '@/components/navigation/TabBarButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Spacing } from '@/constants/Theme';
import { IspSheet, type IspSheetData } from '@/domain/patients/components/IspSheet';
import { usePatient } from '@/domain/patients/hooks/usePatients';
import { ageFrom, PATIENT_STATUS } from '@/domain/patients/patientList';
import { useTheme } from '@/hooks/useTheme';

const AVATAR_SIZE = 52;

export default function PatientLayout() {
  const theme = useTheme();
  const barStyle = useFloatingTabBarStyle();
  const { id } = useLocalSearchParams<{ id: string }>();
  const patient = usePatient(id);
  const ispSheet = useRef<BottomSheetModal<IspSheetData>>(null);

  if (!patient) {
    return (
      <ThemedView type="backgroundScreen" style={styles.container}>
        <SafeAreaView edges={['top']}>
          <ScreenHeader title="Patient" />
          <ThemedText themeColor="textSecondary" style={styles.missing}>
            This patient isn’t in your caseload any more.
          </ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView type="backgroundScreen" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={12}
            onPress={() => router.back()}
            style={styles.back}>
            <Icon
              name={{ ios: 'chevron.left', android: 'arrow_back_ios' }}
              size={20}
              color={theme.text}
            />
          </Pressable>
          <Avatar
            name={patient.name}
            size={AVATAR_SIZE}
            color="toneBlueFg"
            backgroundColor="toneBlueBg"
          />
          <View style={styles.headerText}>
            <ThemedText accessibilityRole="header" numberOfLines={1} style={styles.name}>
              {patient.name}
            </ThemedText>
            <ThemedText themeColor="textSecondary" numberOfLines={1} style={styles.meta}>
              {ageFrom(patient.dateOfBirth)} yrs • {patient.code} •{' '}
              {PATIENT_STATUS[patient.status].label}
            </ThemedText>
          </View>
          <Button
            title="ISP"
            variant="secondary"
            size="small"
            accessibilityLabel="Individual service plan"
            color="primary"
            onPress={() =>
              ispSheet.current?.present({ patientId: patient.id, patientName: patient.name })
            }
            icon={
              <Icon name={{ ios: 'doc', android: 'description' }} size={18} color={theme.primary} />
            }
          />
        </View>

        <Tabs style={styles.container}>
          <TabSlot />
          <TabList style={barStyle}>
            <TabTrigger name="index" href={{ pathname: '/patient/[id]', params: { id } }} asChild>
              <TabBarButton
                label="Overview"
                icon={{ ios: 'square.grid.2x2', android: 'grid_view' }}
              />
            </TabTrigger>
            <TabTrigger
              name="documentation"
              href={{ pathname: '/patient/[id]/documentation', params: { id } }}
              asChild>
              <TabBarButton label="Documentation" icon={{ ios: 'doc', android: 'description' }} />
            </TabTrigger>
            <TabTrigger
              name="clinical"
              href={{ pathname: '/patient/[id]/clinical', params: { id } }}
              asChild>
              <TabBarButton
                label="Clinical"
                icon={{ ios: 'waveform.path.ecg', android: 'monitor_heart' }}
              />
            </TabTrigger>
            <TabTrigger
              name="visits"
              href={{ pathname: '/patient/[id]/visits', params: { id } }}
              asChild>
              <TabBarButton label="Visits" icon={{ ios: 'calendar', android: 'calendar_month' }} />
            </TabTrigger>
            <TabTrigger
              name="more"
              href={{ pathname: '/patient/[id]/more', params: { id } }}
              asChild>
              <TabBarButton label="More" icon={{ ios: 'ellipsis', android: 'more_horiz' }} />
            </TabTrigger>
          </TabList>
        </Tabs>
      </SafeAreaView>
      <IspSheet ref={ispSheet} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  back: {
    padding: Spacing.one,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: 700,
  },
  meta: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 400,
  },
  missing: {
    textAlign: 'center',
    paddingVertical: Spacing.five,
  },
});

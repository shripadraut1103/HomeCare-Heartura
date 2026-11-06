import { ScrollView, StyleSheet } from 'react-native';

import { useTabBarSpace } from '@/components/AppTabs';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Spacing } from '@/constants/Theme';
import { PatientMoreList } from '@/domain/patients/components/PatientMoreList';
import { useRoutePatient } from '@/domain/patients/hooks/usePatients';

export default function PatientMoreScreen() {
  const tabBarSpace = useTabBarSpace();
  const { patient, chart } = useRoutePatient();
  if (!patient || !chart) return null;

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}
      showsVerticalScrollIndicator={false}>
      <SectionLabel title="More" />
      <PatientMoreList patient={patient} chart={chart} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
});

import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View, type ListRenderItem } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTabBarSpace } from '@/components/AppTabs';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { SearchField } from '@/components/ui/SearchField';
import { Radius, Spacing } from '@/constants/Theme';
import { PatientCard } from '@/domain/patients/components/PatientCard';
import {
  PatientFilterSheet,
  type PatientFilterSheetData,
} from '@/domain/patients/components/PatientFilterSheet';
import { usePatients } from '@/domain/patients/hooks/usePatients';
import type { Patient, PatientSort } from '@/domain/patients/interfaces/PatientInterfaces';
import {
  countByStatus,
  PATIENT_STATUS,
  visiblePatients,
  type StatusFilter,
} from '@/domain/patients/patientList';
import { useProfile } from '@/domain/profile/hooks/useProfile';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

const CONTENT_MAX_WIDTH = 720;
const FILTER_SIZE = 52;

const SORT_LABEL: Record<PatientSort, string> = { name: 'name', age: 'age' };

const keyExtractor = (patient: Patient) => patient.id;

export default function PatientsScreen() {
  const theme = useTheme();
  const tabBarSpace = useTabBarSpace();
  const { agency } = useProfile();
  const patients = usePatients();
  const filterSheet = useRef<BottomSheetModal<PatientFilterSheetData>>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('active');
  const [sort, setSort] = useState<PatientSort>('name');

  const counts = countByStatus(patients);
  const visible = visiblePatients(patients, status, query, sort);
  const statusLabel = status === 'all' ? 'all' : PATIENT_STATUS[status].label;
  const filtered = status !== 'active';

  const openPatient = (patient: Patient) =>
    router.push({ pathname: '/patient/[id]', params: { id: patient.id } });

  const toggleSort = () => {
    haptics.selection();
    setSort((current) => (current === 'name' ? 'age' : 'name'));
  };

  const renderPatient: ListRenderItem<Patient> = ({ item }) => (
    <PatientCard patient={item} onPress={openPatient} />
  );

  return (
    <ThemedView type="backgroundScreen" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.header}>
          <ThemedText accessibilityRole="header" style={styles.title}>
            Patients
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            {agency.name} • {patients.length} patients
          </ThemedText>
        </View>

        <View style={styles.controls}>
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder="Search name, ID or Medicaid ID"
            style={styles.search}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Filter patients, showing ${statusLabel}`}
            onPress={() => {
              haptics.tap();
              filterSheet.current?.present({ status, counts });
            }}
            style={({ pressed }) => [
              styles.filter,
              {
                backgroundColor: filtered ? theme.primaryMuted : theme.toneBlueBg,
                borderColor: filtered ? theme.primary : theme.border,
              },
              pressed && styles.pressed,
            ]}>
            <Icon
              name={{ ios: 'line.3.horizontal.decrease', android: 'filter_list' }}
              size={22}
              color={theme.primary}
            />
          </Pressable>
        </View>

        <View style={styles.listHeader}>
          <ThemedText themeColor="textSecondary" style={styles.count}>
            {visible.length} {visible.length === 1 ? 'PATIENT' : 'PATIENTS'} ·{' '}
            {statusLabel.toUpperCase()}
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Sort by ${SORT_LABEL[sort]}`}
            accessibilityHint={`Sorts by ${SORT_LABEL[sort === 'name' ? 'age' : 'name']} instead`}
            hitSlop={8}
            onPress={toggleSort}
            style={({ pressed }) => [styles.sort, pressed && styles.pressed]}>
            <Icon name={{ ios: 'list.bullet', android: 'sort' }} size={18} color={theme.accent} />
            <ThemedText themeColor="accent" style={styles.sortLabel}>
              Sort: {SORT_LABEL[sort]}
            </ThemedText>
          </Pressable>
        </View>

        <Animated.FlatList
          data={visible}
          keyExtractor={keyExtractor}
          renderItem={renderPatient}
          itemLayoutAnimation={LinearTransition.duration(180)}
          ItemSeparatorComponent={Separator}
          ListEmptyComponent={
            <EmptyState
              message={
                query ? `No patients match “${query.trim()}”.` : `No ${statusLabel} patients.`
              }
            />
          }
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>

      <PatientFilterSheet ref={filterSheet} onChange={setStatus} />
    </ThemedView>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    gap: Spacing.half,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 700,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 400,
  },
  controls: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
  },
  search: {
    flex: 1,
  },
  filter: {
    width: FILTER_SIZE,
    height: FILTER_SIZE,
    borderRadius: Radius.medium,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listHeader: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  count: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 700,
    letterSpacing: 1,
  },
  sort: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + Spacing.half,
  },
  sortLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 500,
  },
  pressed: {
    opacity: 0.6,
  },
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.one,
  },
  separator: {
    height: Spacing.three,
  },
});

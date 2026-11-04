import { useRef, useState, type ComponentRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { Radius, Shadows, Spacing } from '@/constants/Theme';
import type { Patient } from '@/domain/patients/interfaces/PatientInterfaces';
import { useTheme } from '@/hooks/useTheme';
import { formatNumericDate, parseIsoDate } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

const MAX_RESULTS = 6;

const describe = (patient: Patient) =>
  `DOB ${formatNumericDate(parseIsoDate(patient.dateOfBirth))} · ${patient.discipline}`;

const matches = (patient: Patient, query: string) => {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const dob = formatNumericDate(parseIsoDate(patient.dateOfBirth));
  return patient.name.toLowerCase().includes(needle) || dob.includes(needle);
};

type PatientPickerProps = {
  patients: readonly Patient[];
  selected: Patient | undefined;
  onSelect: (patient: Patient) => void;
  onClear: () => void;
  error?: string;
};

export function PatientPicker({
  patients,
  selected,
  onSelect,
  onClear,
  error,
}: PatientPickerProps) {
  const theme = useTheme();
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const results = patients.filter((patient) => matches(patient, query)).slice(0, MAX_RESULTS);

  const choose = (patient: Patient) => {
    haptics.selection();
    setQuery('');
    inputRef.current?.blur();
    setFocused(false);
    onSelect(patient);
  };

  const change = () => {
    haptics.selection();
    onClear();
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <View style={styles.container}>
      <ThemedText themeColor="textSecondary" style={styles.label}>
        Patient
        <ThemedText themeColor="error">{'  *'}</ThemedText>
      </ThemedText>

      {selected ? (
        <View style={[styles.selected, { backgroundColor: theme.surfaceMuted }]}>
          <PatientIdentity patient={selected} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Change patient, ${selected.name} selected`}
            hitSlop={8}
            onPress={change}>
            <ThemedText themeColor="accent" style={styles.change}>
              Change
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <>
          <View
            style={[
              styles.search,
              {
                backgroundColor: theme.background,
                borderColor: error ? theme.error : focused ? theme.primary : theme.border,
              },
            ]}>
            <Icon
              name={{ ios: 'magnifyingglass', android: 'search' }}
              size={20}
              color={theme.textSecondary}
            />
            <TextInput
              ref={inputRef}
              accessibilityLabel="Search patient by name or date of birth"
              value={query}
              onChangeText={setQuery}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search patient by name or DOB"
              placeholderTextColor={theme.textSecondary}
              autoCorrect={false}
              returnKeyType="search"
              style={[styles.searchInput, { color: theme.text }]}
            />
          </View>
          {focused || query ? (
            <View
              style={[
                styles.results,
                { backgroundColor: theme.background, borderColor: theme.border },
              ]}>
              {results.length === 0 ? (
                <ThemedText themeColor="textSecondary" style={styles.noResults}>
                  No patients match “{query.trim()}”.
                </ThemedText>
              ) : (
                results.map((patient, index) => (
                  <Pressable
                    key={patient.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${patient.name}, ${describe(patient)}${patient.isNew ? ', new' : ''}`}
                    onPress={() => choose(patient)}
                    style={({ pressed }) => [
                      styles.result,
                      index < results.length - 1 && {
                        borderBottomColor: theme.border,
                        borderBottomWidth: StyleSheet.hairlineWidth,
                      },
                      pressed && { backgroundColor: theme.surfaceMuted },
                    ]}>
                    <PatientIdentity patient={patient} />
                  </Pressable>
                ))
              )}
            </View>
          ) : null}
        </>
      )}
      {error && !selected ? (
        <ThemedText type="small" themeColor="error" accessibilityRole="alert">
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

function PatientIdentity({ patient }: { patient: Patient }) {
  return (
    <View style={styles.identity}>
      <Avatar name={patient.name} />
      <View style={styles.identityText}>
        <View style={styles.nameRow}>
          <ThemedText numberOfLines={1} style={styles.name}>
            {patient.name}
          </ThemedText>
          {patient.isNew ? (
            <Pill label="New" color="textSecondary" backgroundColor="toneBlueBg" dot />
          ) : null}
        </View>
        <ThemedText themeColor="textSecondary" style={styles.meta}>
          {describe(patient)}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + Spacing.half,
    minHeight: 52,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.medium,
    borderWidth: 1,
    ...Shadows.card,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    paddingVertical: Spacing.two,
  },
  results: {
    borderRadius: Radius.medium,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadows.raised,
  },
  result: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three - Spacing.one,
  },
  noResults: {
    padding: Spacing.three,
    fontSize: 15,
    lineHeight: 21,
  },
  selected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.large,
  },
  change: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 600,
  },
  identity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  identityText: {
    flex: 1,
    gap: Spacing.half,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  name: {
    flexShrink: 1,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 600,
  },
  meta: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: 400,
  },
});

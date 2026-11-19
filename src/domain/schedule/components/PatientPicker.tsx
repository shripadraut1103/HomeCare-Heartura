import { useRef, useState, type ComponentRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { Radius, Shadows, Spacing } from '@/constants/Theme';
import { describePatient, isProspect } from '@/domain/schedule/bookingMapper';
import { usePatientSearch } from '@/domain/schedule/hooks/useBooking';
import type { ApiPatientOption } from '@/domain/schedule/interfaces/BookingApi';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

type PatientPickerProps = {
  selected: ApiPatientOption | undefined;
  onSelect: (patient: ApiPatientOption) => void;
  onClear?: () => void;
  loading?: boolean;
  error?: string;
};

export function PatientPicker({ selected, onSelect, onClear, loading, error }: PatientPickerProps) {
  const theme = useTheme();
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const open = !selected && !loading && (focused || query.length > 0);
  const { results, searching, error: searchError } = usePatientSearch(query, open);

  const choose = (patient: ApiPatientOption) => {
    haptics.selection();
    setQuery('');
    inputRef.current?.blur();
    setFocused(false);
    onSelect(patient);
  };

  const change = () => {
    haptics.selection();
    onClear?.();
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
          {onClear ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Change patient, ${selected.name} selected`}
              hitSlop={8}
              onPress={change}>
              <ThemedText themeColor="accent" style={styles.change}>
                Change
              </ThemedText>
            </Pressable>
          ) : null}
        </View>
      ) : loading ? (
        <View style={[styles.selected, { backgroundColor: theme.surfaceMuted }]}>
          <ActivityIndicator color={theme.textSecondary} />
          <ThemedText themeColor="textSecondary" style={styles.meta}>
            Loading patient…
          </ThemedText>
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
              accessibilityLabel="Search patient by name, MRN or date of birth"
              value={query}
              onChangeText={setQuery}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search patient by name, MRN or DOB"
              placeholderTextColor={theme.textSecondary}
              autoCorrect={false}
              returnKeyType="search"
              style={[styles.searchInput, { color: theme.text }]}
            />
          </View>
          {open ? (
            <View
              style={[
                styles.results,
                { backgroundColor: theme.background, borderColor: theme.border },
              ]}>
              {searchError ? (
                <ThemedText themeColor="error" style={styles.noResults}>
                  {searchError}
                </ThemedText>
              ) : results.length === 0 ? (
                <ThemedText themeColor="textSecondary" style={styles.noResults}>
                  {searching
                    ? 'Searching…'
                    : query.trim()
                      ? `No patients match “${query.trim()}”.`
                      : 'No patients to book.'}
                </ThemedText>
              ) : (
                results.map((patient, index) => (
                  <Pressable
                    key={patient.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${patient.name}, ${describePatient(patient)}${isProspect(patient.status) ? ', prospect' : ''}`}
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

function PatientIdentity({ patient }: { patient: ApiPatientOption }) {
  return (
    <View style={styles.identity}>
      <Avatar name={patient.name} />
      <View style={styles.identityText}>
        <View style={styles.nameRow}>
          <ThemedText numberOfLines={1} style={styles.name}>
            {patient.name}
          </ThemedText>
          {isProspect(patient.status) ? (
            <Pill label="Prospect" color="textSecondary" backgroundColor="toneBlueBg" dot />
          ) : null}
        </View>
        <ThemedText themeColor="textSecondary" style={styles.meta}>
          {describePatient(patient)}
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

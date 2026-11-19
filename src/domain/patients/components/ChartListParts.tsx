import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { Spacing, type ThemeColor } from '@/constants/Theme';

export const EMPTY_VALUE = '—';

export function StatusPill({
  pill,
}: {
  pill: { label: string; color: ThemeColor; background: ThemeColor };
}) {
  return <Pill label={pill.label} dot color={pill.color} backgroundColor={pill.background} />;
}

export function EmptyRow({ text }: { text: string }) {
  return (
    <ThemedText themeColor="textSecondary" style={styles.empty}>
      {text}
    </ThemedText>
  );
}

type ResourceState = { loading: boolean; loaded: boolean; error: string | null; retry: () => void };

export function ResourceGate({ state, children }: { state: ResourceState; children: ReactNode }) {
  if (state.loaded) return children;
  if (state.error) {
    return (
      <View style={styles.state}>
        <ThemedText themeColor="textSecondary" style={styles.message}>
          {state.error}
        </ThemedText>
        <Button title="Try again" variant="secondary" size="small" onPress={state.retry} />
      </View>
    );
  }
  if (state.loading) {
    return (
      <View style={styles.state}>
        <ActivityIndicator accessibilityLabel="Loading" />
      </View>
    );
  }
  return children;
}

const styles = StyleSheet.create({
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.four,
  },
  state: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.five,
  },
  message: {
    textAlign: 'center',
  },
});

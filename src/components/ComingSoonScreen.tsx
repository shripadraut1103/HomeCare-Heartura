import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Spacing } from '@/constants/Theme';

type ComingSoonScreenProps = {
  title: string;
  children?: ReactNode;
};

export function ComingSoonScreen({ title, children }: ComingSoonScreenProps) {
  return (
    <ThemedView type="backgroundScreen" style={styles.container}>
      <SafeAreaView style={styles.content}>
        <ThemedText accessibilityRole="header" type="subtitle">
          {title}
        </ThemedText>
        <ThemedText themeColor="textSecondary">Coming soon</ThemedText>
        {children ? <View style={styles.extra}>{children}</View> : null}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  extra: {
    marginTop: Spacing.four,
  },
});

import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FLOATING_ACTION_BUTTON_SIZE } from '@/components/ui/FloatingActionButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

type NoteEditorLayoutProps = {
  title: string;
  subtitle: string;
  top?: ReactNode;
  banner: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  floating?: ReactNode;
  overlay?: ReactNode;
};

export function NoteEditorLayout({
  title,
  subtitle,
  top,
  banner,
  children,
  footer,
  floating,
  overlay,
}: NoteEditorLayoutProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView type="backgroundScreen" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.container}>
        <ScreenHeader title={title} subtitle={subtitle} />
        {top}
        {banner}
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </SafeAreaView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.background,
            borderTopColor: theme.border,
            paddingBottom: insets.bottom + Spacing.three,
          },
        ]}>
        {floating ? <View style={styles.floating}>{floating}</View> : null}
        {footer}
      </View>
      {overlay}
    </ThemedView>
  );
}

export function NoteNotFound({ title }: { title: string }) {
  return (
    <ThemedView type="backgroundScreen" style={styles.container}>
      <SafeAreaView edges={['top']}>
        <ScreenHeader title={title} />
        <ThemedText themeColor="textSecondary" style={styles.missing}>
          This note isn’t available any more.
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: Spacing.four,
    padding: Spacing.three,
    paddingBottom: Spacing.six + Spacing.four,
  },
  footer: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  floating: {
    position: 'absolute',
    right: Spacing.three,
    top: -(FLOATING_ACTION_BUTTON_SIZE + Spacing.three),
  },
  missing: {
    textAlign: 'center',
    paddingVertical: Spacing.five,
  },
});

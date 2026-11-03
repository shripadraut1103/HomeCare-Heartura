import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Icon } from '@/components/ui/Icon';
import { Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

type ModalFormLayoutProps = {
  title: string;
  children: ReactNode;
  footer: ReactNode;
};

export function ModalFormLayout({ title, children, footer }: ModalFormLayoutProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={12}
            onPress={() => router.back()}>
            <Icon name={{ ios: 'xmark', android: 'close' }} size={22} color={theme.text} />
          </Pressable>
          <ThemedText accessibilityRole="header" numberOfLines={1} style={styles.title}>
            {title}
          </ThemedText>
        </View>

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
          { borderTopColor: theme.border, paddingBottom: insets.bottom + Spacing.three },
        ]}>
        {footer}
      </View>
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
    gap: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    flexShrink: 1,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 700,
  },
  content: {
    gap: Spacing.four,
    padding: Spacing.three,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});

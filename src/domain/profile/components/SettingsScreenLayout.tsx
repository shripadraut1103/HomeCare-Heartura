import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTabBarSpace } from '@/components/AppTabs';
import { ThemedView } from '@/components/ThemedView';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Spacing } from '@/constants/Theme';

const CONTENT_MAX_WIDTH = 720;

type SettingsScreenLayoutProps = {
  title: string;
  children: ReactNode;
  overlay?: ReactNode;
};

export function SettingsScreenLayout({ title, children, overlay }: SettingsScreenLayoutProps) {
  const tabBarSpace = useTabBarSpace();

  return (
    <ThemedView type="backgroundScreen" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.container}>
        <ScreenHeader title={title} />
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </SafeAreaView>
      {overlay}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    gap: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
});

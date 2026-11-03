import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, LayoutAnimationConfig } from 'react-native-reanimated';

type TabPanelProps = {
  tab: string;
  children: ReactNode;
};

export function TabPanel({ tab, children }: TabPanelProps) {
  return (
    <Animated.View key={tab} entering={FadeIn.duration(200)} style={styles.panel}>
      <LayoutAnimationConfig skipEntering skipExiting>
        {children}
      </LayoutAnimationConfig>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
  },
});

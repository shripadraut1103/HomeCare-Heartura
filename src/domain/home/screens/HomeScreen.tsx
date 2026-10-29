import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Spacing } from '@/constants/Theme';
import { lockSession } from '@/domain/auth/store/AuthReducer';
import { useAppDispatch } from '@/store/hooks';

export default function HomeScreen() {
  const dispatch = useAppDispatch();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.content}>
        <Pressable
          accessibilityRole="button"
          accessibilityHint="Signs you out and returns to the login screen"
          onPress={() => dispatch(lockSession())}>
          <ThemedText type="subtitle">Home</ThemedText>
        </Pressable>
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
    padding: Spacing.three,
  },
});

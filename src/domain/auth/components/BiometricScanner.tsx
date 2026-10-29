import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';

const SIZE = 144;
const RING_WIDTH = 3;
const SUCCESS_FILL_SIZE = 112;

type BiometricScannerProps = {
  state: 'idle' | 'scanning' | 'success';
  onPress: () => void;
};

export function BiometricScanner({ state, onPress }: BiometricScannerProps) {
  const theme = useTheme();
  const scanning = state === 'scanning';
  const succeeded = state === 'success';
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (scanning) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1200, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      cancelAnimation(rotation);
      rotation.value = 0;
    }
  }, [scanning, rotation]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Unlock with biometrics"
      accessibilityState={{ busy: scanning, disabled: scanning || succeeded }}
      disabled={scanning || succeeded}
      onPress={onPress}
      style={styles.container}>
      <View style={[styles.fill, { backgroundColor: theme.background }]} />
      {scanning ? (
        <Animated.View
          style={[
            styles.ring,
            { borderLeftColor: theme.primary, borderBottomColor: theme.primary },
            ringStyle,
          ]}
        />
      ) : null}
      {succeeded ? (
        <View style={[styles.successFill, { backgroundColor: theme.successMuted }]} />
      ) : null}
      <SymbolView
        name={{ ios: 'faceid', android: 'face', web: 'face' }}
        size={44}
        tintColor={succeeded ? theme.success : theme.primary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {
    ...StyleSheet.absoluteFill,
    borderRadius: SIZE / 2,
    opacity: 0.6,
  },
  successFill: {
    position: 'absolute',
    width: SUCCESS_FILL_SIZE,
    height: SUCCESS_FILL_SIZE,
    borderRadius: SUCCESS_FILL_SIZE / 2,
  },
  ring: {
    ...StyleSheet.absoluteFill,
    borderRadius: SIZE / 2,
    borderWidth: RING_WIDTH,
    borderColor: 'transparent',
  },
});

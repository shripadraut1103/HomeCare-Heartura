import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useEffectEvent } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { BrandLogo } from '@/components/BrandLogo';
import { useTheme } from '@/hooks/useTheme';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 0 });

const SLIDE_DISTANCE = 48;
const ENTER_MS = 600;
const HOLD_MS = 1000;
const EXIT_MS = 600;
const REVEAL_MS = 400;
const TOTAL_MS = ENTER_MS + HOLD_MS + EXIT_MS + REVEAL_MS;

type AnimatedSplashProps = {
  onFinish: () => void;
};

/** Logo fades in from the right, holds, fades out to the left, then the overlay reveals the app. */
export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const theme = useTheme();
  const logoOpacity = useSharedValue(0);
  const logoX = useSharedValue(SLIDE_DISTANCE);
  const overlayOpacity = useSharedValue(1);
  const finish = useEffectEvent(onFinish);

  useEffect(() => {
    const enter = { duration: ENTER_MS, easing: Easing.out(Easing.cubic) };
    const exit = { duration: EXIT_MS, easing: Easing.in(Easing.cubic) };

    logoOpacity.value = withSequence(withTiming(1, enter), withDelay(HOLD_MS, withTiming(0, exit)));
    logoX.value = withSequence(
      withTiming(0, enter),
      withDelay(HOLD_MS, withTiming(-SLIDE_DISTANCE, exit))
    );
    overlayOpacity.value = withDelay(
      ENTER_MS + HOLD_MS + EXIT_MS,
      withTiming(0, { duration: REVEAL_MS })
    );

    const timer = setTimeout(finish, TOTAL_MS);
    return () => clearTimeout(timer);
  }, [logoOpacity, logoX, overlayOpacity]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateX: logoX.value }],
  }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.overlay, { backgroundColor: theme.backgroundScreen }, overlayStyle]}
      onLayout={() => SplashScreen.hide()}>
      <Animated.View style={logoStyle}>
        <BrandLogo height={56} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});

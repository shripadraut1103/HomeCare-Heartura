import { SymbolView } from 'expo-symbols';
import {
  Appearance,
  Pressable,
  StyleSheet,
  useColorScheme,
  type PressableProps,
} from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

const SIZE = 40;

/** Switches the app between light and dark mode. The choice is not saved between launches. */
export function ThemeToggle({ style, ...pressableProps }: Omit<PressableProps, 'children'>) {
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      hitSlop={4}
      onPress={() => {
        haptics.selection();
        Appearance.setColorScheme(isDark ? 'light' : 'dark');
      }}
      style={(state) => [
        styles.button,
        { borderColor: theme.border, backgroundColor: theme.background },
        state.pressed && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...pressableProps}>
      <SymbolView
        name={
          isDark
            ? { ios: 'sun.max', android: 'light_mode', web: 'light_mode' }
            : { ios: 'moon', android: 'dark_mode', web: 'dark_mode' }
        }
        size={20}
        tintColor={theme.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});

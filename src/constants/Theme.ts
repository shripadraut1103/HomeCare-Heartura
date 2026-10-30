import { Platform, type ViewStyle } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundScreen: '#EEF4F2',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    primary: '#1A5AA6',
    primaryMuted: '#E3ECF8',
    onPrimary: '#FFFFFF',
    border: '#E3E6EB',
    error: '#D92D20',
    success: '#2F9E62',
    successMuted: '#E3F5EA',
    onError: '#FFFFFF',
    accent: '#2E6B6E',
    warning: '#F2C94C',
    toneBlueBg: '#E6EEF9',
    toneBlueFg: '#1E4E9C',
    toneAmberBg: '#FCF1DC',
    toneAmberFg: '#B5651D',
    toneRedBg: '#F9E4E1',
    toneRedFg: '#B3342B',
    toneRoseBg: '#F7E1E3',
    toneRoseFg: '#B3342B',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundScreen: '#111214',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    primary: '#6AA6F0',
    primaryMuted: '#1B2A40',
    onPrimary: '#06182E',
    border: '#3A3D42',
    error: '#F97066',
    success: '#4CC38A',
    successMuted: '#163626',
    onError: '#1A0503',
    accent: '#7CC4C7',
    warning: '#D9B23E',
    toneBlueBg: '#16243A',
    toneBlueFg: '#8DB4F0',
    toneAmberBg: '#33270F',
    toneAmberFg: '#F2B66B',
    toneRedBg: '#3A1A18',
    toneRedFg: '#F08A80',
    toneRoseBg: '#3A1C22',
    toneRoseFg: '#F08A80',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Gradients = {
  light: { greeting: 'linear-gradient(135deg, #ECE6F7 0%, #F5F3FB 45%, #FFFFFF 100%)' },
  dark: { greeting: 'linear-gradient(135deg, #231E33 0%, #17161D 55%, #111214 100%)' },
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  small: 8,
  medium: 12,
  large: 16,
  full: 999,
} as const;

/**
 * Drop shadows. Android uses native `elevation`, which the system draws cheaply while scrolling;
 * CSS `boxShadow` blurs are costly there. iOS keeps the softer `boxShadow`.
 * The element needs a solid `backgroundColor` for the Android shadow to show.
 */
const shadow = (elevation: number, boxShadow: string): ViewStyle =>
  Platform.OS === 'android' ? { elevation, shadowColor: '#101828' } : { boxShadow };

export const Shadows = {
  card: shadow(2, '0 2px 10px rgba(16, 24, 40, 0.06)'),
  raised: shadow(3, '0 4px 16px rgba(16, 24, 40, 0.08)'),
  floating: shadow(10, '0 8px 24px rgba(16, 24, 40, 0.12)'),
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

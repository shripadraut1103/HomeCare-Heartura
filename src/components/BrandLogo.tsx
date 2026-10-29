import { Image } from 'expo-image';
import { useColorScheme } from 'react-native';

const LOGO_ASPECT_RATIO = 2216 / 748;

const LOGO_SOURCES = {
  light: require('@/assets/images/heartura-logo.png'),
  dark: require('@/assets/images/heartura-logo-dark.png'),
};

type BrandLogoProps = {
  height?: number;
};

export function BrandLogo({ height = 48 }: BrandLogoProps) {
  const source = LOGO_SOURCES[useColorScheme() === 'dark' ? 'dark' : 'light'];

  return (
    <Image
      source={source}
      style={{ height, aspectRatio: LOGO_ASPECT_RATIO }}
      contentFit="contain"
      accessible
      accessibilityRole="image"
      accessibilityLabel="Heartura Technologies"
    />
  );
}

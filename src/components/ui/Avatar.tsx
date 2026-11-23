import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import type { ThemeColor } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';
import { getInitials } from '@/utils/nameFormat';

type AvatarProps = {
  name: string;
  size?: number;
  color?: ThemeColor;
  backgroundColor?: ThemeColor;
  uri?: string;
};

export function Avatar({
  name,
  size = 44,
  color = 'toneRoseFg',
  backgroundColor = 'toneRoseBg',
  uri,
}: AvatarProps) {
  const theme = useTheme();
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const showPhoto = Boolean(uri) && uri !== failedUri;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme[backgroundColor],
        },
      ]}>
      {showPhoto ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          contentFit="cover"
          transition={150}
          onError={() => setFailedUri(uri ?? null)}
        />
      ) : (
        <ThemedText
          themeColor={color}
          style={[styles.initials, { fontSize: Math.round(size * 0.36) }]}>
          {getInitials(name)}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: 600,
  },
});

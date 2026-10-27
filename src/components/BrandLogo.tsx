import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';

/**
 * Placeholder until the Heartura logo asset is added to `assets/images/`.
 * Then replace the wordmark with:
 * `<Image source={require('@/assets/images/heartura-logo.png')} style={styles.logo} contentFit="contain" />`
 */
export function BrandLogo() {
  return (
    <View style={styles.logo} accessibilityRole="image" accessibilityLabel="Heartura Technologies">
      <ThemedText type="subtitle" themeColor="primary" style={styles.wordmark}>
        Heartura
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 148,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    fontSize: 26,
    lineHeight: 32,
  },
});

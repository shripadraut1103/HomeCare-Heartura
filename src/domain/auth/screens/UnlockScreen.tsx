import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandLogo } from '@/components/BrandLogo';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { Spacing } from '@/constants/Theme';
import { BiometricScanner } from '@/domain/auth/components/BiometricScanner';
import {
  useBiometricUnlock,
  type BiometricUnlockStatus,
} from '@/domain/auth/hooks/useBiometricUnlock';
import { MOCK_USER } from '@/domain/auth/mocks/AuthMocks';
import { useTheme } from '@/hooks/useTheme';
import { getFirstName, getInitials } from '@/utils/nameFormat';

const CONTENT_MAX_WIDTH = 420;
const AVATAR_SIZE = 64;

const SAVED_USER = MOCK_USER;

const STATUS_COPY: Record<
  Exclude<BiometricUnlockStatus, 'success'>,
  { title: string; message: string }
> = {
  idle: {
    title: 'Ready to unlock',
    message: 'Tap the icon to unlock with Face ID or fingerprint.',
  },
  scanning: {
    title: 'Scanning...',
    message: "Unlock with Face ID or fingerprint. Tap the icon if it doesn't start on its own.",
  },
  failed: {
    title: "Couldn't verify it's you",
    message: 'Try again, or use your password instead.',
  },
  unavailable: {
    title: 'Biometrics not set up',
    message: 'Add Face ID or a fingerprint in your device settings, or use your password instead.',
  },
  noSession: {
    title: 'Sign in with your password first',
    message: 'Biometric unlock is available after you sign in once with your password.',
  },
};

export default function UnlockScreen() {
  const theme = useTheme();
  const { status, unlock } = useBiometricUnlock();
  const copy =
    status === 'success'
      ? { title: 'Unlocked', message: `Welcome back, ${getFirstName(SAVED_USER.name)}.` }
      : STATUS_COPY[status];
  const isBusy = status === 'scanning' || status === 'success';

  const goToPassword = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <ThemedView type="backgroundScreen" style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.logo}>
          <BrandLogo height={36} />
        </View>

        <View style={styles.body}>
          <View style={[styles.avatar, { backgroundColor: theme.primaryMuted }]}>
            <ThemedText themeColor="primary" style={styles.initials}>
              {getInitials(SAVED_USER.name)}
            </ThemedText>
          </View>
          <ThemedText style={styles.name}>{SAVED_USER.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.organization}>
            {SAVED_USER.organization}
          </ThemedText>

          <View style={styles.scanner}>
            <BiometricScanner
              state={status === 'scanning' || status === 'success' ? status : 'idle'}
              onPress={unlock}
            />
          </View>

          <ThemedText accessibilityLiveRegion="polite" style={styles.statusTitle}>
            {copy.title}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.statusMessage}>
            {copy.message}
          </ThemedText>
        </View>

        <View style={styles.actions}>
          <Button
            title="Unlock with biometrics"
            disabled={isBusy}
            onPress={unlock}
            icon={
              <SymbolView
                name={{ ios: 'faceid', android: 'face', web: 'face' }}
                size={18}
                tintColor={theme.onPrimary}
              />
            }
          />
          <Button
            variant="link"
            size="small"
            title="Use password instead"
            disabled={status === 'success'}
            style={styles.usePassword}
            onPress={goToPassword}
          />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
  },
  logo: {
    alignItems: 'center',
    paddingTop: Spacing.three,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: 700,
  },
  name: {
    marginTop: Spacing.three,
    fontSize: 17,
    fontWeight: 700,
  },
  organization: {
    marginTop: Spacing.one,
    fontWeight: 400,
  },
  scanner: {
    marginTop: Spacing.five,
    marginBottom: Spacing.four,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 700,
  },
  statusMessage: {
    marginTop: Spacing.two,
    maxWidth: 280,
    textAlign: 'center',
    fontWeight: 400,
  },
  actions: {
    paddingBottom: Spacing.three,
  },
  usePassword: {
    marginTop: Spacing.three,
  },
});

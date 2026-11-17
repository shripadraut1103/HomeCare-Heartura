import { Redirect } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandLogo } from '@/components/BrandLogo';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { Radius, Shadows, Spacing } from '@/constants/Theme';
import { CodeInput } from '@/domain/auth/components/CodeInput';
import { CODE_LENGTH, useVerifyCodeForm } from '@/domain/auth/hooks/useVerifyCodeForm';
import { useTheme } from '@/hooks/useTheme';

const FORM_MAX_WIDTH = 420;

// TODO: replace with the final 2FA design once it is shared.
export default function VerifyCodeScreen() {
  const theme = useTheme();
  const form = useVerifyCodeForm();

  if (!form.hasChallenge) return <Redirect href="/" />;

  return (
    <ThemedView type="backgroundScreen" style={styles.container}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            <ThemedView style={[styles.card, { borderColor: theme.border }]}>
              <View style={styles.logo}>
                <BrandLogo />
              </View>

              <View style={styles.header}>
                <ThemedText accessibilityRole="header" style={styles.title}>
                  Enter the code
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                  We emailed a {CODE_LENGTH}-digit code to{' '}
                  <ThemedText style={[styles.subtitle, styles.email]}>{form.email}</ThemedText>.
                </ThemedText>
              </View>

              <CodeInput
                value={form.code}
                length={CODE_LENGTH}
                onChange={form.changeCode}
                onSubmit={form.verify}
                error={Boolean(form.error)}
                disabled={form.verifying || form.expired}
              />

              <ThemedText
                themeColor={form.expired ? 'error' : 'textSecondary'}
                accessibilityLiveRegion="polite"
                style={styles.countdown}>
                {form.expired
                  ? 'This code has expired. Send a new one.'
                  : `Code expires in ${form.countdown}`}
              </ThemedText>

              {form.error ? (
                <ThemedText
                  type="small"
                  themeColor="error"
                  accessibilityRole="alert"
                  style={styles.error}>
                  {form.error}
                </ThemedText>
              ) : null}

              <Button
                title="Verify"
                loading={form.verifying}
                disabled={form.code.length !== CODE_LENGTH || form.expired}
                onPress={form.verify}
              />

              <View style={styles.links}>
                <Button variant="link" title="Back to sign in" onPress={form.backToLogin} />
                <Button
                  variant="link"
                  title={form.resending ? 'Sending…' : 'Resend code'}
                  disabled={form.resending}
                  onPress={form.resend}
                />
              </View>
            </ThemedView>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.five,
  },
  card: {
    width: '100%',
    maxWidth: FORM_MAX_WIDTH,
    alignSelf: 'center',
    padding: Spacing.four,
    borderWidth: 1,
    borderRadius: Radius.large,
    ...Shadows.raised,
  },
  logo: {
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  header: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: 700,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: 400,
  },
  email: {
    fontWeight: 600,
  },
  countdown: {
    textAlign: 'center',
    marginTop: Spacing.three,
    marginBottom: Spacing.three,
    fontSize: 14,
    lineHeight: 20,
  },
  error: {
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.three,
  },
});

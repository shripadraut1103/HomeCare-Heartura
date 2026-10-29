import { SymbolView } from 'expo-symbols';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandLogo } from '@/components/BrandLogo';
import { ThemedText } from '@/components/ThemedText';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { FormTextField } from '@/components/ui/FormTextField';
import { Radius, Spacing } from '@/constants/Theme';
import { useLoginForm } from '@/domain/auth/hooks/useLoginForm';
import { useTheme } from '@/hooks/useTheme';

const FORM_MAX_WIDTH = 420;

export default function LoginScreen() {
  const theme = useTheme();
  const { control, focusPassword, submit, isSubmitting, serverError } = useLoginForm();

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
              <ThemeToggle style={styles.themeToggle} />
              <View style={styles.logo}>
                <BrandLogo />
              </View>

              <View style={styles.header}>
                <ThemedText accessibilityRole="header" style={styles.title}>
                  Sign In
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                  Use your work email to open the app.
                </ThemedText>
              </View>

              <View style={styles.form}>
                <FormTextField
                  control={control}
                  name="email"
                  label="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="username"
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={focusPassword}
                />
                <FormTextField
                  control={control}
                  name="password"
                  label="Password"
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="go"
                  onSubmitEditing={submit}
                />
                <Button
                  variant="link"
                  size="small"
                  title="Forgot password?"
                  style={styles.forgotPassword}
                />
              </View>

              {serverError ? (
                <ThemedText
                  type="small"
                  themeColor="error"
                  accessibilityRole="alert"
                  style={styles.serverError}>
                  {serverError}
                </ThemedText>
              ) : null}

              <Button title="Sign in" loading={isSubmitting} onPress={submit} />

              <Button
                variant="link"
                title="Sign in with Face ID"
                style={styles.faceId}
                icon={
                  <SymbolView
                    name={{ ios: 'lock', android: 'lock', web: 'lock' }}
                    size={16}
                    tintColor={theme.primary}
                  />
                }
              />
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
    boxShadow: '0 4px 16px rgba(16, 24, 40, 0.08)',
  },
  themeToggle: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
    zIndex: 1,
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
  form: {
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.one,
  },
  serverError: {
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  faceId: {
    marginTop: Spacing.four,
  },
});

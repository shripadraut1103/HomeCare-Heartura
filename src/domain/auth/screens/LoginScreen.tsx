import { SymbolView } from 'expo-symbols';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandLogo } from '@/components/BrandLogo';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { FormTextField } from '@/components/ui/FormTextField';
import { Spacing } from '@/constants/Theme';
import { useLoginForm } from '@/domain/auth/hooks/useLoginForm';
import { useTheme } from '@/hooks/useTheme';

const FORM_MAX_WIDTH = 420;

export default function LoginScreen() {
  const theme = useTheme();
  const { control, focusPassword, submit, isSubmitting, serverError } = useLoginForm();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            <View style={styles.content}>
              <View style={styles.header}>
                <BrandLogo />
                <ThemedText type="default" style={styles.title}>
                  Provider app
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
                  Your schedule, visits and patients, on the go.
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
            </View>
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
  content: {
    width: '100%',
    maxWidth: FORM_MAX_WIDTH,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  title: {
    marginTop: Spacing.three,
    fontSize: 18,
    fontWeight: 700,
  },
  subtitle: {
    textAlign: 'center',
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

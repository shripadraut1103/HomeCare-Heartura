import {
  BottomSheetTextInput,
  BottomSheetView,
  useBottomSheetModal,
  type BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { SymbolView } from 'expo-symbols';
import type { Ref } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { FormTextField } from '@/components/ui/FormTextField';
import type { TextFieldProps } from '@/components/ui/TextField';
import { Spacing } from '@/constants/Theme';
import { CodeInput } from '@/domain/auth/components/CodeInput';
import {
  RESET_CODE_LENGTH,
  useForgotPasswordForm,
  type ForgotPasswordStep,
} from '@/domain/auth/hooks/useForgotPasswordForm';
import { SheetPasswordField } from '@/domain/profile/components/PasswordField';
import { PasswordRules } from '@/domain/profile/components/PasswordRules';
import { useTheme } from '@/hooks/useTheme';

const SENT_ICON_SIZE = 56;

const TITLES: Record<ForgotPasswordStep, string> = {
  email: 'Forgot your password?',
  code: 'Enter the code',
  password: 'Set a new password',
};

// Its ref type also allows `undefined`; the instance is still a regular TextInput.
const SheetTextInput = BottomSheetTextInput as NonNullable<TextFieldProps['InputComponent']>;

export type ForgotPasswordSheetData = { email: string };

export function ForgotPasswordSheet({
  ref,
}: {
  ref: Ref<BottomSheetModal<ForgotPasswordSheetData>>;
}) {
  return (
    <AppBottomSheet<ForgotPasswordSheetData>
      ref={ref}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize">
      {({ data }) => <ForgotPasswordContent data={data} />}
    </AppBottomSheet>
  );
}

/** Mounted fresh on every `present`, so the flow starts from the email passed in. */
function ForgotPasswordContent({ data }: { data?: ForgotPasswordSheetData }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();
  const close = () => dismiss();
  const flow = useForgotPasswordForm(data?.email ?? '', close);
  const { email, code, password } = flow;

  return (
    <BottomSheetView style={{ paddingBottom: insets.bottom + Spacing.three }}>
      <SheetHeader title={TITLES[flow.step]} onClose={close} />

      {flow.step === 'email' ? (
        <View style={styles.body}>
          <ThemedText themeColor="textSecondary" style={styles.description}>
            Enter your work email and we’ll send you a {RESET_CODE_LENGTH}-digit code to reset it.
          </ThemedText>
          <FormTextField
            control={email.control}
            name="email"
            label="Work email"
            InputComponent={SheetTextInput}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="username"
            returnKeyType="send"
            onSubmitEditing={email.submit}
          />
          {email.serverError ? (
            <ThemedText type="small" themeColor="error" accessibilityRole="alert">
              {email.serverError}
            </ThemedText>
          ) : null}
        </View>
      ) : null}

      {flow.step === 'code' ? (
        <View style={styles.body}>
          <View style={styles.sent}>
            <View style={[styles.sentIcon, { backgroundColor: theme.primaryMuted }]}>
              <SymbolView
                name={{ ios: 'envelope', android: 'mail', web: 'mail' }}
                size={24}
                tintColor={theme.primary}
              />
            </View>
            <ThemedText accessibilityRole="header" style={styles.sentTitle}>
              Check your email
            </ThemedText>
            <ThemedText
              accessibilityLiveRegion="polite"
              themeColor="textSecondary"
              style={[styles.description, styles.centered]}>
              If an account exists for{' '}
              <ThemedText themeColor="textSecondary" style={styles.sentEmail}>
                {flow.sentTo}
              </ThemedText>
              , we’ve sent a {RESET_CODE_LENGTH}-digit code. It expires in 10 minutes.
            </ThemedText>
          </View>
          <CodeInput
            value={code.value}
            length={RESET_CODE_LENGTH}
            onChange={code.change}
            onSubmit={code.verify}
            error={Boolean(code.error)}
            disabled={code.verifying || code.expired}
            InputComponent={SheetTextInput}
          />
          {code.error ? (
            <ThemedText
              type="small"
              themeColor="error"
              accessibilityRole="alert"
              style={styles.centered}>
              {code.error}
            </ThemedText>
          ) : null}
          <View style={styles.links}>
            <Button variant="link" title="Use a different email" onPress={flow.startOver} />
            <Button
              variant="link"
              title={code.resending ? 'Sending…' : 'Resend code'}
              disabled={code.resending}
              onPress={code.resend}
            />
          </View>
        </View>
      ) : null}

      {flow.step === 'password' ? (
        <View style={styles.body}>
          <ThemedText themeColor="textSecondary" style={styles.description}>
            Choose a new password for{' '}
            <ThemedText themeColor="textSecondary" style={styles.sentEmail}>
              {flow.sentTo}
            </ThemedText>
            .
          </ThemedText>
          <View style={styles.newPassword}>
            <SheetPasswordField
              control={password.control}
              name="newPassword"
              label="New password"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={password.focusConfirm}
            />
            <PasswordRules password={password.newPassword} />
          </View>
          <SheetPasswordField
            control={password.control}
            name="confirmPassword"
            label="Confirm new password"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={password.submit}
          />
          {password.serverError ? (
            <View style={styles.serverError}>
              <ThemedText type="small" themeColor="error" accessibilityRole="alert">
                {password.serverError}
              </ThemedText>
              <Button variant="link" title="Start over" onPress={flow.startOver} />
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Button
          variant="secondary"
          title="Back to sign in"
          style={styles.footerButton}
          onPress={close}
        />
        {flow.step === 'email' ? (
          <Button
            title="Send code"
            loading={email.isSubmitting}
            style={styles.footerButton}
            onPress={email.submit}
          />
        ) : null}
        {flow.step === 'code' ? (
          <Button
            title="Verify"
            loading={code.verifying}
            disabled={code.value.length !== RESET_CODE_LENGTH || code.expired}
            style={styles.footerButton}
            onPress={code.verify}
          />
        ) : null}
        {flow.step === 'password' ? (
          <Button
            title="Reset password"
            loading={password.isSubmitting}
            style={styles.footerButton}
            onPress={password.submit}
          />
        ) : null}
      </View>
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: Spacing.three,
    padding: Spacing.four,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: 400,
  },
  sent: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  sentIcon: {
    width: SENT_ICON_SIZE,
    height: SENT_ICON_SIZE,
    borderRadius: SENT_ICON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  sentTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 700,
  },
  centered: {
    textAlign: 'center',
  },
  sentEmail: {
    fontSize: 16,
    fontWeight: 600,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  newPassword: {
    gap: Spacing.three - Spacing.one,
  },
  serverError: {
    alignItems: 'flex-start',
    gap: Spacing.one,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerButton: {
    flex: 1,
  },
});

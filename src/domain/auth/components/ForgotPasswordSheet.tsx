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
import { useForgotPasswordForm } from '@/domain/auth/hooks/useForgotPasswordForm';
import { useTheme } from '@/hooks/useTheme';

const SENT_ICON_SIZE = 56;

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

/** Mounted fresh on every `present`, so the form starts from the email passed in. */
function ForgotPasswordContent({ data }: { data?: ForgotPasswordSheetData }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();
  const { control, submit, resend, isSubmitting, isResending, serverError, sentTo } =
    useForgotPasswordForm(data?.email ?? '');

  const close = () => dismiss();

  return (
    <BottomSheetView style={{ paddingBottom: insets.bottom + Spacing.three }}>
      <SheetHeader title="Forgot your password?" onClose={close} />

      <View style={styles.body}>
        {sentTo ? (
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
              style={[styles.description, styles.sentMessage]}>
              If an account exists for{' '}
              <ThemedText themeColor="textSecondary" style={styles.sentEmail}>
                {sentTo}
              </ThemedText>
              , we’ve sent a link to reset the password. The link works once and expires in 30
              minutes.
            </ThemedText>
          </View>
        ) : (
          <>
            <ThemedText themeColor="textSecondary" style={styles.description}>
              Enter your work email and we’ll send you a link to reset it.
            </ThemedText>
            <FormTextField
              control={control}
              name="email"
              label="Work email"
              InputComponent={SheetTextInput}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="username"
              returnKeyType="send"
              onSubmitEditing={submit}
            />
          </>
        )}
        {serverError ? (
          <ThemedText
            type="small"
            themeColor="error"
            accessibilityRole="alert"
            style={sentTo ? styles.sentMessage : undefined}>
            {serverError}
          </ThemedText>
        ) : null}
      </View>

      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Button
          variant="secondary"
          title="Back to sign in"
          style={styles.footerButton}
          onPress={close}
        />
        {sentTo ? (
          <Button
            title="Resend link"
            loading={isResending}
            style={styles.footerButton}
            onPress={resend}
          />
        ) : (
          <Button
            title="Send reset link"
            loading={isSubmitting}
            style={styles.footerButton}
            onPress={submit}
          />
        )}
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
  sentMessage: {
    textAlign: 'center',
  },
  sentEmail: {
    fontSize: 16,
    fontWeight: 600,
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

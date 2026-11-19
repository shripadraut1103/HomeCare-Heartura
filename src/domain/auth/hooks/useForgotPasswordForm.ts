import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { newPasswordError } from '@/domain/auth/passwordErrors';
import { resetCodeOutcome } from '@/domain/auth/resetCodeOutcome';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/domain/auth/schemas/forgotPasswordSchema';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/domain/auth/schemas/resetPasswordSchema';
import AuthService from '@/domain/auth/store/services/AuthServices';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { haptics } from '@/utils/haptics';

export const RESET_CODE_LENGTH = 6;

export type ForgotPasswordStep = 'email' | 'code' | 'password';

export function useForgotPasswordForm(initialEmail: string, onDone: () => void) {
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<ForgotPasswordStep>('email');
  const [sentTo, setSentTo] = useState('');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | undefined>();
  const [codeExpired, setCodeExpired] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const emailForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: initialEmail },
  });
  const passwordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });
  const newPassword = useWatch({ control: passwordForm.control, name: 'newPassword' });

  const showCodeStep = (email: string) => {
    setSentTo(email.trim());
    setCode('');
    setCodeError(undefined);
    setCodeExpired(false);
    setResetToken(null);
    setStep('code');
  };

  const submitEmail = () => {
    void emailForm.handleSubmit(
      async ({ email }) => {
        const result = await AuthService.requestPasswordReset(email);
        if ('error' in result) {
          haptics.error();
          emailForm.setError('root.serverError', { message: result.error });
          return;
        }
        haptics.success();
        showCodeStep(email);
      },
      () => haptics.error()
    )();
  };

  const verify = async (value = code) => {
    if (value.length !== RESET_CODE_LENGTH || verifying || codeExpired) return;
    setCodeError(undefined);
    setVerifying(true);
    const outcome = resetCodeOutcome(await AuthService.verifyResetCode(sentTo, value));
    setVerifying(false);
    if (outcome.kind === 'verified') {
      haptics.success();
      setResetToken(outcome.token);
      passwordForm.reset();
      setStep('password');
      return;
    }
    haptics.error();
    setCode('');
    setCodeError(outcome.message);
    if (outcome.kind === 'expired') setCodeExpired(true);
  };

  const changeCode = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, RESET_CODE_LENGTH);
    setCode(digits);
    setCodeError(undefined);
    if (digits.length === RESET_CODE_LENGTH) void verify(digits);
  };

  const resend = async () => {
    if (!sentTo || resending) return;
    setResending(true);
    setCodeError(undefined);
    const result = await AuthService.requestPasswordReset(sentTo);
    setResending(false);
    if ('error' in result) {
      haptics.error();
      setCodeError(result.error);
      return;
    }
    haptics.success();
    showCodeStep(sentTo);
    dispatch(setToastMessage({ message: `New code sent to ${sentTo}` }));
  };

  const submitPassword = () => {
    void passwordForm.handleSubmit(
      async ({ newPassword: password }) => {
        if (!resetToken) return;
        const result = await AuthService.resetPassword(resetToken, password);
        if (!('error' in result)) {
          haptics.success();
          dispatch(setToastMessage({ message: 'Password reset. Sign in with your new password.' }));
          onDone();
          return;
        }
        haptics.error();
        const policyError = newPasswordError(result);
        if (policyError) {
          passwordForm.setError('newPassword', { message: policyError }, { shouldFocus: true });
        } else {
          passwordForm.setError('root.serverError', { message: result.error });
        }
      },
      () => haptics.error()
    )();
  };

  const startOver = () => {
    emailForm.clearErrors();
    setResetToken(null);
    setStep('email');
  };

  return {
    step,
    sentTo,
    startOver,
    email: {
      control: emailForm.control,
      submit: submitEmail,
      isSubmitting: emailForm.formState.isSubmitting,
      serverError: emailForm.formState.errors.root?.serverError?.message,
    },
    code: {
      value: code,
      change: changeCode,
      verify: () => void verify(),
      resend: () => void resend(),
      verifying,
      resending,
      expired: codeExpired,
      error: codeError,
    },
    password: {
      control: passwordForm.control,
      newPassword,
      focusConfirm: () => passwordForm.setFocus('confirmPassword'),
      submit: submitPassword,
      isSubmitting: passwordForm.formState.isSubmitting,
      serverError: passwordForm.formState.errors.root?.serverError?.message,
    },
  };
}

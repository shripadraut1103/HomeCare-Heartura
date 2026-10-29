import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/domain/auth/schemas/forgotPasswordSchema';
import AuthService from '@/domain/auth/store/services/AuthServices';
import { haptics } from '@/utils/haptics';

export function useForgotPasswordForm(initialEmail: string) {
  /** The address the link went to; set once the request succeeds. */
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: initialEmail },
  });

  const submit = () => {
    void form.handleSubmit(async ({ email }) => {
      const result = await AuthService.requestPasswordReset(email);
      if ('error' in result) {
        haptics.error();
        form.setError('root.serverError', { message: result.error });
      } else {
        haptics.success();
        setSentTo(email);
      }
    })();
  };

  const resend = async () => {
    if (!sentTo || isResending) return;
    form.clearErrors('root.serverError');
    setIsResending(true);
    const result = await AuthService.requestPasswordReset(sentTo);
    setIsResending(false);
    if ('error' in result) {
      haptics.error();
      form.setError('root.serverError', { message: result.error });
    } else {
      haptics.success();
    }
  };

  return {
    control: form.control,
    submit,
    resend,
    isResending,
    isSubmitting: form.formState.isSubmitting,
    serverError: form.formState.errors.root?.serverError?.message,
    sentTo,
  };
}

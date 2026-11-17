import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';

import { EnvConfig } from '@/config/EnvConfig';
import { MOCK_CREDENTIALS } from '@/domain/auth/mocks/AuthMocks';
import { loginSchema, type LoginFormValues } from '@/domain/auth/schemas/loginSchema';
import { loginAction } from '@/domain/auth/store/async-actions/AuthAsyncActions';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { haptics } from '@/utils/haptics';

export function useLoginForm() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.auth.loading);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    // TEMPORARY: prefilled with the mock user while no API URL is configured.
    defaultValues: EnvConfig.apiUrl ? { email: '', password: '' } : MOCK_CREDENTIALS,
  });

  const submit = () => {
    void form.handleSubmit(async (values) => {
      const result = await dispatch(loginAction(values)).unwrap();
      if ('error' in result) {
        haptics.error();
        form.setError('root.serverError', { message: result.error });
      } else if (result.data.two_factor_required) {
        router.push('/verify-code');
      } else {
        haptics.success();
      }
    })();
  };

  return {
    control: form.control,
    focusPassword: () => form.setFocus('password'),
    getEmail: () => form.getValues('email'),
    submit,
    isSubmitting: loading,
    serverError: form.formState.errors.root?.serverError?.message,
  };
}

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

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
    // TEMPORARY: prefilled with the mock user until the login API exists.
    defaultValues: MOCK_CREDENTIALS,
  });

  const submit = () => {
    void form.handleSubmit(async (values) => {
      const result = await dispatch(loginAction(values)).unwrap();
      if ('error' in result) {
        haptics.error();
        form.setError('root.serverError', { message: result.error });
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

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { loginSchema, type LoginFormValues } from '@/domain/auth/schemas/loginSchema';
import { loginAction } from '@/domain/auth/store/async-actions/AuthAsyncActions';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export function useLoginForm() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.auth.loading);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const submit = () => {
    void form.handleSubmit(async (values) => {
      const result = await dispatch(loginAction(values)).unwrap();
      if ('error' in result) {
        form.setError('root.serverError', { message: result.error });
      }
    })();
  };

  return {
    control: form.control,
    focusPassword: () => form.setFocus('password'),
    submit,
    isSubmitting: loading,
    serverError: form.formState.errors.root?.serverError?.message,
  };
}

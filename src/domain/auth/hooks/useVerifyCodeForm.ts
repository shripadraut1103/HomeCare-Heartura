import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import { clearChallenge } from '@/domain/auth/store/AuthReducer';
import {
  fetchMeAction,
  resendTwoFactorAction,
  verifyTwoFactorAction,
} from '@/domain/auth/store/async-actions/AuthAsyncActions';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { haptics } from '@/utils/haptics';

export const CODE_LENGTH = 6;
const TICK_MS = 1000;

export function secondsLeft(expiresAt: string | undefined, now: number) {
  if (!expiresAt) return 0;
  return Math.max(0, Math.ceil((Date.parse(expiresAt) - now) / 1000));
}

export function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

export function useVerifyCodeForm() {
  const dispatch = useAppDispatch();
  const challenge = useAppSelector((state) => state.auth.challenge);
  const verifying = useAppSelector((state) => state.auth.loading);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [resending, setResending] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, []);

  const remaining = secondsLeft(challenge?.expiresAt, now);
  const expired = challenge !== null && remaining === 0;

  const backToLogin = (message?: string) => {
    dispatch(clearChallenge());
    if (message) dispatch(setToastMessage({ message, type: 'warning' }));
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const verify = async (value = code) => {
    if (!challenge || value.length !== CODE_LENGTH || verifying) return;
    setError(undefined);
    const result = await dispatch(
      verifyTwoFactorAction({ challengeId: challenge.id, code: value })
    ).unwrap();
    if (!('error' in result)) {
      haptics.success();
      // The tokens are saved by now, so `me` goes out with the new Bearer token.
      void dispatch(fetchMeAction());
      return;
    }
    haptics.error();
    if (result.code === 'TWO_FACTOR_EXPIRED') {
      backToLogin(result.error);
      return;
    }
    setCode('');
    setError(result.error);
  };

  const changeCode = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(digits);
    setError(undefined);
    if (digits.length === CODE_LENGTH) void verify(digits);
  };

  const resend = async () => {
    if (!challenge || resending) return;
    setResending(true);
    setError(undefined);
    const result = await dispatch(resendTwoFactorAction({ challengeId: challenge.id })).unwrap();
    setResending(false);
    if ('error' in result) {
      haptics.error();
      if (result.code === 'TWO_FACTOR_EXPIRED') backToLogin(result.error);
      else setError(result.error);
      return;
    }
    haptics.success();
    setCode('');
    dispatch(setToastMessage({ message: `New code sent to ${challenge.email}` }));
  };

  return {
    email: challenge?.email,
    hasChallenge: challenge !== null,
    code,
    changeCode,
    verify: () => void verify(),
    resend: () => void resend(),
    backToLogin: () => backToLogin(),
    verifying,
    resending,
    error,
    expired,
    countdown: formatCountdown(remaining),
  };
}

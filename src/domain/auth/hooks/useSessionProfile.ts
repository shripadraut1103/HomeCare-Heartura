import { useEffect } from 'react';

import { fetchMeAction } from '@/domain/auth/store/async-actions/AuthAsyncActions';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export function useSessionProfile() {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const hasProfile = useAppSelector((state) => state.auth.me !== null);

  useEffect(() => {
    if (isLoggedIn && !hasProfile) void dispatch(fetchMeAction());
  }, [dispatch, isLoggedIn, hasProfile]);
}

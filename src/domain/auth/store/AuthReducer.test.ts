import { serviceError } from '@/config/ApiError';
import type { LoginFormValues } from '@/domain/auth/schemas/loginSchema';
import authReducer, {
  choosePasswordSignIn,
  lockSession,
  resetAuthReducer,
  unlockSession,
} from '@/domain/auth/store/AuthReducer';
import {
  fetchMeAction,
  loginAction,
  logoutAction,
  resendTwoFactorAction,
  verifyTwoFactorAction,
} from '@/domain/auth/store/async-actions/AuthAsyncActions';

const credentials: LoginFormValues = {
  organization: 'hope',
  email: 'helena.ruiz@example.com',
  password: 'secret',
};
const initialState = authReducer(undefined, { type: 'init' });

describe('AuthReducer', () => {
  it('sets loading while login is pending', () => {
    const state = authReducer(initialState, loginAction.pending('request-id', credentials));

    expect(state.loading).toBe(true);
  });

  it('stays logged out when the service resolves with an error', () => {
    const state = authReducer(
      { ...initialState, loading: true },
      loginAction.fulfilled(
        serviceError('AUTH_FAILED', 'Invalid credentials', 401),
        'request-id',
        credentials
      )
    );

    expect(state).toEqual({ ...initialState, loading: false, isLoggedIn: false });
  });

  it('keeps the 2FA challenge when a code was emailed', () => {
    const state = authReducer(
      initialState,
      loginAction.fulfilled(
        {
          data: {
            two_factor_required: true,
            challenge_id: 'challenge-1',
            challenge_expires_at: '2026-11-17T10:10:00Z',
          },
        },
        'request-id',
        credentials
      )
    );

    expect(state.isLoggedIn).toBe(false);
    expect(state.challenge).toEqual({
      id: 'challenge-1',
      expiresAt: '2026-11-17T10:10:00Z',
      email: credentials.email,
    });
  });

  it('stores tokens and logs in when no code is needed', () => {
    const tokens = {
      access: 'access',
      refresh: 'refresh',
      access_expires_at: '2026-11-17T10:15:00Z',
      refresh_expires_at: '2026-12-17T10:00:00Z',
    };
    const me = { session_timeout_minutes: 43200 };
    const state = authReducer(
      initialState,
      loginAction.fulfilled(
        { data: { two_factor_required: false, me, tokens } },
        'request-id',
        credentials
      )
    );

    expect(state).toEqual({
      ...initialState,
      isLoggedIn: true,
      accessToken: 'access',
      refreshToken: 'refresh',
      accessExpiresAt: '2026-11-17T10:15:00Z',
      refreshExpiresAt: '2026-12-17T10:00:00Z',
      me,
    });
  });

  it('clears the session on reset', () => {
    const loggedIn = {
      ...initialState,
      isLoggedIn: true,
      accessToken: 'access',
      refreshToken: 'refresh',
    };

    expect(authReducer(loggedIn, resetAuthReducer())).toEqual(initialState);
  });

  it('keeps the profile from me', () => {
    const me = { session_timeout_minutes: 43200 };
    const state = authReducer(initialState, fetchMeAction.fulfilled({ data: me }, 'request-id'));

    expect(state.me).toEqual(me);
  });

  it('clears the session on logout, even if the server call failed', () => {
    const loggedIn = { ...initialState, isLoggedIn: true, refreshToken: 'refresh' };

    expect(authReducer(loggedIn, logoutAction.fulfilled(undefined, 'request-id'))).toEqual(
      initialState
    );
  });

  describe('two-factor code', () => {
    const challenge = { id: 'challenge-1', expiresAt: '2026-11-17T10:10:00Z', email: 'a@b.c' };
    const waiting = { ...initialState, challenge };

    it('signs in and forgets the challenge once the code is accepted', () => {
      const tokens = {
        access: 'access',
        refresh: 'refresh',
        access_expires_at: '2026-11-17T10:15:00Z',
        refresh_expires_at: '2026-12-17T10:00:00Z',
      };
      const state = authReducer(
        waiting,
        verifyTwoFactorAction.fulfilled(
          { data: { two_factor_required: false, me: {}, tokens } },
          'request-id',
          { challengeId: 'challenge-1', code: '123456' }
        )
      );

      expect(state).toMatchObject({ isLoggedIn: true, accessToken: 'access', challenge: null });
    });

    it('stays on the code step when the code is wrong', () => {
      const state = authReducer(
        waiting,
        verifyTwoFactorAction.fulfilled(
          serviceError('TWO_FACTOR_INVALID', 'Wrong code.', 401),
          'request-id',
          { challengeId: 'challenge-1', code: '000000' }
        )
      );

      expect(state).toEqual(waiting);
    });

    it('swaps in the new challenge after a resend', () => {
      const state = authReducer(
        waiting,
        resendTwoFactorAction.fulfilled(
          {
            data: {
              two_factor_required: true,
              challenge_id: 'challenge-2',
              challenge_expires_at: '2026-11-17T10:20:00Z',
            },
          },
          'request-id',
          { challengeId: 'challenge-1' }
        )
      );

      expect(state.challenge).toEqual({
        ...challenge,
        id: 'challenge-2',
        expiresAt: '2026-11-17T10:20:00Z',
      });
    });
  });

  describe('app lock', () => {
    const signedIn = { ...initialState, isLoggedIn: true, refreshToken: 'refresh-1' };

    it('locks a signed-in session', () => {
      const state = authReducer(signedIn, lockSession());

      expect(state).toMatchObject({ isLoggedIn: false, locked: true, refreshToken: 'refresh-1' });
    });

    it('does not lock when nobody is signed in', () => {
      expect(authReducer(initialState, lockSession())).toEqual(initialState);
    });

    it('unlocks back into the session', () => {
      const state = authReducer(authReducer(signedIn, lockSession()), unlockSession());

      expect(state).toMatchObject({ isLoggedIn: true, locked: false });
    });

    it('stays signed out but unlocked when the user picks the password', () => {
      const state = authReducer(authReducer(signedIn, lockSession()), choosePasswordSignIn());

      expect(state).toMatchObject({ isLoggedIn: false, locked: false });
    });
  });
});

import type { LoginFormValues } from '@/domain/auth/schemas/loginSchema';
import authReducer, { resetAuthReducer } from '@/domain/auth/store/AuthReducer';
import { loginAction } from '@/domain/auth/store/async-actions/AuthAsyncActions';

const credentials: LoginFormValues = { email: 'helena.ruiz@example.com', password: 'secret' };
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
        { error: 'Invalid credentials', status: 401 },
        'request-id',
        credentials
      )
    );

    expect(state).toEqual({ ...initialState, loading: false, isLoggedIn: false });
  });

  it('stores tokens and logs in on success', () => {
    const state = authReducer(
      initialState,
      loginAction.fulfilled(
        { data: { accessToken: 'access', refreshToken: 'refresh' } },
        'request-id',
        credentials
      )
    );

    expect(state).toEqual({
      isLoggedIn: true,
      loading: false,
      accessToken: 'access',
      refreshToken: 'refresh',
    });
  });

  it('clears the session on reset', () => {
    const loggedIn = {
      isLoggedIn: true,
      loading: false,
      accessToken: 'access',
      refreshToken: 'refresh',
    };

    expect(authReducer(loggedIn, resetAuthReducer())).toEqual(initialState);
  });
});

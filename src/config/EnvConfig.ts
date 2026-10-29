export type AppEnv = 'dev' | 'qa' | 'prod';

const APP_ENVS: readonly AppEnv[] = ['dev', 'qa', 'prod'];

const isAppEnv = (value: string | undefined): value is AppEnv =>
  APP_ENVS.some((env) => env === value);

const appEnv = process.env.EXPO_PUBLIC_APP_ENV;

if (!isAppEnv(appEnv)) {
  throw new Error(`EXPO_PUBLIC_APP_ENV must be one of ${APP_ENVS.join(', ')} (got "${appEnv}").`);
}

export const EnvConfig = {
  appEnv,
  /** Base URL for `AxiosConfig` once the API is integrated. */
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? '',
} as const;

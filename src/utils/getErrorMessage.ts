const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

export function getErrorMessage(error: unknown, fallback: string = FALLBACK_MESSAGE): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

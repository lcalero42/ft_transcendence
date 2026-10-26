export const AUTH_COOKIE = 'access_token';

const AUTH_COOKIE_PATTERN = new RegExp(`(?:^|;\\s*)${AUTH_COOKIE}=([^;]+)`);

export function tokenFromCookieHeader(header: string | null | undefined) {
  return header?.match(AUTH_COOKIE_PATTERN)?.[1] ?? null;
}

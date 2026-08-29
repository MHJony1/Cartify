export const AUTH_CONSTANTS = {
  TOKEN_KEY: 'cartify_access_token',
  REFRESH_TOKEN_KEY: 'cartify_refresh_token',
  // Routes where unauthenticated users are redirected
  LOGIN_URL: '/login',
  // Routes where authenticated users are redirected by default
  DEFAULT_REDIRECT: '/profile',
};

export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

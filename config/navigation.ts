export const navigationConfig = {
  publicRoutes: ['/', '/login', '/register', '/forgot-password'],
  authRoutes: ['/login', '/register', '/forgot-password'],
  protectedRoutePrefix: '/dashboard',
  defaultLoginRedirect: '/dashboard',
  defaultLogoutRedirect: '/',
} as const;

export type NavigationConfig = typeof navigationConfig;

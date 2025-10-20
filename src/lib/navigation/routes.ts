import { defineRoute } from './@/define-route';

export type RouteSchemas = {
  home: {};
  loginProvider: {
    params: {
      provider: 'github' | 'google';
    };
    search?: {
      callbackUrl?: string;
    };
  };
};

export const routes = {
  faq: defineRoute('/faq'),
  home: defineRoute('/'),
  login: defineRoute('/login'),
  loginProvider: defineRoute<RouteSchemas['loginProvider']>(
    '/api/auth/[provider]/login'
  ),
  loginProviderCallback: defineRoute<RouteSchemas['loginProvider']>(
    '/api/auth/[provider]/callback'
  ),
  pricing: defineRoute('/pricing'),
  privacy: defineRoute('/privacy'),
  root: defineRoute('/'),
  settings: defineRoute('/settings'),
  signup: defineRoute('/signup'),
  terms: defineRoute('/terms'),
};

export const authRoutes = [routes.login(), routes.signup()];

export const DEFAULT_LOGIN_REDIRECT = routes.home();

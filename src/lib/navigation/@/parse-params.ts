import type { RouteSchemas } from '@/lib/navigation/routes';

export const parseParams = <
  O extends Record<string, { params?: {} }> & RouteSchemas,
  K extends keyof O,
  P extends O[K]['params'],
>(
  _route: K,
  params: any
) => {
  if (params.username) {
    // remove '@' from username
    params.username = (params.username as string).replace('%40', '');
  }

  return params as P extends {} ? P : NonNullable<P>;
};

export const parseSearchParams = <
  O extends Record<string, { search?: {} }> & RouteSchemas,
  K extends keyof O,
  S extends O[K]['search'],
>(
  _route: K,
  searchParams: any
) => {
  return searchParams as any as S extends {} ? S : NonNullable<S>;
};

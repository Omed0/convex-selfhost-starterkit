'use client';

import type { RouteSchemas } from '@/lib/navigation/routes';

import { useParams, useSearchParams } from 'next/navigation';

export const useParseParams = <
  O extends Record<string, { params?: {} }> & RouteSchemas,
  K extends keyof O,
  P extends O[K]['params'],
>(
  _route: K
) => {
  const params = useParams();

  if (params.username) {
    // remove '@' from username
    params.username = (params.username as string).replace('%40', '');
  }

  return params as P extends {} ? P : NonNullable<P>;
};

export const useParseSearchParams = <
  O extends Record<string, { search?: {} }> & RouteSchemas,
  K extends keyof O,
  S extends O[K]['search'],
>(
  _route: K
) => {
  return Object.fromEntries(useSearchParams().entries()) as any as S extends {}
    ? S
    : NonNullable<S>;
};

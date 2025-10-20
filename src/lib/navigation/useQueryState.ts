'use client';

import { parseAsString, useQueryState } from 'nuqs';

export const useExampleQueryState = () => {
  return useQueryState(
    'example',
    parseAsString.withOptions({
      clearOnDefault: true,
      history: 'push',
    })
  );
};

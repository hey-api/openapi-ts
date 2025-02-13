import type { QueryKey } from './client/@tanstack/angular-query-experimental.gen';
import type { Options } from './client/sdk.gen';

export const transformQueryKey = (queryKey: QueryKey<Options>) => [
  'SOME_FEATURE_NAME',
  ...queryKey,
];

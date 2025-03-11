import type { QueryKey } from './hey-api';

export const transformQueryKey = <T extends QueryKey<unknown>>(queryKey: T) => [
  'somePrefix',
  ...queryKey,
];

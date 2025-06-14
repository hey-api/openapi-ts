export const defaultTanStackQueryConfig = {
  comments: true,
  exportFromIndex: false,
  infiniteQueryKeyNameBuilder: '{{name}}InfiniteQueryKey',
  infiniteQueryOptions: true,
  infiniteQueryOptionsNameBuilder: '{{name}}InfiniteOptions',
  mutationOptions: true,
  mutationOptionsNameBuilder: '{{name}}Mutation',
  queryKeyNameBuilder: '{{name}}QueryKey',
  queryOptions: true,
  queryOptionsNameBuilder: '{{name}}Options',
} as const;

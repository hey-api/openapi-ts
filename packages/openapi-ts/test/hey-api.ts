import { client as _heyApiClient } from './generated/sample/client.gen';
import type { Options } from './generated/sample/sdk.gen';

export type QueryKey<TOptions extends Options> = [
  Pick<TOptions, 'baseUrl' | 'body' | 'headers' | 'path' | 'query'> & {
    _id: string;
    _infinite?: boolean;
  },
];

export const createQueryKey = <TOptions extends Options>(
  id: string,
  options?: TOptions,
  infinite?: boolean,
): [QueryKey<TOptions>[0]] => {
  const params: QueryKey<TOptions>[0] = {
    _id: id,
    baseUrl: (options?.client ?? _heyApiClient).getConfig().baseUrl,
  } as QueryKey<TOptions>[0];
  if (infinite) {
    params._infinite = infinite;
  }
  if (options?.body) {
    params.body = options.body;
  }
  if (options?.headers) {
    params.headers = options.headers;
  }
  if (options?.path) {
    params.path = options.path;
  }
  if (options?.query) {
    params.query = options.query;
  }
  return [params];
};

export const createInfiniteParams = <
  K extends Pick<QueryKey<Options>[0], 'body' | 'headers' | 'path' | 'query'>,
>(
  queryKey: QueryKey<Options>,
  page: K,
) => {
  const params = queryKey[0];
  if (page.body) {
    params.body = {
      ...(queryKey[0].body as any),
      ...(page.body as any),
    };
  }
  if (page.headers) {
    params.headers = {
      ...queryKey[0].headers,
      ...page.headers,
    };
  }
  if (page.path) {
    params.path = {
      ...(queryKey[0].path as any),
      ...(page.path as any),
    };
  }
  if (page.query) {
    params.query = {
      ...(queryKey[0].query as any),
      ...(page.query as any),
    };
  }
  return params as unknown as typeof page;
};

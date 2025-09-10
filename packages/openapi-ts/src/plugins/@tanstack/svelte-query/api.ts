import type { ICodegenSymbolSelector } from '@hey-api/codegen-core';

import type { Plugin } from '../../types';

type SelectorType =
  | 'AxiosError'
  | 'createInfiniteParams'
  | 'createQueryKey'
  | 'DefaultError'
  | 'infiniteQueryOptions'
  | 'InfiniteData'
  | 'MutationOptions'
  | 'queryOptions'
  | 'queryOptionsFn'
  | 'QueryKey'
  | 'useQuery';

export type IApi = {
  /**
   * @param type Selector type.
   * @param value Depends on `type`:
   *  - `AxiosError`: never
   *  - `createInfiniteParams`: never
   *  - `createQueryKey`: never
   *  - `DefaultError`: never
   *  - `infiniteQueryOptions`: never
   *  - `InfiniteData`: never
   *  - `MutationOptions`: never
   *  - `queryOptions`: never
   *  - `queryOptionsFn`: `operation.id` string
   *  - `QueryKey`: never
   *  - `useQuery`: never
   * @returns Selector array
   */
  getSelector: (type: SelectorType, value?: string) => ICodegenSymbolSelector;
};

export class Api implements IApi {
  constructor(public meta: Plugin.Name<'@tanstack/svelte-query'>) {}

  getSelector(
    ...args: ReadonlyArray<string | undefined>
  ): ICodegenSymbolSelector {
    return [this.meta.name, ...(args as ICodegenSymbolSelector)];
  }
}

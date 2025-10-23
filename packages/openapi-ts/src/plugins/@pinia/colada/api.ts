import type { Selector } from '@hey-api/codegen-core';

import type { Plugin } from '~/plugins/types';

type SelectorType =
  | '_JSONValue'
  | 'AxiosError'
  | 'createQueryKey'
  | 'defineQueryOptions'
  | 'QueryKey'
  | 'queryOptionsFn'
  | 'serializeQueryKeyValue'
  | 'UseMutationOptions'
  | 'UseQueryOptions';

export type IApi = {
  /**
   * @param type Selector type.
   * @param value Depends on `type`:
   *  - `_JSONValue`: never
   *  - `AxiosError`: never
   *  - `createQueryKey`: never
   *  - `defineQueryOptions`: never
   *  - `QueryKey`: never
   *  - `queryOptionsFn`: `operation.id` string
   *  - `serializeQueryKeyValue`: never
   *  - `UseMutationOptions`: never
   *  - `UseQueryOptions`: never
   * @returns Selector array
   */
  selector: (type: SelectorType, value?: string) => Selector;
};

export class Api implements IApi {
  constructor(public meta: Plugin.Name<'@pinia/colada'>) {}

  selector(...args: ReadonlyArray<string | undefined>): Selector {
    return [this.meta.name, ...(args as Selector)];
  }
}

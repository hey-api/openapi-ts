import type { ICodegenSymbolSelector } from '@hey-api/codegen-core';

import type { Plugin } from '../../types';

type SelectorType =
  | '_JSONValue'
  | 'AxiosError'
  | 'createQueryKey'
  | 'queryOptionsFn'
  | 'QueryKey'
  | 'UseMutationOptions'
  | 'UseQueryOptions';

export type IApi = {
  /**
   * @param type Selector type.
   * @param value Depends on `type`:
   *  - `_JSONValue`: never
   *  - `AxiosError`: never
   *  - `createQueryKey`: never
   *  - `queryOptionsFn`: `operation.id` string
   *  - `QueryKey`: never
   *  - `UseMutationOptions`: never
   *  - `UseQueryOptions`: never
   * @returns Selector array
   */
  getSelector: (type: SelectorType, value?: string) => ICodegenSymbolSelector;
};

export class Api implements IApi {
  constructor(public meta: Plugin.Name<'@pinia/colada'>) {}

  getSelector(
    ...args: ReadonlyArray<string | undefined>
  ): ICodegenSymbolSelector {
    return [this.meta.name, ...(args as ICodegenSymbolSelector)];
  }
}

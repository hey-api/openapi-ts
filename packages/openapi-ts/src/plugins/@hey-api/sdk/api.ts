import type { ICodegenSymbolSelector } from '@hey-api/codegen-core';

import type { Plugin } from '../../types';

type SelectorType =
  | 'buildClientParams'
  | 'class'
  | 'Client'
  | 'formDataBodySerializer'
  | 'function'
  | 'Options'
  | 'urlSearchParamsBodySerializer';

export type IApi = {
  /**
   * @param type Selector type.
   * @param value Depends on `type`:
   *  - `buildClientParams`: never
   *  - `class`: current class name
   *  - `Client`: never
   *  - `formDataBodySerializer`: never
   *  - `function`: `operation.id` string
   *  - `Options`: never
   *  - `urlSearchParamsBodySerializer`: never
   * @returns Selector array
   */
  getSelector: (type: SelectorType, value?: string) => ICodegenSymbolSelector;
};

export class Api implements IApi {
  constructor(public meta: Plugin.Name<'@hey-api/sdk'>) {}

  getSelector(
    ...args: ReadonlyArray<string | undefined>
  ): ICodegenSymbolSelector {
    return [this.meta.name, ...(args as ICodegenSymbolSelector)];
  }
}

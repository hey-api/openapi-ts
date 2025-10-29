import type { Selector } from '@hey-api/codegen-core';

import type { Plugin } from '~/plugins';

type SelectorType =
  | 'buildClientParams'
  | 'class'
  | 'Client'
  | 'Composable'
  | 'formDataBodySerializer'
  | 'function'
  | 'Injectable'
  | 'Options'
  | 'urlSearchParamsBodySerializer';

export type IApi = {
  /**
   * @param type Selector type.
   * @param value Depends on `type`:
   *  - `buildClientParams`: never
   *  - `class`: current class name
   *  - `Client`: never
   *  - `Composable`: never
   *  - `formDataBodySerializer`: never
   *  - `function`: `operation.id` string
   *  - `Injectable`: never
   *  - `Options`: never
   *  - `urlSearchParamsBodySerializer`: never
   * @returns Selector array
   * @deprecated
   */
  selector: (type: SelectorType, value?: string) => Selector;
};

export class Api implements IApi {
  constructor(public meta: Plugin.Name<'@hey-api/sdk'>) {}

  selector(...args: ReadonlyArray<string | undefined>): Selector {
    return [this.meta.name, ...(args as Selector)];
  }
}

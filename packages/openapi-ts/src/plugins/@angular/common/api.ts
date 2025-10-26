import type { Selector } from '@hey-api/codegen-core';

import type { Plugin } from '~/plugins';

type SelectorType =
  | 'class'
  | 'httpRequest'
  | 'httpResource'
  | 'HttpRequest'
  | 'inject'
  | 'Injectable';

export type IApi = {
  /**
   * @param type Selector type.
   * @param value Depends on `type`:
   *  - `class`: raw string entry from path
   *  - `httpRequest`: `operation.id` string
   *  - `httpResource`: never
   *  - `HttpRequest`: never
   *  - `inject`: never
   *  - `Injectable`: never
   * @returns Selector array
   */
  selector: (type: SelectorType, value?: string) => Selector;
};

export class Api implements IApi {
  constructor(public meta: Plugin.Name<'@angular/common'>) {}

  selector(...args: ReadonlyArray<string | undefined>): Selector {
    return [this.meta.name, ...(args as Selector)];
  }
}

import type { Selector } from '@hey-api/codegen-core';

import type { Plugin } from '../../types';

type SelectorType = 'ref';

export type IApi = {
  /**
   * @param type Selector type.
   * @param value Depends on `type`:
   *  - `ref`: `$ref` JSON pointer
   * @returns Selector array
   */
  getSelector: (type: SelectorType, value?: string) => Selector;
};

export class Api implements IApi {
  constructor(public meta: Plugin.Name<'@hey-api/schemas'>) {}

  getSelector(...args: ReadonlyArray<string | undefined>): Selector {
    return [this.meta.name, ...(args as Selector)];
  }
}

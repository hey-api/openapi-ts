import type { Selector } from '@hey-api/codegen-core';

import type { Plugin } from '~/plugins';

type SelectorType = 'ref';

export type IApi = {
  /**
   * @param type Selector type.
   * @param value Depends on `type`:
   *  - `ref`: `$ref` JSON pointer
   * @returns Selector array
   * @deprecated
   */
  selector: (type: SelectorType, value?: string) => Selector;
};

export class Api implements IApi {
  constructor(public meta: Plugin.Name<'@hey-api/schemas'>) {}

  selector(...args: ReadonlyArray<string | undefined>): Selector {
    return [this.meta.name, ...(args as Selector)];
  }
}

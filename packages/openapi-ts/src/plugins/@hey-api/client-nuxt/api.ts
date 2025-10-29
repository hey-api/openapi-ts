import type { Selector } from '@hey-api/codegen-core';

import type { Plugin } from '~/plugins';

type SelectorType = 'client';

export type IApi = {
  /**
   * @param type Selector type.
   * @param value Depends on `type`:
   *  - `client`: never
   * @returns Selector array
   * @deprecated
   */
  selector: (type: SelectorType, value?: string) => Selector;
};

export class Api implements IApi {
  constructor(public meta: Plugin.Name<'@hey-api/client-nuxt'>) {}

  selector(...args: ReadonlyArray<string | undefined>): Selector {
    return [this.meta.name, ...(args as Selector)];
  }
}

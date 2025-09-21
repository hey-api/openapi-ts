import type { Selector } from '@hey-api/codegen-core';

import type { Plugin } from '../../types';

type SelectorType = 'response' | 'response-ref';

export type IApi = {
  /**
   * @param type Selector type.
   * @param value Depends on `type`:
   *  - `response`: `operation.id` string
   *  - `response-ref`: `$ref` JSON pointer
   * @returns Selector array
   */
  getSelector: (type: SelectorType, value?: string) => Selector;
};

export class Api implements IApi {
  constructor(public meta: Plugin.Name<'@hey-api/transformers'>) {}

  getSelector(...args: ReadonlyArray<string | undefined>): Selector {
    return [this.meta.name, ...(args as Selector)];
  }
}

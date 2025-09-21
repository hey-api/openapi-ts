import type { Selector } from '@hey-api/codegen-core';

import type { Plugin } from '../types';

type SelectorType = 'RouteHandler';

export type IApi = {
  /**
   * @param type Selector type.
   * @param value Depends on `type`:
   *  - `RouteHandler`: never
   * @returns Selector array
   */
  getSelector: (type: SelectorType, value?: string) => Selector;
};

export class Api implements IApi {
  constructor(public meta: Plugin.Name<'fastify'>) {}

  getSelector(...args: ReadonlyArray<string | undefined>): Selector {
    return [this.meta.name, ...(args as Selector)];
  }
}

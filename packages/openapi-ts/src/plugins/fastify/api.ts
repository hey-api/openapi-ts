import type { ICodegenSymbolSelector } from '@hey-api/codegen-core';

import type { Plugin } from '../types';

type SelectorType = 'RouteHandler';

export type IApi = {
  /**
   * @param type Selector type.
   * @param value Depends on `type`:
   *  - `RouteHandler`: never
   * @returns Selector array
   */
  getSelector: (type: SelectorType, value?: string) => ICodegenSymbolSelector;
};

export class Api implements IApi {
  constructor(public meta: Plugin.Name<'fastify'>) {}

  getSelector(
    ...args: ReadonlyArray<string | undefined>
  ): ICodegenSymbolSelector {
    return [this.meta.name, ...(args as ICodegenSymbolSelector)];
  }
}

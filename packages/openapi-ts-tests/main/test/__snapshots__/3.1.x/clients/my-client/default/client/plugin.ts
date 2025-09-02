import type { ICodegenSymbolSelector } from '@hey-api/codegen-core';
import {
  type Client,
  clientDefaultConfig,
  clientDefaultMeta,
  clientPluginHandler,
  type DefinePlugin,
  definePluginConfig,
} from '@hey-api/openapi-ts';

type SelectorType =
  | 'client';

export type IApi = {
  /**
   * @param type Selector type.
   * @param value Depends on `type`:
   *  - `client`: never
   * @returns Selector array
   */
  getSelector: (type: SelectorType, value?: string) => ICodegenSymbolSelector;
};

export class Api implements IApi {
  constructor(public meta: Pick<Config, 'name'>) {}

  getSelector(...args: ReadonlyArray<string | undefined>): ICodegenSymbolSelector {
    return [this.meta.name, ...args as ICodegenSymbolSelector];
  }
}

export type Config = Client.Config & {
  /**
   * Plugin name. Must be unique.
   */
  name: string;
};

export type MyClientPlugin = DefinePlugin<Config, Config, IApi>;

export const defaultConfig: MyClientPlugin['Config'] = {
  ...clientDefaultMeta,
  api: new Api({
    name: __filename,
  }),
  config: clientDefaultConfig,
  handler: clientPluginHandler as MyClientPlugin['Handler'],
  name: __filename,
};

/**
 * Type helper for `my-client` plugin, returns {@link Plugin.Config} object
 */
export const myClientPlugin = definePluginConfig(defaultConfig);

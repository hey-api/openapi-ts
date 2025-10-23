import type { Selector } from '@hey-api/codegen-core';
import {
  type Client,
  clientDefaultConfig,
  clientDefaultMeta,
  clientPluginHandler,
  type DefinePlugin,
  definePluginConfig,
} from '@hey-api/openapi-ts';

type SelectorType = 'client';

export type IApi = {
  /**
   * @param type Selector type.
   * @param value Depends on `type`:
   *  - `client`: never
   * @returns Selector array
   */
  selector: (type: SelectorType, value?: string) => Selector;
};

export class Api implements IApi {
  constructor(public meta: Pick<Config, 'name'>) {}

  selector(...args: ReadonlyArray<string | undefined>): Selector {
    return [this.meta.name, ...(args as Selector)];
  }
}

export type Config = Client.Config & {
  /**
   * Plugin name. Must be unique.
   */
  name: '@hey-api/custom-client';
};

export type CustomClientPlugin = DefinePlugin<Config, Config, IApi>;

export const defaultConfig: CustomClientPlugin['Config'] = {
  ...clientDefaultMeta,
  api: new Api({
    name: '@hey-api/custom-client',
  }),
  config: {
    ...clientDefaultConfig,
    bundle: false,
  },
  handler: clientPluginHandler as unknown as CustomClientPlugin['Handler'],
  name: '@hey-api/custom-client',
};

/**
 * Type helper for `@hey-api/custom-client` plugin, returns {@link Plugin.Config} object
 */
export const customClientPlugin = definePluginConfig(defaultConfig);

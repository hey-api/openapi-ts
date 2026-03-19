import type {
  BaseConfig,
  BaseUserConfig,
  Plugin,
  PluginConfigMap,
  PluginNames,
} from '@hey-api/shared';

import type { Output, UserOutput } from './output/types';

export type UserConfig = BaseUserConfig<UserOutput> & {
  /**
   * Plugins generate artifacts from `input`. By default, we generate SDK
   * functions and TypeScript interfaces. If you manually define `plugins`,
   * you need to include the default plugins if you wish to use them.
   *
   * @default ['@hey-api/typescript', '@hey-api/sdk']
   */
  plugins?: ReadonlyArray<
    | PluginNames
    | {
        [K in PluginNames]: PluginConfigMap[K]['config'] & {
          name: K;
        };
      }[PluginNames]
  >;
};

export type Config = BaseConfig<UserConfig, Output> & {
  pluginOrder: ReadonlyArray<keyof PluginConfigMap>;
  plugins: {
    [K in PluginNames]?: Plugin.Config<PluginConfigMap[K]>;
  };
};

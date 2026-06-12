import type { Plugin, PluginConfigMap, PluginNames } from '@hey-api/shared';

import { defaultConfig as heyApiClientHttpx } from '../plugins/@hey-api/client-httpx';
import { defaultConfig as heyApiSdk } from '../plugins/@hey-api/sdk';
import { defaultConfig as pydantic } from '../plugins/pydantic';

/**
 * Default plugins used to generate artifacts if plugins aren't specified.
 */
export const defaultPlugins = ['@hey-api/python-sdk'] as const satisfies ReadonlyArray<PluginNames>;

export const defaultPluginConfigs: {
  [K in PluginNames]: Plugin.Config<PluginConfigMap[K]>;
} = {
  '@hey-api/client-httpx': heyApiClientHttpx,
  '@hey-api/python-sdk': heyApiSdk,
  pydantic,
};

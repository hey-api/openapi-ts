import type { Plugin, PluginConfigMap, PluginNames } from '@hey-api/shared';

import { defaultConfig as heyApiClientAiohttp } from './@hey-api/client-aiohttp';
import { defaultConfig as heyApiClientHttpx } from './@hey-api/client-httpx';
import { defaultConfig as heyApiClientRequests } from './@hey-api/client-requests';
import { defaultConfig as heyApiClientUrllib3 } from './@hey-api/client-urllib3';
import { defaultConfig as heyApiSdk } from './@hey-api/sdk';
import { defaultConfig as pydantic } from './pydantic';

/**
 * Default plugins used to generate artifacts if plugins aren't specified.
 */
export const defaultPlugins = ['@hey-api/python-sdk'] as const satisfies ReadonlyArray<PluginNames>;

export const defaultPluginConfigs: {
  [K in PluginNames]: Plugin.Config<PluginConfigMap[K]>;
} = {
  '@hey-api/client-aiohttp': heyApiClientAiohttp,
  '@hey-api/client-httpx': heyApiClientHttpx,
  '@hey-api/client-requests': heyApiClientRequests,
  '@hey-api/client-urllib3': heyApiClientUrllib3,
  '@hey-api/python-sdk': heyApiSdk,
  pydantic,
};

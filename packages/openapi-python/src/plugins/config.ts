import type { Plugin, PluginConfigMap, PluginNames } from '@hey-api/shared';

import { defaultConfig as heyApiClientHttpx } from '../plugins/@hey-api/client-httpx';
import { defaultConfig as heyApiSdk } from '../plugins/@hey-api/sdk';

export const defaultPluginConfigs: {
  [K in PluginNames]: Plugin.Config<PluginConfigMap[K]>;
} = {
  '@hey-api/client-httpx': heyApiClientHttpx,
  '@hey-api/python-sdk': heyApiSdk,
};

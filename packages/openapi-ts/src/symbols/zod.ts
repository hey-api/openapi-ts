import type { PluginInstance } from '@hey-api/shared';

import { getZodModule } from '../plugins/zod/shared/module';

export function ZOD(plugin: PluginInstance) {
  // this must use Zod plugin instance but for now only Zod plugin calls this so it works
  const external = getZodModule({ plugin: plugin as any });
  return {
    z: plugin.symbol('z', {
      external,
      // @ts-expect-error
      // this must use Zod plugin instance but for now only Zod plugin calls this so it works
      importKind: plugin.config.compatibilityVersion !== 3 ? 'namespace' : undefined,
      meta: {
        resource: 'zod.z',
      },
    }),
  };
}

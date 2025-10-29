import { clientFolderAbsolutePath } from '~/generate/client';
import { getClientPlugin } from '~/plugins/@hey-api/client-core/utils';

import { generateClassSdk } from '../shared/class';
import { generateFlatSdk } from '../shared/functions';
import { createTypeOptions } from '../shared/typeOptions';
import type { HeyApiSdkPlugin } from '../types';

export const handlerV1: HeyApiSdkPlugin['Handler'] = ({ plugin }) => {
  const clientModule = clientFolderAbsolutePath(plugin.context.config);
  const client = getClientPlugin(plugin.context.config);
  const isAngularClient = client.name === '@hey-api/client-angular';
  const isNuxtClient = client.name === '@hey-api/client-nuxt';

  plugin.registerSymbol({
    external: clientModule,
    meta: {
      category: 'external',
      resource: 'client.formDataBodySerializer',
      tool: client.name,
    },
    name: 'formDataBodySerializer',
  });
  plugin.registerSymbol({
    external: clientModule,
    meta: {
      category: 'external',
      resource: 'client.urlSearchParamsBodySerializer',
      tool: client.name,
    },
    name: 'urlSearchParamsBodySerializer',
  });
  plugin.registerSymbol({
    external: clientModule,
    meta: {
      category: 'external',
      resource: 'client.buildClientParams',
      tool: client.name,
    },
    name: 'buildClientParams',
  });
  if (isNuxtClient) {
    plugin.registerSymbol({
      external: clientModule,
      kind: 'type',
      meta: {
        category: 'external',
        resource: 'client.Composable',
        tool: client.name,
      },
      name: 'Composable',
    });
  }
  if (isAngularClient && plugin.config.asClass) {
    plugin.registerSymbol({
      external: '@angular/core',
      meta: {
        category: 'external',
        resource: '@angular/core.Injectable',
      },
      name: 'Injectable',
    });
  }

  createTypeOptions({ plugin });

  if (plugin.config.asClass) {
    generateClassSdk({ plugin });
  } else {
    generateFlatSdk({ plugin });
  }
};

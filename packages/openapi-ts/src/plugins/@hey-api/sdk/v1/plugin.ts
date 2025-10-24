import { clientFolderAbsolutePath } from '~/generate/client';
import { getClientPlugin } from '~/plugins/@hey-api/client-core/utils';

import { generateClassSdk } from '../shared/class';
import { generateFlatSdk } from '../shared/functions';
import { createTypeOptions } from '../shared/typeOptions';
import type { HeyApiSdkPlugin } from '../types';

export const handlerV1: HeyApiSdkPlugin['Handler'] = ({ plugin }) => {
  const clientModule = clientFolderAbsolutePath(plugin.context.config);
  plugin.registerSymbol({
    external: clientModule,
    name: 'formDataBodySerializer',
    selector: plugin.api.selector('formDataBodySerializer'),
  });
  plugin.registerSymbol({
    external: clientModule,
    name: 'urlSearchParamsBodySerializer',
    selector: plugin.api.selector('urlSearchParamsBodySerializer'),
  });
  plugin.registerSymbol({
    external: clientModule,
    name: 'buildClientParams',
    selector: plugin.api.selector('buildClientParams'),
  });

  const client = getClientPlugin(plugin.context.config);
  const isAngularClient = client.name === '@hey-api/client-angular';
  const isNuxtClient = client.name === '@hey-api/client-nuxt';
  if (isNuxtClient) {
    plugin.registerSymbol({
      external: clientModule,
      meta: {
        kind: 'type',
      },
      name: 'Composable',
      selector: plugin.api.selector('Composable'),
    });
  }

  if (isAngularClient && plugin.config.asClass) {
    plugin.registerSymbol({
      external: '@angular/core',
      name: 'Injectable',
      selector: plugin.api.selector('Injectable'),
    });
  }

  createTypeOptions({ plugin });

  if (plugin.config.asClass) {
    generateClassSdk({ plugin });
  } else {
    generateFlatSdk({ plugin });
  }
};

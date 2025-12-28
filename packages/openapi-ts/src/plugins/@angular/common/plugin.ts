import { createHttpRequests } from './shared/httpRequests';
import { createHttpResources } from './shared/httpResources';
import type { AngularCommonPlugin } from './types';

export const handler: AngularCommonPlugin['Handler'] = ({ plugin }) => {
  plugin.symbol('HttpRequest', {
    external: '@angular/common/http',
    kind: 'type',
    meta: {
      category: 'external',
      resource: '@angular/common/http.HttpRequest',
    },
  });
  plugin.symbol('inject', {
    external: '@angular/core',
    meta: {
      category: 'external',
      resource: '@angular/core.inject',
    },
  });
  plugin.symbol('Injectable', {
    external: '@angular/core',
    meta: {
      category: 'external',
      resource: '@angular/core.Injectable',
    },
  });
  plugin.symbol('httpResource', {
    external: '@angular/common/http',
    meta: {
      category: 'external',
      resource: '@angular/common/http.httpResource',
    },
  });

  if (plugin.config.httpRequests.enabled) {
    createHttpRequests({ plugin });
  }

  if (plugin.config.httpResources.enabled) {
    createHttpResources({ plugin });
  }
};

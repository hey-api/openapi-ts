import { createHttpRequests } from './httpRequests';
import { createHttpResources } from './httpResources';
import type { AngularCommonPlugin } from './types';

export const handler: AngularCommonPlugin['Handler'] = ({ plugin }) => {
  plugin.registerSymbol({
    external: '@angular/common/http',
    kind: 'type',
    meta: {
      category: 'external',
      resource: '@angular/common/http.HttpRequest',
    },
    name: 'HttpRequest',
  });
  plugin.registerSymbol({
    external: '@angular/core',
    meta: {
      category: 'external',
      resource: '@angular/core.inject',
    },
    name: 'inject',
  });
  plugin.registerSymbol({
    external: '@angular/core',
    meta: {
      category: 'external',
      resource: '@angular/core.Injectable',
    },
    name: 'Injectable',
  });
  plugin.registerSymbol({
    external: '@angular/common/http',
    meta: {
      category: 'external',
      resource: '@angular/common/http.httpResource',
    },
    name: 'httpResource',
  });

  if (plugin.config.httpRequests.enabled) {
    createHttpRequests({ plugin });
  }

  if (plugin.config.httpResources.enabled) {
    createHttpResources({ plugin });
  }
};

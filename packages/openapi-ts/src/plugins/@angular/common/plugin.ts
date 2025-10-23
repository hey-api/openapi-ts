import { createHttpRequests } from './httpRequests';
import { createHttpResources } from './httpResources';
import type { AngularCommonPlugin } from './types';

export const handler: AngularCommonPlugin['Handler'] = ({ plugin }) => {
  plugin.registerSymbol({
    external: '@angular/common/http',
    meta: {
      kind: 'type',
    },
    name: 'HttpRequest',
    selector: plugin.api.selector('HttpRequest'),
  });
  plugin.registerSymbol({
    external: '@angular/core',
    name: 'inject',
    selector: plugin.api.selector('inject'),
  });
  plugin.registerSymbol({
    external: '@angular/core',
    name: 'Injectable',
    selector: plugin.api.selector('Injectable'),
  });
  plugin.registerSymbol({
    external: '@angular/common/http',
    name: 'httpResource',
    selector: plugin.api.selector('httpResource'),
  });

  if (plugin.config.httpRequests.enabled) {
    createHttpRequests({ plugin });
  }

  if (plugin.config.httpResources.enabled) {
    createHttpResources({ plugin });
  }
};

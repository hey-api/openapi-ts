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
    selector: plugin.api.getSelector('HttpRequest'),
  });
  plugin.registerSymbol({
    external: '@angular/core',
    name: 'inject',
    selector: plugin.api.getSelector('inject'),
  });
  plugin.registerSymbol({
    external: '@angular/core',
    name: 'Injectable',
    selector: plugin.api.getSelector('Injectable'),
  });
  plugin.registerSymbol({
    external: '@angular/common/http',
    name: 'httpResource',
    selector: plugin.api.getSelector('httpResource'),
  });

  if (plugin.config.httpRequests.enabled) {
    createHttpRequests({ plugin });
  }

  if (plugin.config.httpResources.enabled) {
    createHttpResources({ plugin });
  }
};

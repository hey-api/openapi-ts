import { angularHttpRequestsCompanionPluginHandler } from './companions/angularHttpRequestsCompanionPluginHandler';
import { angularHttpResourceCompanionPluginHandler } from './companions/angularHttpResourceCompanionPluginHandler';
import type { AngularCommonPlugin } from './types';

export const handler: AngularCommonPlugin['Handler'] = (args) => {
  angularHttpRequestsCompanionPluginHandler(args);

  if (args.plugin.config.httpResource?.enabled) {
    angularHttpResourceCompanionPluginHandler(args);
  }
};

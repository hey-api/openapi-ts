import { angularHttpRequestsCompanionPluginHandler } from './companions/angularHttpRequestsCompanionPluginHandler';
import { angularHttpResourceCompanionPluginHandler } from './companions/angularHttpResourceCompanionPluginHandler';
import type { HeyApiAngularCommonPlugin } from './types';

export const handler: HeyApiAngularCommonPlugin['Handler'] = (args) => {
  angularHttpRequestsCompanionPluginHandler(args);

  if (args.plugin.config.httpResource?.enabled) {
    angularHttpResourceCompanionPluginHandler(args);
  }
};

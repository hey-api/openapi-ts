import { createHttpRequests } from './httpRequests';
import { createHttpResources } from './httpResources';
import type { AngularCommonPlugin } from './types';

export const handler: AngularCommonPlugin['Handler'] = ({ plugin }) => {
  if (plugin.config.httpRequests.enabled) {
    createHttpRequests({ plugin });
  }

  if (plugin.config.httpResources.enabled) {
    createHttpResources({ plugin });
  }
};

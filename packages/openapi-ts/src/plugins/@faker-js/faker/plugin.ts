import type { FakerJsFakerPlugin } from './types';
import { handlerV10 } from './v10/plugin';

export const handler: FakerJsFakerPlugin['Handler'] = (args) => {
  const { plugin } = args;
  switch (plugin.config.compatibilityVersion) {
    case 9:
    case 10:
    default:
      return handlerV10(args);
  }
};

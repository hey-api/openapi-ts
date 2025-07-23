import { handlerMini } from './mini/plugin';
import type { ZodPlugin } from './types';
import { handlerV3 } from './v3/plugin';
import { handlerV4 } from './v4/plugin';

export const handler: ZodPlugin['Handler'] = (args) => {
  const { plugin } = args;
  switch (plugin.config.compatibilityVersion) {
    case 4:
    default:
      return handlerV4(args);
    case 'mini':
      return handlerMini(args);
    case 3:
      return handlerV3(args);
  }
};

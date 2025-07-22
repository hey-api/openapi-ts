import type { ZodPlugin } from './types';
import { handlerV3 } from './v3/plugin';

export const handler: ZodPlugin['Handler'] = (args) => {
  const { plugin } = args;

  switch (plugin.config.compatibilityVersion) {
    case 3:
      return handlerV3(args);
    case 4:
    case 'mini':
    default:
      // TODO: handle Zod 4
      // TODO: handle Zod Mini
      return handlerV3(args);
  }
};

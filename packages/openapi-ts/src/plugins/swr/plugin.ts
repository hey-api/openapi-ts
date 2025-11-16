import type { SwrPlugin } from './types';
import { handlerV2 } from './v2/plugin';

export const handler: SwrPlugin['Handler'] = (args) => handlerV2(args);

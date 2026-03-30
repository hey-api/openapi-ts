import type { MswPlugin } from './types';
import { handlerV2 } from './v2/plugin';

export const handler: MswPlugin['Handler'] = (args) => handlerV2(args);

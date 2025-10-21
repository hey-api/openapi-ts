import type { ArktypePlugin } from './types';
import { handlerV2 } from './v2/plugin';

export const handler: ArktypePlugin['Handler'] = (args) => handlerV2(args);

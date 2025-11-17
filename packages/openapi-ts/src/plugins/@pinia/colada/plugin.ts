import type { PiniaColadaPlugin } from './types';
import { handlerV0 } from './v0/plugin';

export const handler: PiniaColadaPlugin['Handler'] = (args) => handlerV0(args);

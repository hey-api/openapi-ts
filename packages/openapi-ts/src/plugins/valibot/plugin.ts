import type { ValibotPlugin } from './types';
import { handlerV1 } from './v1/plugin';

export const handler: ValibotPlugin['Handler'] = (args) => handlerV1(args);

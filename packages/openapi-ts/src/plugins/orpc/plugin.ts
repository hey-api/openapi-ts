import type { OrpcPlugin } from './types';
import { handlerV1 } from './v1/plugin';

export const handler: OrpcPlugin['Handler'] = (args) => handlerV1(args);

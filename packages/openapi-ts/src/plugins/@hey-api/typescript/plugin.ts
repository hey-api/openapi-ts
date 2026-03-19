import type { HeyApiTypeScriptPlugin } from './types';
import { handlerV1 } from './v1/plugin';

export const handler: HeyApiTypeScriptPlugin['Handler'] = (args) => handlerV1(args);

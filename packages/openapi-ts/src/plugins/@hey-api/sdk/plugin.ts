import type { HeyApiSdkPlugin } from './types';
import { handlerV1 } from './v1/plugin';

export const handler: HeyApiSdkPlugin['Handler'] = (args) => handlerV1(args);

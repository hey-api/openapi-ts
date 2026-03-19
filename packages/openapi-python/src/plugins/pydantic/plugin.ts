import type { PydanticPlugin } from './types';
import { handlerV2 } from './v2/plugin';

export const handler: PydanticPlugin['Handler'] = (args) => handlerV2(args);

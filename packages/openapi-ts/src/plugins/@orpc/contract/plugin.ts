import type { OrpcContractPlugin } from './types';
import { handlerV1 } from './v1/plugin';

export const handler: OrpcContractPlugin['Handler'] = (args) => handlerV1(args);

import type { PluginHandler } from './types';
import { handlerV2 } from './v2/plugin';

/**
 * Main handler for the SWR plugin.
 *
 * This plugin generates useSWR and useSWRMutation options for each operation.
 * It follows SWR's official recommended patterns for key design and data fetching.
 */
export const handler: PluginHandler = handlerV2;

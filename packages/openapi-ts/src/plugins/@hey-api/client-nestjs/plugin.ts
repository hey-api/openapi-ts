import { createClientConfigType } from '../client-core/createClientConfig';
import { generateNestjsClient } from './nestjs-generator';
import type { HeyApiClientNestjsPlugin } from './types';

export const clientPluginHandler = ({
  plugin,
}: {
  plugin: Parameters<HeyApiClientNestjsPlugin['Handler']>[0]['plugin'];
}) => {
  // Create client configuration type (reuse from client-core)
  createClientConfigType({
    plugin,
  });

  // Generate all NestJS client artifacts (client, services, module, index)
  // Now consolidated in a single generator with deduplication fixes for issues #3 and #4
  generateNestjsClient({ plugin });
};

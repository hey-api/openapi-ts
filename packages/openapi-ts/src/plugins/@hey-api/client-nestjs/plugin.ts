import { createClientConfigType } from '../client-core/createClientConfig';
import { clientId } from '../client-core/utils';
import { generateNestjsIndex } from './bundle-index-generator';
import { generateNestjsClient } from './nestjs-client-generator';
import { generateNestjsModule } from './nestjs-module-generator';
import { generateServices } from './nestjs-service-generator';
import type { HeyApiClientNestjsPlugin } from './types';

export const clientPluginHandler = ({
  plugin,
}: {
  plugin: Parameters<HeyApiClientNestjsPlugin['Handler']>[0]['plugin'];
}) => {
  // Create main client file structure
  plugin.createFile({
    id: clientId,
    path: plugin.output,
  });

  // Create client configuration type (reuse from client-core)
  createClientConfigType({
    plugin,
  });

  // Generate the injectable client wrapper
  generateNestjsClient({ plugin });

  // Generate services for each tag
  const serviceGroups = generateServices({ plugin });

  // Generate the NestJS module
  generateNestjsModule({
    plugin,
    serviceGroups,
  });

  // Generate the main index file
  generateNestjsIndex({
    plugin,
    serviceGroups,
  });
};

import { pathToJsonPointer } from '@hey-api/shared';

import { getZodModule } from '../shared/module';
import { irOperationToAst } from '../shared/operation';
import { irWebhookToAst } from '../shared/webhook';
import type { ZodPlugin } from '../types';
import { createProcessor } from './processor';

export const handlerV3: ZodPlugin['Handler'] = ({ plugin }) => {
  plugin.symbol('z', {
    external: getZodModule({ plugin }),
    meta: {
      category: 'external',
      resource: 'zod.z',
    },
  });

  const processor = createProcessor(plugin);

  plugin.forEach('operation', 'parameter', 'requestBody', 'schema', 'webhook', (event) => {
    switch (event.type) {
      case 'operation':
        irOperationToAst({
          operation: event.operation,
          path: event._path,
          plugin,
          processor,
          tags: event.tags,
        });
        break;
      case 'parameter':
        processor.process({
          meta: {
            resource: 'definition',
            resourceId: pathToJsonPointer(event._path),
          },
          naming: plugin.config.definitions,
          path: event._path,
          plugin,
          schema: event.parameter.schema,
          tags: event.tags,
        });
        break;
      case 'requestBody':
        processor.process({
          meta: {
            resource: 'definition',
            resourceId: pathToJsonPointer(event._path),
          },
          naming: plugin.config.definitions,
          path: event._path,
          plugin,
          schema: event.requestBody.schema,
          tags: event.tags,
        });
        break;
      case 'schema':
        processor.process({
          meta: {
            resource: 'definition',
            resourceId: pathToJsonPointer(event._path),
          },
          naming: plugin.config.definitions,
          path: event._path,
          plugin,
          schema: event.schema,
          tags: event.tags,
        });
        break;
      case 'webhook':
        irWebhookToAst({
          operation: event.operation,
          path: event._path,
          plugin,
          processor,
          tags: event.tags,
        });
        break;
    }
  });
};

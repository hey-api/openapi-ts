import { pathToJsonPointer } from '@hey-api/shared';

import { irOperationToAst } from '../shared/operation';
import { irWebhookToAst } from '../shared/webhook';
import type { ValibotPlugin } from '../types';
import { createProcessor } from './processor';

export const handlerV1: ValibotPlugin['Handler'] = ({ plugin }) => {
  plugin.symbol('v', {
    external: 'valibot',
    importKind: 'namespace',
    meta: {
      category: 'external',
      resource: 'valibot.v',
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

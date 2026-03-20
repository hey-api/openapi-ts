import type { SymbolMeta } from '@hey-api/codegen-core';
import { fromRef, refs } from '@hey-api/codegen-core';
import type { IR, SchemaWithType } from '@hey-api/shared';
import { applyNaming, deduplicateSchema, pathToJsonPointer, refToName } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import { exportAst } from '../shared/export';
import type { IrSchemaToAstOptions, PluginState } from '../shared/types';
import type { ArktypePlugin } from '../types';
import { createProcessor } from './processor';

export const handlerV2: ArktypePlugin['Handler'] = ({ plugin }) => {
  plugin.symbol('type', {
    external: 'arktype',
    meta: {
      category: 'external',
      resource: 'arktype.type',
    },
  });

  const processor = createProcessor(plugin);

  plugin.forEach('operation', 'parameter', 'requestBody', 'schema', 'webhook', (event) => {
    switch (event.type) {
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
        // TODO: Implement webhook handling
        break;
    }
  });
};
import { pathToJsonPointer } from '@hey-api/shared';

// import { $ } from '../../../py-dsl';
import type { PydanticPlugin } from '../types';
import { createProcessor } from './processor';

export const handlerV2: PydanticPlugin['Handler'] = ({ plugin }) => {
  plugin.symbol('Any', {
    external: 'typing',
    importKind: 'named',
    meta: {
      category: 'external',
      resource: 'typing.Any',
    },
  });
  plugin.symbol('BaseModel', {
    external: 'pydantic',
    importKind: 'named',
    meta: {
      category: 'external',
      resource: 'pydantic.BaseModel',
    },
  });
  plugin.symbol('ConfigDict', {
    external: 'pydantic',
    importKind: 'named',
    meta: {
      category: 'external',
      resource: 'pydantic.ConfigDict',
    },
  });
  plugin.symbol('Field', {
    external: 'pydantic',
    importKind: 'named',
    meta: {
      category: 'external',
      resource: 'pydantic.Field',
    },
  });
  plugin.symbol('Literal', {
    external: 'typing',
    importKind: 'named',
    meta: {
      category: 'external',
      resource: 'typing.Literal',
    },
  });
  plugin.symbol('Optional', {
    external: 'typing',
    importKind: 'named',
    meta: {
      category: 'external',
      resource: 'typing.Optional',
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
    }
  });
};

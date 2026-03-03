import { pathToJsonPointer } from '@hey-api/shared';

import type { PydanticPlugin } from '../types';
import { createProcessor } from './processor';

export const handlerV2: PydanticPlugin['Handler'] = ({ plugin }) => {
  // enum
  plugin.symbol('Enum', {
    external: 'enum',
    meta: {
      category: 'external',
      resource: 'enum.Enum',
    },
  });

  // typing
  plugin.symbol('Any', {
    external: 'typing',
    meta: {
      category: 'external',
      resource: 'typing.Any',
    },
  });
  plugin.symbol('List', {
    external: 'typing',
    meta: {
      category: 'external',
      resource: 'typing.List',
    },
  });
  plugin.symbol('Literal', {
    external: 'typing',
    meta: {
      category: 'external',
      resource: 'typing.Literal',
    },
  });
  plugin.symbol('NoReturn', {
    external: 'typing',
    meta: {
      category: 'external',
      resource: 'typing.NoReturn',
    },
  });
  plugin.symbol('Optional', {
    external: 'typing',
    meta: {
      category: 'external',
      resource: 'typing.Optional',
    },
  });
  plugin.symbol('TypeAlias', {
    external: 'typing',
    meta: {
      category: 'external',
      resource: 'typing.TypeAlias',
    },
  });
  plugin.symbol('Union', {
    external: 'typing',
    meta: {
      category: 'external',
      resource: 'typing.Union',
    },
  });

  // Pydantic
  plugin.symbol('BaseModel', {
    external: 'pydantic',
    meta: {
      category: 'external',
      resource: 'pydantic.BaseModel',
    },
  });
  plugin.symbol('ConfigDict', {
    external: 'pydantic',
    meta: {
      category: 'external',
      resource: 'pydantic.ConfigDict',
    },
  });
  plugin.symbol('Field', {
    external: 'pydantic',
    meta: {
      category: 'external',
      resource: 'pydantic.Field',
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

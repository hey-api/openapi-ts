import { pathToJsonPointer } from '@hey-api/shared';

import type { PydanticPlugin } from '../types';
import { createProcessor } from './processor';

export const handlerV2: PydanticPlugin['Handler'] = ({ plugin }) => {
  // enum
  plugin.symbol('Enum', {
    external: 'enum',
  });

  // typing
  plugin.symbol('Any', {
    external: 'typing',
  });
  plugin.symbol('Literal', {
    external: 'typing',
  });
  plugin.symbol('NoReturn', {
    external: 'typing',
  });
  plugin.symbol('Optional', {
    external: 'typing',
  });
  plugin.symbol('TypeAlias', {
    external: 'typing',
  });
  plugin.symbol('Union', {
    external: 'typing',
  });

  // Pydantic
  plugin.symbol('BaseModel', {
    external: 'pydantic',
  });
  plugin.symbol('ConfigDict', {
    external: 'pydantic',
  });
  plugin.symbol('Field', {
    external: 'pydantic',
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

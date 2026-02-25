import type { SchemaWithType } from '@hey-api/shared';

import type { PydanticType } from '../../shared/types';
import type { PydanticPlugin } from '../../types';

export function unknownToType({
  plugin,
}: {
  plugin: PydanticPlugin['Instance'];
  schema: SchemaWithType<'unknown'>;
}): PydanticType {
  return {
    typeAnnotation: plugin.external('typing.Any'),
  };
}

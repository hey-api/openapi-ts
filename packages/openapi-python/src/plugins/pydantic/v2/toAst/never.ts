import type { SchemaWithType } from '@hey-api/shared';

import type { PydanticType } from '../../shared/types';
import type { PydanticPlugin } from '../../types';

export function neverToType({
  plugin,
}: {
  plugin: PydanticPlugin['Instance'];
  schema: SchemaWithType<'never'>;
}): PydanticType {
  return {
    typeAnnotation: plugin.external('typing.NoReturn'),
  };
}

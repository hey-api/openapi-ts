import type { SchemaWithType } from '@hey-api/shared';

import type { PydanticType } from '../../shared/types';
import type { PydanticPlugin } from '../../types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function undefinedToType(args: {
  plugin: PydanticPlugin['Instance'];
  schema: SchemaWithType<'undefined'>;
}): PydanticType {
  return {
    typeAnnotation: 'None',
  };
}

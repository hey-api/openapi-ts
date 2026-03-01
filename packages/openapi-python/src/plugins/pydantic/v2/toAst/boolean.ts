import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
import type { PydanticType } from '../../shared/types';
import type { PydanticPlugin } from '../../types';

export function booleanToType({
  plugin,
  schema,
}: {
  plugin: PydanticPlugin['Instance'];
  schema: SchemaWithType<'boolean'>;
}): PydanticType {
  if (typeof schema.const === 'boolean') {
    const literal = plugin.external('typing.Literal');
    return {
      typeAnnotation: $(literal).slice($.literal(schema.const)),
    };
  }

  return {
    typeAnnotation: 'bool',
  };
}

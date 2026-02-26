import type { SchemaWithType } from '@hey-api/shared';

import { defaultMeta } from '../../shared/meta';
import type { PydanticResult } from '../../shared/types';
import type { PydanticPlugin } from '../../types';

export function booleanToType({
  plugin,
  schema,
}: {
  plugin: PydanticPlugin['Instance'];
  schema: SchemaWithType<'boolean'>;
}): PydanticResult {
  if (typeof schema.const === 'boolean') {
    const literal = plugin.external('typing.Literal');
    return {
      fieldConstraints: {},
      meta: defaultMeta(schema),
      typeAnnotation: `${literal}[${schema.const ? 'True' : 'False'}]`,
    };
  }

  return {
    fieldConstraints: {},
    meta: defaultMeta(schema),
    typeAnnotation: 'bool',
  };
}

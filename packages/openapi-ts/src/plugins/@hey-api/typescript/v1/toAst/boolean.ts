import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { Type } from '../../shared/types';
import type { HeyApiTypeScriptPlugin } from '../../types';

export function booleanToAst({
  schema,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'boolean'>;
}): Type {
  if (schema.const !== undefined) {
    return $.type.fromValue(schema.const);
  }

  return $.type('boolean');
}

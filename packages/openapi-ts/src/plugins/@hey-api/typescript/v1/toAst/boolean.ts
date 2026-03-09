import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { HeyApiTypeScriptPlugin, Type } from '../../shared/types';

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

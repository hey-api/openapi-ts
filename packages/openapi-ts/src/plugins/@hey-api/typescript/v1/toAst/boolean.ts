import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { HeyApiTypeScriptPlugin, TypeScriptResult } from '../../shared/types';

export function booleanToAst({
  schema,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'boolean'>;
}): TypeScriptResult['type'] {
  if (schema.const !== undefined) {
    return $.type.fromValue(schema.const);
  }

  return $.type('boolean');
}

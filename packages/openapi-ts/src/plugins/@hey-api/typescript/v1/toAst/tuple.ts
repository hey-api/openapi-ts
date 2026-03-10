import { ref } from '@hey-api/codegen-core';
import type { SchemaWithType } from '@hey-api/shared';
import type { Walker } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { Type } from '../../shared/types';
import type { TypeScriptResult } from '../../shared/types';
import type { HeyApiTypeScriptPlugin } from '../../types';

export function tupleToAst({
  plugin,
  schema,
  walk,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'tuple'>;
  walk: Walker<TypeScriptResult, HeyApiTypeScriptPlugin['Instance']>;
}): Type {
  let itemTypes: Array<Type> = [];

  if (schema.const && Array.isArray(schema.const)) {
    itemTypes = schema.const.map((value) => $.type.fromValue(value));
  } else if (schema.items) {
    schema.items.forEach((item) => {
      const result = walk(item, { path: ref([]), plugin });
      itemTypes.push(result.type);
    });
  }

  return $.type.tuple(...itemTypes);
}

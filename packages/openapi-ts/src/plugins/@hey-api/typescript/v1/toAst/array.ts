import { ref } from '@hey-api/codegen-core';
import type { SchemaWithType } from '@hey-api/shared';
import type { Walker } from '@hey-api/shared';
import { deduplicateSchema } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { HeyApiTypeScriptPlugin } from '../../shared/types';
import type { TypeScriptResult } from '../../shared/types';

export function arrayToAst({
  plugin,
  schema,
  walk,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'array'>;
  walk: Walker<TypeScriptResult, HeyApiTypeScriptPlugin['Instance']>;
}): TypeScriptResult['type'] {
  if (!schema.items) {
    return $.type('Array').generic($.type(plugin.config.topType));
  }

  const dedupedSchema = deduplicateSchema({ detectFormat: true, schema });
  if (!dedupedSchema.items) {
    return $.type('Array').generic($.type(plugin.config.topType));
  }

  const itemResults: Array<TypeScriptResult> = dedupedSchema.items.map((item) =>
    walk(item, {
      path: ref([]),
      plugin,
    }),
  );
  if (itemResults.length === 1) {
    return $.type('Array').generic(itemResults[0]!.type);
  }

  return dedupedSchema.logicalOperator === 'and'
    ? $.type('Array').generic($.type.and(...itemResults.map((r) => r.type)))
    : $.type('Array').generic($.type.or(...itemResults.map((r) => r.type)));
}

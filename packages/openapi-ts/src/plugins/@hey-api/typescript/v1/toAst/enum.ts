import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { HeyApiTypeScriptPlugin, TypeScriptResult } from '../../shared/types';
import type { TypeScriptEnumData } from '../../shared/types';

function buildEnumData(
  plugin: HeyApiTypeScriptPlugin['Instance'],
  schema: SchemaWithType<'enum'>,
): TypeScriptEnumData | undefined {
  if (!plugin.config.enums.enabled) {
    return undefined;
  }

  const items = schema.items ?? [];
  const mode = plugin.config.enums.mode;

  return {
    items: items.map((item, index) => {
      let key: string;
      if (item.title) {
        key = item.title;
      } else if (typeof item.const === 'number' || typeof item.const === 'string') {
        key = `${item.const}`;
      } else if (typeof item.const === 'boolean') {
        key = item.const ? 'true' : 'false';
      } else if (item.const === null) {
        key = 'null';
      } else {
        key = `${index}`;
      }
      return { key, schema: item };
    }),
    mode,
  };
}

export function enumToAst({
  plugin,
  schema,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'enum'>;
}): {
  enumData?: TypeScriptEnumData;
  type: TypeScriptResult['type'];
} {
  const items = schema.items ?? [];
  const enumData = buildEnumData(plugin, schema);

  let type: TypeScriptResult['type'];

  if (items.length === 0) {
    type = $.type('never');
  } else {
    const literalTypes = items
      .filter((item) => item.const !== undefined)
      .map((item) => $.type.fromValue(item.const));
    type = literalTypes.length > 0 ? $.type.or(...literalTypes) : $.type('string');
  }

  return {
    enumData,
    type,
  };
}

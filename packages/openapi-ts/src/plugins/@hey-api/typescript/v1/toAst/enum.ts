import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { EnumResolverContext } from '../../resolvers';
import type { HeyApiTypeScriptPlugin, Type } from '../../shared/types';
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

function itemsNode(ctx: EnumResolverContext): ReturnType<EnumResolverContext['nodes']['items']> {
  const { schema } = ctx;
  const items = schema.items ?? [];

  const enumMembers: Array<ReturnType<typeof $.type.literal>> = [];
  let isNullable = false;

  for (const item of items) {
    if (item.type === 'string' && typeof item.const === 'string') {
      enumMembers.push($.type.literal(item.const));
    } else if (item.type === 'number' && typeof item.const === 'number') {
      enumMembers.push($.type.literal(item.const));
    } else if (item.type === 'boolean' && typeof item.const === 'boolean') {
      enumMembers.push($.type.literal(item.const));
    } else if (item.type === 'null' || item.const === null) {
      isNullable = true;
    }
  }

  return { enumMembers, isNullable };
}

function baseNode(ctx: EnumResolverContext): Type {
  const { schema } = ctx;
  const items = schema.items ?? [];

  if (items.length === 0) {
    return $.type('never');
  }

  const literalTypes = items
    .filter((item) => item.const !== undefined)
    .map((item) => $.type.fromValue(item.const));
  return literalTypes.length > 0 ? $.type.or(...literalTypes) : $.type('string');
}

function enumResolver(ctx: EnumResolverContext): Type {
  return ctx.nodes.base(ctx);
}

export function enumToAst({
  plugin,
  schema,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'enum'>;
}): {
  enumData?: TypeScriptEnumData;
  type: Type;
} {
  const enumData = buildEnumData(plugin, schema);

  const ctx: EnumResolverContext = {
    $,
    nodes: {
      base: baseNode,
      items: itemsNode,
    },
    plugin,
    schema,
  };

  const resolver = plugin.config['~resolvers']?.enum;
  const type = resolver?.(ctx) ?? enumResolver(ctx);

  return {
    enumData,
    type,
  };
}

import type { SchemaWithType } from '@hey-api/shared';
import { toCase } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
import type { EnumResolverContext } from '../../resolvers';
import type { PydanticFinal, PydanticType } from '../../shared/types';
import type { PydanticPlugin } from '../../types';

export interface EnumToTypeResult extends PydanticType {
  enumMembers: Required<PydanticFinal>['enumMembers'];
  isNullable: boolean;
}

// TODO: replace with casing utils
function toEnumMemberName(value: string | number): string {
  if (typeof value === 'number') {
    // For numbers, prefix with underscore if starts with digit
    return `VALUE_${value}`.replace(/-/g, '_NEG_').replace(/\./g, '_DOT_');
  }

  return toCase(value, 'SCREAMING_SNAKE_CASE');
}

function itemsNode(ctx: EnumResolverContext) {
  const { plugin, schema } = ctx;
  const enumMembers: Required<PydanticFinal>['enumMembers'] = [];
  let isNullable = false;

  for (const item of schema.items ?? []) {
    if (item.type === 'null' || item.const === null) {
      isNullable = true;
      continue;
    }

    if (
      (item.type === 'string' && typeof item.const === 'string') ||
      ((item.type === 'integer' || item.type === 'number') && typeof item.const === 'number')
    ) {
      enumMembers.push({
        name: plugin.symbol(toEnumMemberName(item.const)),
        value: item.const,
      });
    }
  }

  return { enumMembers, isNullable };
}

function baseNode(ctx: EnumResolverContext): PydanticType {
  const { plugin } = ctx;
  const { enumMembers } = ctx.nodes.items(ctx);

  if (!enumMembers.length) {
    return {
      type: plugin.external('typing.Any'),
    };
  }

  const mode = plugin.config.enums ?? 'enum';

  if (mode === 'literal') {
    if (!enumMembers.length) {
      return {
        type: plugin.external('typing.Any'),
      };
    }

    const literal = plugin.external('typing.Literal');
    const values = enumMembers.map((m) =>
      // TODO: replace
      typeof m.value === 'string' ? `"<<<<${m.value}"` : `<<<${m.value}`,
    );

    return {
      type: $(literal).slice(...values),
    };
  }

  return {};
}

function enumResolver(ctx: EnumResolverContext): PydanticType {
  return ctx.nodes.base(ctx);
}

export function enumToType({
  plugin,
  schema,
}: {
  plugin: PydanticPlugin['Instance'];
  schema: SchemaWithType<'enum'>;
}): EnumToTypeResult {
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
  const resolved = resolver?.(ctx) ?? enumResolver(ctx);

  const { enumMembers, isNullable } = ctx.nodes.items(ctx);

  return {
    ...resolved,
    enumMembers,
    isNullable,
  };
}

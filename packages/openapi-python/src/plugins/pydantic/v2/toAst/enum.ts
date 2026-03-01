import type { Symbol } from '@hey-api/codegen-core';
import type { SchemaWithType } from '@hey-api/shared';
import { toCase } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
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

function extractEnumMembers(
  schema: SchemaWithType<'enum'>,
  plugin: PydanticPlugin['Instance'],
): {
  enumMembers: Required<PydanticFinal>['enumMembers'];
  isNullable: boolean;
} {
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

function toLiteralType(
  enumMembers: Required<PydanticFinal>['enumMembers'],
  plugin: PydanticPlugin['Instance'],
): string | Symbol | ReturnType<typeof $.subscript> {
  if (enumMembers.length === 0) {
    return plugin.external('typing.Any');
  }

  const literal = plugin.external('typing.Literal');
  const values = enumMembers.map((m) =>
    // TODO: replace
    typeof m.value === 'string' ? `"<<<<${m.value}"` : `<<<${m.value}`,
  );

  return $(literal).slice(...values);
}

export function enumToType({
  mode = 'enum',
  plugin,
  schema,
}: {
  mode?: 'enum' | 'literal';
  plugin: PydanticPlugin['Instance'];
  schema: SchemaWithType<'enum'>;
}): EnumToTypeResult {
  const { enumMembers, isNullable } = extractEnumMembers(schema, plugin);

  if (enumMembers.length === 0) {
    return {
      enumMembers,
      isNullable,
      typeAnnotation: plugin.external('typing.Any'),
    };
  }

  if (mode === 'literal') {
    return {
      enumMembers,
      isNullable,
      typeAnnotation: toLiteralType(enumMembers, plugin),
    };
  }

  return {
    enumMembers,
    isNullable,
  };
}

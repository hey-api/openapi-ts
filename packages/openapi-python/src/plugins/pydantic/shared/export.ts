import type { Symbol } from '@hey-api/codegen-core';
import { applyNaming, pathToName } from '@hey-api/shared';

import { $ } from '../../../py-dsl';
import type { PydanticPlugin } from '../types';
import { createFieldCall, hasConstraints } from './field';
import type { ProcessorContext } from './processor';
import type { PydanticField, PydanticFinal } from './types';

export function exportAst({
  final,
  meta,
  naming,
  namingAnchor,
  path,
  plugin,
  tags,
}: ProcessorContext & {
  final: PydanticFinal;
}): void {
  const name = pathToName(path, { anchor: namingAnchor });
  const symbol = plugin.symbol(applyNaming(name, naming), {
    meta: {
      category: 'schema',
      path,
      tags,
      tool: 'pydantic',
      ...meta,
    },
  });

  if (final.enumMembers) {
    exportEnumClass({ final, plugin, symbol });
  } else if (final.fields) {
    exportClass({ final, plugin, symbol });
  } else {
    exportTypeAlias({ final, plugin, symbol });
  }
}

function exportClass({
  final,
  plugin,
  symbol,
}: {
  final: PydanticFinal;
  plugin: PydanticPlugin['Instance'];
  symbol: Symbol;
}): void {
  const baseModel = plugin.external('pydantic.BaseModel');
  const classDef = $.class(symbol).extends(baseModel);

  if (plugin.config.strict) {
    const configDict = plugin.external('pydantic.ConfigDict');
    classDef.do($.var('model_config').assign($(configDict).call($.kwarg('extra', 'forbid'))));
  }

  for (const field of final.fields!) {
    const fieldStatement = createFieldStatement(field, plugin);
    classDef.do(fieldStatement);
  }

  plugin.node(classDef);
}

function exportEnumClass({
  final,
  plugin,
  symbol,
}: {
  final: PydanticFinal;
  plugin: PydanticPlugin['Instance'];
  symbol: Symbol;
}): void {
  const members = final.enumMembers ?? [];
  const hasStrings = members.some((m) => typeof m.value === 'string');
  const hasNumbers = members.some((m) => typeof m.value === 'number');

  const enumSymbol = plugin.external('enum.Enum');
  const classDef = $.class(symbol).extends(enumSymbol);

  if (hasStrings && !hasNumbers) {
    classDef.extends('str');
  } else if (!hasStrings && hasNumbers) {
    classDef.extends('int');
  }

  for (const member of final.enumMembers ?? []) {
    classDef.do($.var(member.name).assign($.literal(member.value)));
  }

  plugin.node(classDef);
}

function createFieldStatement(
  field: PydanticField,
  plugin: PydanticPlugin['Instance'],
): ReturnType<typeof $.var> {
  const fieldSymbol = field.name;
  const varStatement = $.var(fieldSymbol).$if(field.typeAnnotation, (v, a) => v.annotate(a));

  const originalName = field.originalName ?? fieldSymbol.name;
  const needsAlias = field.originalName !== undefined && fieldSymbol.name !== originalName;

  const constraints = {
    ...field.fieldConstraints,
    ...(needsAlias && !field.fieldConstraints?.alias && { alias: originalName }),
  };

  if (hasConstraints(constraints)) {
    const fieldCall = createFieldCall(constraints, plugin, {
      required: !field.isOptional,
    });
    return varStatement.assign(fieldCall);
  }

  if (field.isOptional) {
    return varStatement.assign('None');
  }

  return varStatement;
}

function exportTypeAlias({
  final,
  plugin,
  symbol,
}: {
  final: PydanticFinal;
  plugin: PydanticPlugin['Instance'];
  symbol: Symbol;
}): void {
  const typeAlias = plugin.external('typing.TypeAlias');
  const statement = $.var(symbol)
    .annotate(typeAlias)
    .assign(final.typeAnnotation ?? plugin.external('typing.Any'));
  plugin.node(statement);
}

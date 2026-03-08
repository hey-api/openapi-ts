import type { SchemaVisitorContext, SchemaWithType, Walker } from '@hey-api/shared';
import { childContext } from '@hey-api/shared';

import { $, type VarType } from '../../../../py-dsl';
import type { PydanticFinal, PydanticResult, PydanticType } from '../../shared/types';
import type { PydanticPlugin } from '../../types';
import type { FieldConstraints } from '../constants';

interface TupleToTypeContext {
  applyModifiers: (result: PydanticResult, options?: { optional?: boolean }) => PydanticFinal;
  plugin: PydanticPlugin['Instance'];
  schema: SchemaWithType<'tuple'>;
  walk: Walker<PydanticResult, PydanticPlugin['Instance']>;
  walkerCtx: SchemaVisitorContext<PydanticPlugin['Instance']>;
}

export interface TupleToTypeResult extends PydanticType {
  childResults: Array<PydanticResult>;
}

export function tupleToType(ctx: TupleToTypeContext): TupleToTypeResult {
  const { applyModifiers, plugin, schema, walk, walkerCtx } = ctx;

  const childResults: Array<PydanticResult> = [];
  const constraints: FieldConstraints = {};
  const tuple = plugin.external('typing.Tuple');
  const any = plugin.external('typing.Any');

  if (schema.description !== undefined) {
    constraints.description = schema.description;
  }

  if (!schema.items || schema.items.length === 0) {
    return {
      childResults,
      fieldConstraints: constraints,
      type: $(tuple).slice(),
    };
  }

  const itemTypes: Array<VarType> = [];

  for (let i = 0; i < schema.items.length; i++) {
    const item = schema.items[i]!;
    const result = walk(item, childContext(walkerCtx, 'items', i));
    childResults.push(result);

    const finalResult = applyModifiers(result);
    if (finalResult.type !== undefined) {
      itemTypes.push(finalResult.type);
    }
  }

  if (itemTypes.length === 0) {
    return {
      childResults,
      fieldConstraints: constraints,
      type: $(tuple).slice(any, '...'),
    };
  }

  return {
    childResults,
    fieldConstraints: constraints,
    type: $(tuple).slice(...itemTypes),
  };
}

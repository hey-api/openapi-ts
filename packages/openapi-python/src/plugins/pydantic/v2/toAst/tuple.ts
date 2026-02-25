import type { SchemaVisitorContext, SchemaWithType, Walker } from '@hey-api/shared';
import { childContext } from '@hey-api/shared';

import { $, type AnnotationExpr } from '../../../../py-dsl';
import type { PydanticFinal, PydanticResult, PydanticType } from '../../shared/types';
import type { PydanticPlugin } from '../../types';

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
  const constraints: Required<PydanticResult>['fieldConstraints'] = {};
  const tuple = plugin.external('typing.Tuple');
  const any = plugin.external('typing.Any');

  if (schema.description !== undefined) {
    constraints.description = schema.description;
  }

  if (!schema.items || schema.items.length === 0) {
    return {
      childResults,
      fieldConstraints: constraints,
      typeAnnotation: $(tuple).slice(),
    };
  }

  const itemTypes: Array<AnnotationExpr> = [];

  for (let i = 0; i < schema.items.length; i++) {
    const item = schema.items[i]!;
    const result = walk(item, childContext(walkerCtx, 'items', i));
    childResults.push(result);

    const finalResult = applyModifiers(result);
    if (finalResult.typeAnnotation !== undefined) {
      itemTypes.push(finalResult.typeAnnotation);
    }
  }

  if (itemTypes.length === 0) {
    return {
      childResults,
      fieldConstraints: constraints,
      typeAnnotation: $(tuple).slice(any, '...'),
    };
  }

  return {
    childResults,
    fieldConstraints: constraints,
    typeAnnotation: $(tuple).slice(...itemTypes),
  };
}

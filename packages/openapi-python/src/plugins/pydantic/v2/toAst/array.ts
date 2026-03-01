import type { SchemaVisitorContext, SchemaWithType, Walker } from '@hey-api/shared';
import { childContext, deduplicateSchema } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
import type { PydanticFinal, PydanticResult, PydanticType } from '../../shared/types';
import type { PydanticPlugin } from '../../types';

interface ArrayToTypeContext {
  applyModifiers: (result: PydanticResult, options?: { optional?: boolean }) => PydanticFinal;
  plugin: PydanticPlugin['Instance'];
  schema: SchemaWithType<'array'>;
  walk: Walker<PydanticResult, PydanticPlugin['Instance']>;
  walkerCtx: SchemaVisitorContext<PydanticPlugin['Instance']>;
}

export interface ArrayToTypeResult extends PydanticType {
  childResults: Array<PydanticResult>;
}

export function arrayToType(ctx: ArrayToTypeContext): ArrayToTypeResult {
  const { plugin, walk, walkerCtx } = ctx;
  let { schema } = ctx;

  const childResults: Array<PydanticResult> = [];
  const constraints: Required<PydanticResult>['fieldConstraints'] = {};
  const list = plugin.external('typing.List');
  const any = plugin.external('typing.Any');

  if (schema.minItems !== undefined) {
    constraints.min_length = schema.minItems;
  }

  if (schema.maxItems !== undefined) {
    constraints.max_length = schema.maxItems;
  }

  if (schema.description !== undefined) {
    constraints.description = schema.description;
  }

  if (!schema.items) {
    return {
      childResults,
      fieldConstraints: constraints,
      typeAnnotation: $(list).slice(any),
    };
  }

  schema = deduplicateSchema({ schema });

  for (let i = 0; i < schema.items!.length; i++) {
    const item = schema.items![i]!;
    const result = walk(item, childContext(walkerCtx, 'items', i));
    childResults.push(result);
  }

  if (childResults.length === 1) {
    const itemResult = ctx.applyModifiers(childResults[0]!);
    return {
      childResults,
      fieldConstraints: constraints,
      typeAnnotation: $(list).slice(itemResult.typeAnnotation ?? any),
    };
  }

  if (childResults.length > 1) {
    const union = plugin.external('typing.Union');
    const itemTypes = childResults.map((r) => ctx.applyModifiers(r).typeAnnotation ?? any);
    return {
      childResults,
      fieldConstraints: constraints,
      typeAnnotation: $(list).slice($(union).slice(...itemTypes)),
    };
  }

  return {
    childResults,
    fieldConstraints: constraints,
    typeAnnotation: $(list).slice(any),
  };
}

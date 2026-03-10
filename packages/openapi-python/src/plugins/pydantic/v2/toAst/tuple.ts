import type { SchemaVisitorContext, SchemaWithType, Walker } from '@hey-api/shared';
import { childContext } from '@hey-api/shared';

import { $, type VarType } from '../../../../py-dsl';
import type { TupleResolverContext } from '../../resolvers';
import type { PydanticFinal, PydanticResult, PydanticType } from '../../shared/types';
import type { PydanticPlugin } from '../../types';
import type { FieldConstraints } from '../constants';

function baseNode(ctx: TupleResolverContext): PydanticType {
  const { applyModifiers, childResults, plugin } = ctx;

  const tuple = plugin.external('typing.Tuple');
  const any = plugin.external('typing.Any');

  if (childResults.length === 0) {
    return {
      type: $(tuple).slice(),
    };
  }

  const itemTypes: Array<VarType> = [];

  for (const result of childResults) {
    const finalResult = applyModifiers(result);
    if (finalResult.type !== undefined) {
      itemTypes.push(finalResult.type);
    }
  }

  if (itemTypes.length === 0) {
    return {
      type: $(tuple).slice(any, '...'),
    };
  }

  return {
    type: $(tuple).slice(...itemTypes),
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function constNode(_ctx: TupleResolverContext): PydanticType | undefined {
  return;
}

function tupleResolver(ctx: TupleResolverContext): PydanticType {
  const baseResult = ctx.nodes.base(ctx);

  const fieldConstraints: FieldConstraints = {
    ...(baseResult.fieldConstraints ?? {}),
  };

  if (ctx.schema.description !== undefined) {
    fieldConstraints.description = ctx.schema.description;
  }

  return {
    ...baseResult,
    fieldConstraints: Object.keys(fieldConstraints).length > 0 ? fieldConstraints : undefined,
  };
}

export interface TupleToTypeResult extends PydanticType {
  childResults: Array<PydanticResult>;
}

export function tupleToType(ctx: {
  applyModifiers: (result: PydanticResult, options?: { optional?: boolean }) => PydanticFinal;
  plugin: PydanticPlugin['Instance'];
  schema: SchemaWithType<'tuple'>;
  walk: Walker<PydanticResult, PydanticPlugin['Instance']>;
  walkerCtx: SchemaVisitorContext<PydanticPlugin['Instance']>;
}): TupleToTypeResult {
  const { applyModifiers, plugin, schema, walk, walkerCtx } = ctx;

  const childResults: Array<PydanticResult> = [];

  if (schema.items && schema.items.length > 0) {
    for (let i = 0; i < schema.items.length; i++) {
      const item = schema.items[i]!;
      const result = walk(item, childContext(walkerCtx, 'items', i));
      childResults.push(result);
    }
  }

  const resolverCtx: TupleResolverContext = {
    $,
    applyModifiers,
    childResults,
    nodes: {
      base: baseNode,
      const: constNode,
    },
    plugin,
    schema,
    walk,
    walkerCtx,
  };

  const resolver = plugin.config['~resolvers']?.tuple;
  const resolved = resolver?.(resolverCtx) ?? tupleResolver(resolverCtx);

  return {
    ...resolved,
    childResults,
  };
}

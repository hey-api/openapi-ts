import { childContext } from '@hey-api/shared';

import { $, type VarType } from '../../../../py-dsl';
import type { TupleResolverContext } from '../../resolvers';
import type { PydanticResult, PydanticType } from '../../shared/types';
import type { FieldConstraints } from '../constants';

function baseNode(ctx: TupleResolverContext): PydanticType {
  const { applyModifiers, childResults, plugin } = ctx;

  const tuple = plugin.external('typing.Tuple');
  const any = plugin.external('typing.Any');

  if (!childResults.length) {
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

  if (!itemTypes.length) {
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
    fieldConstraints: Object.keys(fieldConstraints).length ? fieldConstraints : undefined,
  };
}

export interface TupleToTypeResult extends PydanticType {
  childResults: Array<PydanticResult>;
}

export function tupleToType(
  ctx: Pick<TupleResolverContext, 'applyModifiers' | 'path' | 'plugin' | 'schema' | 'walk'>,
): TupleToTypeResult {
  const { applyModifiers, path, plugin, schema, walk } = ctx;

  const childResults: Array<PydanticResult> = [];

  if (schema.items && schema.items.length) {
    for (let i = 0; i < schema.items.length; i++) {
      const item = schema.items[i]!;
      const result = walk(item, childContext({ path, plugin }, 'items', i));
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
    path,
    plugin,
    schema,
    walk,
  };

  const resolver = plugin.config['~resolvers']?.tuple;
  const resolved = resolver?.(resolverCtx) ?? tupleResolver(resolverCtx);

  return {
    ...resolved,
    childResults,
  };
}

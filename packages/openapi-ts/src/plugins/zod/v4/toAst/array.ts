import { childContext, deduplicateSchema } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { ArrayResolverContext } from '../../resolvers';
import type { Chain, ChainResult } from '../../shared/chain';
import type { CompositeHandlerResult, ZodResult } from '../../shared/types';
import { unknownToAst } from './unknown';

type ArrayToAstOptions = Pick<
  ArrayResolverContext,
  'applyModifiers' | 'plugin' | 'schema' | 'walk' | 'walkerCtx'
>;

function baseNode(ctx: ArrayResolverContext): Chain {
  const { applyModifiers, childResults, plugin, schema, symbols } = ctx;
  const { z } = symbols;

  const arrayFn = $(z).attr(identifiers.array);

  let normalizedSchema = schema;
  if (normalizedSchema.items) {
    normalizedSchema = deduplicateSchema({ schema: normalizedSchema });
  }

  if (!normalizedSchema.items) {
    return arrayFn.call(
      unknownToAst({
        plugin,
        schema: {
          type: 'unknown',
        },
      }),
    );
  }

  if (childResults.length === 1) {
    const itemNode = applyModifiers(childResults[0]!, { optional: false }).expression;
    return arrayFn.call(itemNode);
  }

  if (childResults.length > 1) {
    const itemExpressions: Array<Chain> = childResults.map(
      (result) => applyModifiers(result, { optional: false }).expression,
    );

    const firstSchema = normalizedSchema.items[0];
    if (normalizedSchema.logicalOperator === 'and') {
      let intersectionExpression: Chain;
      if (
        firstSchema?.logicalOperator === 'or' ||
        (firstSchema?.type && firstSchema.type !== 'object')
      ) {
        intersectionExpression = $(z)
          .attr(identifiers.intersection)
          .call(...itemExpressions);
      } else {
        intersectionExpression = itemExpressions[0]!;
        for (let i = 1; i < itemExpressions.length; i++) {
          intersectionExpression = intersectionExpression
            .attr(identifiers.and)
            .call(itemExpressions[i]);
        }
      }

      return arrayFn.call(intersectionExpression);
    } else {
      return arrayFn.call(
        $(z)
          .attr(identifiers.union)
          .call($.array(...itemExpressions)),
      );
    }
  }

  return arrayFn.call(
    unknownToAst({
      plugin,
      schema: {
        type: 'unknown',
      },
    }),
  );
}

function lengthNode(ctx: ArrayResolverContext): ChainResult {
  const { schema } = ctx;
  if (schema.minItems === schema.maxItems && schema.minItems !== undefined) {
    return ctx.chain.current.attr(identifiers.length).call($.fromValue(schema.minItems));
  }
}

function maxLengthNode(ctx: ArrayResolverContext): ChainResult {
  const { schema } = ctx;
  if (schema.maxItems === undefined) return;
  return ctx.chain.current.attr(identifiers.max).call($.fromValue(schema.maxItems));
}

function minLengthNode(ctx: ArrayResolverContext): ChainResult {
  const { schema } = ctx;
  if (schema.minItems === undefined) return;
  return ctx.chain.current.attr(identifiers.min).call($.fromValue(schema.minItems));
}

function arrayResolver(ctx: ArrayResolverContext): Chain {
  const baseResult = ctx.nodes.base(ctx);
  ctx.chain.current = baseResult;

  const lengthResult = ctx.nodes.length(ctx);
  if (lengthResult) {
    ctx.chain.current = lengthResult;
  } else {
    const minLengthResult = ctx.nodes.minLength(ctx);
    if (minLengthResult) {
      ctx.chain.current = minLengthResult;
    }

    const maxLengthResult = ctx.nodes.maxLength(ctx);
    if (maxLengthResult) {
      ctx.chain.current = maxLengthResult;
    }
  }

  return ctx.chain.current;
}

export function arrayToAst({
  applyModifiers,
  plugin,
  schema,
  walk,
  walkerCtx,
}: ArrayToAstOptions): CompositeHandlerResult {
  const childResults: Array<ZodResult> = [];
  let schemaCopy = schema;

  const z = plugin.external('zod.z');

  if (schemaCopy.items) {
    schemaCopy = deduplicateSchema({ schema: schemaCopy });

    schemaCopy.items!.forEach((item, index) => {
      const itemResult = walk(item, childContext(walkerCtx, 'items', index));
      childResults.push(itemResult);
    });
  }

  const ctx: ArrayResolverContext = {
    $,
    applyModifiers,
    chain: {
      current: $(z),
    },
    childResults,
    nodes: {
      base: baseNode,
      length: lengthNode,
      maxLength: maxLengthNode,
      minLength: minLengthNode,
    },
    plugin,
    schema,
    symbols: {
      z,
    },
    walk,
    walkerCtx,
  };

  const resolver = plugin.config['~resolvers']?.array;
  const expression = resolver?.(ctx) ?? arrayResolver(ctx);

  return {
    childResults,
    expression,
  };
}

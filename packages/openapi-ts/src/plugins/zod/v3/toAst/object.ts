import type { SchemaVisitorContext, SchemaWithType, Walker } from '@hey-api/shared';
import { childContext } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { ObjectResolverContext } from '../../resolvers';
import type { Chain } from '../../shared/chain';
import type { CompositeHandlerResult, ZodFinal, ZodResult } from '../../shared/types';
import type { ZodPlugin } from '../../types';

type WalkerCtx = SchemaVisitorContext<ZodPlugin['Instance']>;

interface ObjectToAstOptions {
  applyModifiers: (result: ZodResult, opts: { optional?: boolean }) => ZodFinal;
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'object'>;
  walk: Walker<ZodResult, ZodPlugin['Instance']>;
  walkerCtx: WalkerCtx;
}

type ExtendedContext = ObjectResolverContext;

function additionalPropertiesNode(ctx: ExtendedContext): Chain | null | undefined {
  const { applyModifiers, schema, walk, walkerCtx } = ctx;

  if (
    !schema.additionalProperties ||
    (schema.properties && Object.keys(schema.properties).length)
  ) {
    return;
  }

  const additionalResult = walk(
    schema.additionalProperties,
    childContext(walkerCtx, 'additionalProperties'),
  );
  ctx._childResults.push(additionalResult);
  const finalExpr = applyModifiers(additionalResult, {});
  return finalExpr.expression;
}

function baseNode(ctx: ExtendedContext): Chain {
  const { nodes, symbols } = ctx;
  const { z } = symbols;

  const additional = nodes.additionalProperties(ctx);
  const shape = nodes.shape(ctx);

  if (additional) {
    return $(z).attr(identifiers.record).call(additional);
  }

  return $(z).attr(identifiers.object).call(shape);
}

function objectResolver(ctx: ExtendedContext): Chain {
  return ctx.nodes.base(ctx);
}

function shapeNode(ctx: ExtendedContext): ReturnType<typeof $.object> {
  const { applyModifiers, schema, walk, walkerCtx } = ctx;
  const shape = $.object().pretty();

  for (const name in schema.properties) {
    const property = schema.properties[name]!;
    const isOptional = !schema.required?.includes(name);

    const propertyResult = walk(property, childContext(walkerCtx, 'properties', name));
    ctx._childResults.push(propertyResult);

    const finalExpr = applyModifiers(propertyResult, {
      optional: isOptional,
    });

    shape.prop(name, finalExpr.expression);
  }

  return shape;
}

export function objectToAst(options: ObjectToAstOptions): CompositeHandlerResult {
  const { applyModifiers, plugin, schema, walk, walkerCtx } = options;
  const childResults: Array<ZodResult> = [];
  const z = plugin.external('zod.z');
  const ctx: ExtendedContext = {
    $,
    _childResults: childResults,
    applyModifiers,
    chain: {
      current: $(z),
    },
    nodes: {
      additionalProperties: additionalPropertiesNode,
      base: baseNode,
      shape: shapeNode,
    },
    plugin,
    schema,
    symbols: {
      z,
    },
    walk,
    walkerCtx,
  };
  const resolver = plugin.config['~resolvers']?.object;
  const node = resolver?.(ctx) ?? objectResolver(ctx);

  return {
    childResults,
    expression: node,
  };
}

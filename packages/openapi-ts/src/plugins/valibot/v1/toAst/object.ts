import { childContext } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { ObjectResolverContext } from '../../resolvers';
import type { Pipe, Pipes } from '../../shared/pipes';
import { pipes, pipesToNode } from '../../shared/pipes';
import type { CompositeHandlerResult, ValibotResult } from '../../shared/types';
import { identifiers } from '../constants';

function additionalPropertiesNode(ctx: ObjectResolverContext): Pipe | null | undefined {
  const { schema } = ctx;

  if (!schema.additionalProperties || !schema.additionalProperties.type) return;
  if (schema.additionalProperties.type === 'never') return null;

  const additionalResult = ctx.walk(
    schema.additionalProperties,
    childContext(ctx.walkerCtx, 'additionalProperties'),
  );
  ctx._childResults.push(additionalResult);

  return pipesToNode(additionalResult.pipes, ctx.plugin);
}

function baseNode(ctx: ObjectResolverContext): Pipes | Pipe {
  const { v } = ctx.symbols;

  const additional = ctx.nodes.additionalProperties(ctx);
  const shape = ctx.nodes.shape(ctx);

  if (additional === null) {
    return $(v).attr(identifiers.schemas.strictObject).call(shape);
  }

  if (additional) {
    if (shape.isEmpty) {
      return $(v)
        .attr(identifiers.schemas.record)
        .call($(v).attr(identifiers.schemas.string).call(), additional);
    }

    return $(v).attr(identifiers.schemas.objectWithRest).call(shape, additional);
  }

  return $(v).attr(identifiers.schemas.object).call(shape);
}

function objectResolver(ctx: ObjectResolverContext): Pipes | Pipe {
  // TODO: parser - handle constants
  return ctx.nodes.base(ctx);
}

function shapeNode(ctx: ObjectResolverContext): ReturnType<typeof $.object> {
  const { schema } = ctx;
  const shape = $.object().pretty();

  for (const name in schema.properties) {
    const property = schema.properties[name]!;
    const isOptional = !schema.required?.includes(name);

    const propertyResult = ctx.walk(property, childContext(ctx.walkerCtx, 'properties', name));
    ctx._childResults.push(propertyResult);

    const finalExpr = ctx.applyModifiers(propertyResult, { optional: isOptional });
    shape.prop(name, pipesToNode(finalExpr.pipes, ctx.plugin));
  }

  return shape;
}

export function objectToPipes(
  ctx: Pick<ObjectResolverContext, 'applyModifiers' | 'plugin' | 'schema' | 'walk' | 'walkerCtx'>,
): CompositeHandlerResult {
  const { applyModifiers, plugin, schema, walk, walkerCtx } = ctx;

  const childResults: Array<ValibotResult> = [];

  const extendedCtx: ObjectResolverContext = {
    $,
    _childResults: childResults,
    applyModifiers,
    nodes: {
      additionalProperties: additionalPropertiesNode,
      base: baseNode,
      shape: shapeNode,
    },
    pipes: {
      ...pipes,
      current: [],
    },
    plugin,
    schema,
    symbols: {
      v: plugin.external('valibot.v'),
    },
    utils: {
      ast: {},
    },
    walk,
    walkerCtx,
  };

  const resolver = plugin.config['~resolvers']?.object;
  const node = resolver?.(extendedCtx) ?? objectResolver(extendedCtx);

  return {
    childResults,
    pipes: [extendedCtx.pipes.toNode(node, plugin)],
  };
}

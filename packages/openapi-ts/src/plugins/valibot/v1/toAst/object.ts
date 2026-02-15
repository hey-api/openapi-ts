import type { SchemaResult, SchemaVisitorContext, SchemaWithType, Walker } from '@hey-api/shared';
import { childContext } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { ObjectResolverContext } from '../../resolvers';
import type { Pipe, PipeResult } from '../../shared/pipes';
import { pipes } from '../../shared/pipes';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';
import type { ValibotPlugin } from '../../types';
import { identifiers } from '../constants';

type WalkerCtx = SchemaVisitorContext<ValibotPlugin['Instance']>;

interface ObjectToAstOptions extends IrSchemaToAstOptions {
  applyModifiers: (result: SchemaResult<Ast>, opts: { optional?: boolean }) => Ast;
  schema: SchemaWithType<'object'>;
  walk: Walker<Ast, ValibotPlugin['Instance']>;
  walkerCtx: WalkerCtx;
}

type ExtendedContext = ObjectResolverContext & {
  applyModifiers: ObjectToAstOptions['applyModifiers'];
  walk: ObjectToAstOptions['walk'];
  walkerCtx: ObjectToAstOptions['walkerCtx'];
};

function additionalPropertiesNode(ctx: ExtendedContext): Pipe | null | undefined {
  const { plugin, schema, walk, walkerCtx } = ctx;

  if (!schema.additionalProperties || !schema.additionalProperties.type) return;
  if (schema.additionalProperties.type === 'never') return null;

  const additionalResult = walk(
    schema.additionalProperties,
    childContext(walkerCtx, 'additionalProperties'),
  );
  if (additionalResult.hasLazyExpression) ctx.utils.ast.hasLazyExpression = true;
  return pipes.toNode(additionalResult.expression.pipes, plugin);
}

function baseNode(ctx: ExtendedContext): PipeResult {
  const { nodes, symbols } = ctx;
  const { v } = symbols;

  const additional = nodes.additionalProperties(ctx);
  const shape = nodes.shape(ctx);

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

function objectResolver(ctx: ExtendedContext): PipeResult {
  // TODO: parser - handle constants
  return ctx.nodes.base(ctx);
}

function shapeNode(ctx: ExtendedContext): ReturnType<typeof $.object> {
  const { applyModifiers, plugin, schema, walk, walkerCtx } = ctx;
  const shape = $.object().pretty();

  for (const name in schema.properties) {
    const property = schema.properties[name]!;
    const isOptional = !schema.required?.includes(name);

    const propertyResult = walk(property, childContext(walkerCtx, 'properties', name));
    if (propertyResult.hasLazyExpression) ctx.utils.ast.hasLazyExpression = true;

    const ast = applyModifiers(propertyResult, {
      optional: isOptional,
    });

    shape.prop(name, pipes.toNode(ast.pipes, plugin));
  }

  return shape;
}

export function objectToAst(options: ObjectToAstOptions): Omit<Ast, 'typeName'> {
  const { applyModifiers, plugin, walk, walkerCtx } = options;
  const ctx: ExtendedContext = {
    ...options,
    $,
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
    symbols: {
      v: plugin.external('valibot.v'),
    },
    utils: {
      ast: {},
      state: options.state,
    },
    walk,
    walkerCtx,
  };
  const resolver = plugin.config['~resolvers']?.object;
  const node = resolver?.(ctx) ?? objectResolver(ctx);
  ctx.utils.ast.pipes = [ctx.pipes.toNode(node, plugin)];
  return ctx.utils.ast as Omit<Ast, 'typeName'>;
}

import type { SchemaVisitorContext, SchemaWithType, Walker } from '@hey-api/shared';
import { childContext } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { ObjectResolverContext } from '../../resolvers';
import type { Chain } from '../../shared/chain';
import type {
  Ast,
  IrSchemaToAstOptions,
  ZodAppliedResult,
  ZodSchemaResult,
} from '../../shared/types';
import type { ZodPlugin } from '../../types';

type WalkerCtx = SchemaVisitorContext<ZodPlugin['Instance']>;

interface ObjectToAstOptions extends IrSchemaToAstOptions {
  applyModifiers: (result: ZodSchemaResult, opts: { optional?: boolean }) => ZodAppliedResult;
  schema: SchemaWithType<'object'>;
  walk: Walker<ZodSchemaResult, ZodPlugin['Instance']>;
  walkerCtx: WalkerCtx;
}

type ExtendedContext = ObjectResolverContext & {
  applyModifiers: ObjectToAstOptions['applyModifiers'];
  walk: ObjectToAstOptions['walk'];
  walkerCtx: ObjectToAstOptions['walkerCtx'];
};

function additionalPropertiesNode(ctx: ExtendedContext): Chain | null | undefined {
  const { applyModifiers, schema, walk, walkerCtx } = ctx;

  if (
    !schema.additionalProperties ||
    (schema.properties && Object.keys(schema.properties).length > 0)
  ) {
    return;
  }

  const additionalResult = walk(
    schema.additionalProperties,
    childContext(walkerCtx, 'additionalProperties'),
  );
  if (additionalResult.hasLazyExpression) ctx.utils.ast.hasLazyExpression = true;
  const ast = applyModifiers(additionalResult, {});
  return ast.expression;
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
  // TODO: parser - handle constants
  return ctx.nodes.base(ctx);
}

function shapeNode(ctx: ExtendedContext): ReturnType<typeof $.object> {
  const { applyModifiers, schema, walk, walkerCtx } = ctx;
  const shape = $.object().pretty();

  for (const name in schema.properties) {
    const property = schema.properties[name]!;
    const isOptional = !schema.required?.includes(name);

    const propertyResult = walk(property, childContext(walkerCtx, 'properties', name));
    if (propertyResult.hasLazyExpression) ctx.utils.ast.hasLazyExpression = true;

    const ast = applyModifiers(propertyResult, {
      optional: isOptional,
    });

    if (ast.hasLazyExpression) ctx.utils.ast.hasLazyExpression = true;
    shape.prop(name, ast.expression);
  }

  return shape;
}

export function objectToAst(options: ObjectToAstOptions): Omit<Ast, 'typeName'> {
  const { plugin } = options;
  const ast: Partial<Omit<Ast, 'typeName'>> = {};
  const z = plugin.external('zod.z');
  const ctx: ExtendedContext = {
    ...options,
    $,
    chain: {
      current: $(z),
    },
    nodes: {
      additionalProperties: additionalPropertiesNode,
      base: baseNode,
      shape: shapeNode,
    },
    plugin,
    symbols: {
      z,
    },
    utils: {
      ast,
      state: options.state,
    },
  };
  const resolver = plugin.config['~resolvers']?.object;
  const node = resolver?.(ctx) ?? objectResolver(ctx);
  ast.expression = node;
  return {
    ...ast,
    anyType: identifiers.AnyZodObject,
  } as Omit<Ast, 'typeName'>;
}

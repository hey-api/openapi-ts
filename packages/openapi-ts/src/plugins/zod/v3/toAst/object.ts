import { fromRef, ref } from '@hey-api/codegen-core';
import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { ObjectResolverContext } from '../../resolvers';
import type { Chain } from '../../shared/chain';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';
import { irSchemaToAst } from '../plugin';

function additionalPropertiesNode(ctx: ObjectResolverContext): Chain | null | undefined {
  const { plugin, schema } = ctx;

  if (
    !schema.additionalProperties ||
    (schema.properties && Object.keys(schema.properties).length > 0)
  )
    return;

  const additionalAst = irSchemaToAst({
    plugin,
    schema: schema.additionalProperties,
    state: {
      ...ctx.utils.state,
      path: ref([...fromRef(ctx.utils.state.path), 'additionalProperties']),
    },
  });
  if (additionalAst.hasLazyExpression) ctx.utils.ast.hasLazyExpression = true;
  return additionalAst.expression;
}

function baseNode(ctx: ObjectResolverContext): Chain {
  const { nodes, symbols } = ctx;
  const { z } = symbols;

  const additional = nodes.additionalProperties(ctx);
  const shape = nodes.shape(ctx);

  if (additional) {
    return $(z).attr(identifiers.record).call(additional);
  }

  return $(z).attr(identifiers.object).call(shape);
}

function objectResolver(ctx: ObjectResolverContext): Chain {
  // TODO: parser - handle constants
  return ctx.nodes.base(ctx);
}

function shapeNode(ctx: ObjectResolverContext): ReturnType<typeof $.object> {
  const { plugin, schema } = ctx;
  const shape = $.object().pretty();

  for (const name in schema.properties) {
    const property = schema.properties[name]!;

    const propertyAst = irSchemaToAst({
      optional: !schema.required?.includes(name),
      plugin,
      schema: property,
      state: {
        ...ctx.utils.state,
        path: ref([...fromRef(ctx.utils.state.path), 'properties', name]),
      },
    });
    if (propertyAst.hasLazyExpression) ctx.utils.ast.hasLazyExpression = true;
    shape.prop(name, propertyAst.expression);
  }

  return shape;
}

export const objectToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'object'>;
}): Omit<Ast, 'typeName'> & {
  anyType?: string;
} => {
  const ast: Partial<Omit<Ast, 'typeName'>> = {};
  const z = plugin.external('zod.z');
  const ctx: ObjectResolverContext = {
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
    schema,
    symbols: {
      z,
    },
    utils: {
      ast,
      state,
    },
  };
  const resolver = plugin.config['~resolvers']?.object;
  const node = resolver?.(ctx) ?? objectResolver(ctx);
  ast.expression = node;
  return {
    ...ast,
    anyType: 'AnyZodObject',
  } as Omit<Ast, 'typeName'> & {
    anyType: string;
  };
};

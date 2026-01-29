import { fromRef, ref } from '@hey-api/codegen-core';
import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { ObjectResolverContext } from '../../resolvers';
import type { Pipe, PipeResult } from '../../shared/pipes';
import { pipes } from '../../shared/pipes';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';
import { irSchemaToAst } from '../plugin';

function additionalPropertiesNode(ctx: ObjectResolverContext): Pipe | null | undefined {
  const { plugin, schema } = ctx;

  if (!schema.additionalProperties || !schema.additionalProperties.type) return;
  if (schema.additionalProperties.type === 'never') return null;

  const additionalAst = irSchemaToAst({
    plugin,
    schema: schema.additionalProperties,
    state: {
      ...ctx.utils.state,
      path: ref([...fromRef(ctx.utils.state.path), 'additionalProperties']),
    },
  });
  if (additionalAst.hasLazyExpression) ctx.utils.ast.hasLazyExpression = true;
  return pipes.toNode(additionalAst.pipes, plugin);
}

function baseNode(ctx: ObjectResolverContext): PipeResult {
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

function objectResolver(ctx: ObjectResolverContext): PipeResult {
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
    shape.prop(name, pipes.toNode(propertyAst.pipes, plugin));
  }

  return shape;
}

export const objectToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'object'>;
}): Omit<Ast, 'typeName'> => {
  const ctx: ObjectResolverContext = {
    $,
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
      state,
    },
  };
  const resolver = plugin.config['~resolvers']?.object;
  const node = resolver?.(ctx) ?? objectResolver(ctx);
  ctx.utils.ast.pipes = [ctx.pipes.toNode(node, plugin)];
  return ctx.utils.ast as Omit<Ast, 'typeName'>;
};

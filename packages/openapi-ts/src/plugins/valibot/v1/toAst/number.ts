import type { SchemaWithType } from '@hey-api/shared';

import { maybeBigInt, shouldCoerceToBigInt } from '../../../../plugins/shared/utils/coerce';
import { getIntegerLimit } from '../../../../plugins/shared/utils/formats';
import { $ } from '../../../../ts-dsl';
import type { NumberResolverContext } from '../../resolvers';
import type { Pipe, PipeResult, Pipes } from '../../shared/pipes';
import { pipes } from '../../shared/pipes';
import type { ValibotPlugin } from '../../types';
import { identifiers } from '../constants';

function baseNode(ctx: NumberResolverContext): PipeResult {
  const { schema, symbols } = ctx;
  const { v } = symbols;

  if (ctx.utils.shouldCoerceToBigInt(schema.format)) {
    return [
      $(v)
        .attr(identifiers.schemas.union)
        .call(
          $.array(
            $(v).attr(identifiers.schemas.number).call(),
            $(v).attr(identifiers.schemas.string).call(),
            $(v).attr(identifiers.schemas.bigInt).call(),
          ),
        ),
      $(v)
        .attr(identifiers.actions.transform)
        .call($.func().param('x').do($('BigInt').call('x').return())),
    ];
  }

  const result: Pipes = [];
  result.push($(v).attr(identifiers.schemas.number).call());

  if (schema.type === 'integer') {
    result.push($(v).attr(identifiers.actions.integer).call());
  }

  return result;
}

function constNode(ctx: NumberResolverContext): PipeResult {
  const { schema, symbols } = ctx;
  const { v } = symbols;

  if (schema.const === undefined) {
    return;
  }

  return $(v)
    .attr(identifiers.schemas.literal)
    .call(ctx.utils.maybeBigInt(schema.const, schema.format));
}

function maxNode(ctx: NumberResolverContext): PipeResult {
  const { schema, symbols } = ctx;
  const { v } = symbols;

  if (schema.exclusiveMaximum !== undefined) {
    return $(v)
      .attr(identifiers.actions.ltValue)
      .call(ctx.utils.maybeBigInt(schema.exclusiveMaximum, schema.format));
  }

  if (schema.maximum !== undefined) {
    return $(v)
      .attr(identifiers.actions.maxValue)
      .call(ctx.utils.maybeBigInt(schema.maximum, schema.format));
  }

  const limit = ctx.utils.getIntegerLimit(schema.format);
  if (limit) {
    return $(v)
      .attr(identifiers.actions.maxValue)
      .call(ctx.utils.maybeBigInt(limit.maxValue, schema.format), $.literal(limit.maxError));
  }
}

function minNode(ctx: NumberResolverContext): PipeResult {
  const { schema, symbols } = ctx;
  const { v } = symbols;

  if (schema.exclusiveMinimum !== undefined) {
    return $(v)
      .attr(identifiers.actions.gtValue)
      .call(ctx.utils.maybeBigInt(schema.exclusiveMinimum, schema.format));
  }

  if (schema.minimum !== undefined) {
    return $(v)
      .attr(identifiers.actions.minValue)
      .call(ctx.utils.maybeBigInt(schema.minimum, schema.format));
  }

  const limit = ctx.utils.getIntegerLimit(schema.format);
  if (limit) {
    return $(v)
      .attr(identifiers.actions.minValue)
      .call(ctx.utils.maybeBigInt(limit.minValue, schema.format), $.literal(limit.minError));
  }
}

function numberResolver(ctx: NumberResolverContext): Pipes {
  const constResult = ctx.nodes.const(ctx);
  if (constResult) {
    return ctx.pipes.push(ctx.pipes.current, constResult);
  }

  const baseResult = ctx.nodes.base(ctx);
  if (baseResult) {
    ctx.pipes.push(ctx.pipes.current, baseResult);
  }

  const minResult = ctx.nodes.min(ctx);
  if (minResult) {
    ctx.pipes.push(ctx.pipes.current, minResult);
  }

  const maxResult = ctx.nodes.max(ctx);
  if (maxResult) {
    ctx.pipes.push(ctx.pipes.current, maxResult);
  }

  return ctx.pipes.current;
}

export function numberToPipes({
  plugin,
  schema,
}: {
  plugin: ValibotPlugin['Instance'];
  schema: SchemaWithType<'integer' | 'number'>;
}): Pipe {
  const ctx: NumberResolverContext = {
    $,
    nodes: {
      base: baseNode,
      const: constNode,
      max: maxNode,
      min: minNode,
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
      getIntegerLimit,
      maybeBigInt,
      shouldCoerceToBigInt,
    },
  };

  const resolver = plugin.config['~resolvers']?.number;
  const node = resolver?.(ctx) ?? numberResolver(ctx);
  return ctx.pipes.toNode(node, plugin);
}

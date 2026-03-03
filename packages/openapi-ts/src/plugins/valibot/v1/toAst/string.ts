import type { SchemaWithType } from '@hey-api/shared';

import { shouldCoerceToBigInt } from '../../../../plugins/shared/utils/coerce';
import { $ } from '../../../../ts-dsl';
import type { StringResolverContext } from '../../resolvers';
import type { Pipe, PipeResult, Pipes } from '../../shared/pipes';
import { pipes } from '../../shared/pipes';
import type { ValibotPlugin } from '../../types';
import { identifiers } from '../constants';
import { numberToPipes } from './number';

function baseNode(ctx: StringResolverContext): PipeResult {
  const { v } = ctx.symbols;
  return $(v).attr(identifiers.schemas.string).call();
}

function constNode(ctx: StringResolverContext): PipeResult {
  const { schema, symbols } = ctx;
  const { v } = symbols;
  if (typeof schema.const !== 'string') return;
  return $(v).attr(identifiers.schemas.literal).call($.literal(schema.const));
}

function formatNode(ctx: StringResolverContext): PipeResult {
  const { schema, symbols } = ctx;
  const { v } = symbols;
  switch (schema.format) {
    case 'date':
      return $(v).attr(identifiers.actions.isoDate).call();
    case 'date-time':
      return $(v).attr(identifiers.actions.isoTimestamp).call();
    case 'email':
      return $(v).attr(identifiers.actions.email).call();
    case 'ipv4':
    case 'ipv6':
      return $(v).attr(identifiers.actions.ip).call();
    case 'time':
      return $(v).attr(identifiers.actions.isoTimeSecond).call();
    case 'uri':
      return $(v).attr(identifiers.actions.url).call();
    case 'uuid':
      return $(v).attr(identifiers.actions.uuid).call();
  }
}

function lengthNode(ctx: StringResolverContext): PipeResult {
  const { schema, symbols } = ctx;
  const { v } = symbols;
  if (schema.minLength === undefined || schema.minLength !== schema.maxLength) return;
  return $(v).attr(identifiers.actions.length).call($.literal(schema.minLength));
}

function maxLengthNode(ctx: StringResolverContext): PipeResult {
  const { schema, symbols } = ctx;
  const { v } = symbols;
  if (schema.maxLength === undefined) return;
  return $(v).attr(identifiers.actions.maxLength).call($.literal(schema.maxLength));
}

function minLengthNode(ctx: StringResolverContext): PipeResult {
  const { schema, symbols } = ctx;
  const { v } = symbols;
  if (schema.minLength === undefined) return;
  return $(v).attr(identifiers.actions.minLength).call($.literal(schema.minLength));
}

function patternNode(ctx: StringResolverContext): PipeResult {
  const { schema, symbols } = ctx;
  const { v } = symbols;
  if (!schema.pattern) return;
  const flags = /\\[pP]\{/.test(schema.pattern) ? 'u' : undefined;
  return $(v).attr(identifiers.actions.regex).call($.regexp(schema.pattern, flags));
}

function stringResolver(ctx: StringResolverContext): Pipes {
  const constNode = ctx.nodes.const(ctx);
  if (constNode) return ctx.pipes.push(ctx.pipes.current, constNode);

  const baseNode = ctx.nodes.base(ctx);
  if (baseNode) ctx.pipes.push(ctx.pipes.current, baseNode);

  const formatNode = ctx.nodes.format(ctx);
  if (formatNode) ctx.pipes.push(ctx.pipes.current, formatNode);

  const lengthNode = ctx.nodes.length(ctx);
  if (lengthNode) {
    ctx.pipes.push(ctx.pipes.current, lengthNode);
  } else {
    const minLengthNode = ctx.nodes.minLength(ctx);
    if (minLengthNode) ctx.pipes.push(ctx.pipes.current, minLengthNode);

    const maxLengthNode = ctx.nodes.maxLength(ctx);
    if (maxLengthNode) ctx.pipes.push(ctx.pipes.current, maxLengthNode);
  }

  const patternNode = ctx.nodes.pattern(ctx);
  if (patternNode) ctx.pipes.push(ctx.pipes.current, patternNode);

  return ctx.pipes.current;
}

export function stringToPipes({
  plugin,
  schema,
}: {
  plugin: ValibotPlugin['Instance'];
  schema: SchemaWithType<'string'>;
}): Pipe {
  if (shouldCoerceToBigInt(schema.format)) {
    return numberToPipes({
      plugin,
      schema: { ...schema, type: 'number' },
    });
  }

  const ctx: StringResolverContext = {
    $,
    nodes: {
      base: baseNode,
      const: constNode,
      format: formatNode,
      length: lengthNode,
      maxLength: maxLengthNode,
      minLength: minLengthNode,
      pattern: patternNode,
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
  };

  const resolver = plugin.config['~resolvers']?.string;
  const node = resolver?.(ctx) ?? stringResolver(ctx);
  return ctx.pipes.toNode(node, plugin);
}

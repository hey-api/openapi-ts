import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { BooleanResolverContext } from '../../resolvers';
import type { Pipe, PipeResult, Pipes } from '../../shared/pipes';
import { pipes } from '../../shared/pipes';
import type { ValibotPlugin } from '../../types';
import { identifiers } from '../constants';

function baseNode(ctx: BooleanResolverContext): PipeResult {
  const { symbols } = ctx;
  const { v } = symbols;
  return $(v).attr(identifiers.schemas.boolean).call();
}

function constNode(ctx: BooleanResolverContext): PipeResult {
  const { schema, symbols } = ctx;
  const { v } = symbols;
  if (typeof schema.const !== 'boolean') return;
  return $(v).attr(identifiers.schemas.literal).call($.literal(schema.const));
}

function booleanResolver(ctx: BooleanResolverContext): Pipes {
  const constResult = ctx.nodes.const(ctx);
  if (constResult) {
    return ctx.pipes.push(ctx.pipes.current, constResult);
  }

  const baseResult = ctx.nodes.base(ctx);
  if (baseResult) {
    ctx.pipes.push(ctx.pipes.current, baseResult);
  }

  return ctx.pipes.current;
}

export function booleanToPipes({
  plugin,
  schema,
}: {
  plugin: ValibotPlugin['Instance'];
  schema: SchemaWithType<'boolean'>;
}): Pipe {
  const ctx: BooleanResolverContext = {
    $,
    nodes: {
      base: baseNode,
      const: constNode,
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

  const resolver = plugin.config['~resolvers']?.boolean;
  const node = resolver?.(ctx) ?? booleanResolver(ctx);
  return ctx.pipes.toNode(node, plugin);
}

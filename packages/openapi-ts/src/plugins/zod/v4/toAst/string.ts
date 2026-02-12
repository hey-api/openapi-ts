import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { StringResolverContext } from '../../resolvers';
import type { Chain } from '../../shared/chain';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';

function baseNode(ctx: StringResolverContext): Chain {
  const { z } = ctx.symbols;
  return $(z).attr(identifiers.string).call();
}

function constNode(ctx: StringResolverContext): Chain | undefined {
  const { schema, symbols } = ctx;
  const { z } = symbols;
  if (typeof schema.const !== 'string') return;
  return $(z).attr(identifiers.literal).call($.literal(schema.const));
}

function formatNode(ctx: StringResolverContext): Chain | undefined {
  const { plugin, schema, symbols } = ctx;
  const { z } = symbols;

  switch (schema.format) {
    case 'date':
      return $(z).attr(identifiers.iso).attr(identifiers.date).call();
    case 'date-time': {
      const obj = $.object()
        .$if(plugin.config.dates.offset, (o) => o.prop('offset', $.literal(true)))
        .$if(plugin.config.dates.local, (o) => o.prop('local', $.literal(true)));
      return $(z)
        .attr(identifiers.iso)
        .attr(identifiers.datetime)
        .call(obj.hasProps() ? obj : undefined);
    }
    case 'email':
      return $(z).attr(identifiers.email).call();
    case 'ipv4':
      return $(z).attr(identifiers.ipv4).call();
    case 'ipv6':
      return $(z).attr(identifiers.ipv6).call();
    case 'time':
      return $(z).attr(identifiers.iso).attr(identifiers.time).call();
    case 'uri':
      return $(z).attr(identifiers.url).call();
    case 'uuid':
      return $(z).attr(identifiers.uuid).call();
  }

  return;
}

function lengthNode(ctx: StringResolverContext): Chain | undefined {
  const { chain, schema } = ctx;
  if (schema.minLength === undefined || schema.minLength !== schema.maxLength) return;
  return chain.current.attr(identifiers.length).call($.literal(schema.minLength));
}

function maxLengthNode(ctx: StringResolverContext): Chain | undefined {
  const { chain, schema } = ctx;
  if (schema.maxLength === undefined) return;
  return chain.current.attr(identifiers.max).call($.literal(schema.maxLength));
}

function minLengthNode(ctx: StringResolverContext): Chain | undefined {
  const { chain, schema } = ctx;
  if (schema.minLength === undefined) return;
  return chain.current.attr(identifiers.min).call($.literal(schema.minLength));
}

function patternNode(ctx: StringResolverContext): Chain | undefined {
  const { chain, schema } = ctx;
  if (!schema.pattern) return;
  return chain.current.attr(identifiers.regex).call($.regexp(schema.pattern));
}

function stringResolver(ctx: StringResolverContext): Chain {
  const constNode = ctx.nodes.const(ctx);
  if (constNode) {
    ctx.chain.current = constNode;
    return ctx.chain.current;
  }

  const baseNode = ctx.nodes.base(ctx);
  if (baseNode) ctx.chain.current = baseNode;

  const formatNode = ctx.nodes.format(ctx);
  if (formatNode) ctx.chain.current = formatNode;

  const lengthNode = ctx.nodes.length(ctx);
  if (lengthNode) {
    ctx.chain.current = lengthNode;
  } else {
    const minLengthNode = ctx.nodes.minLength(ctx);
    if (minLengthNode) ctx.chain.current = minLengthNode;

    const maxLengthNode = ctx.nodes.maxLength(ctx);
    if (maxLengthNode) ctx.chain.current = maxLengthNode;
  }

  const patternNode = ctx.nodes.pattern(ctx);
  if (patternNode) ctx.chain.current = patternNode;

  return ctx.chain.current;
}

export const stringToNode = ({
  plugin,
  schema,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'string'>;
}): Omit<Ast, 'typeName'> => {
  const z = plugin.external('zod.z');
  const ctx: StringResolverContext = {
    $,
    chain: {
      current: $(z),
    },
    nodes: {
      base: baseNode,
      const: constNode,
      format: formatNode,
      length: lengthNode,
      maxLength: maxLengthNode,
      minLength: minLengthNode,
      pattern: patternNode,
    },
    plugin,
    schema,
    symbols: {
      z,
    },
  };
  const resolver = plugin.config['~resolvers']?.string;
  const node = resolver?.(ctx) ?? stringResolver(ctx);
  return {
    expression: node,
  };
};

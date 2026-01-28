import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '~/ts-dsl';

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
        .$if(plugin.config.dates.offset, (o) =>
          o.prop('offset', $.literal(true)),
        )
        .$if(plugin.config.dates.local, (o) =>
          o.prop('local', $.literal(true)),
        );
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
  const { schema, symbols } = ctx;
  const { z } = symbols;
  if (schema.minLength === undefined || schema.minLength !== schema.maxLength)
    return;
  return $(z).attr(identifiers.length).call($.literal(schema.minLength));
}

function maxLengthNode(ctx: StringResolverContext): Chain | undefined {
  const { schema, symbols } = ctx;
  const { z } = symbols;
  if (schema.maxLength === undefined) return;
  return $(z).attr(identifiers.maxLength).call($.literal(schema.maxLength));
}

function minLengthNode(ctx: StringResolverContext): Chain | undefined {
  const { schema, symbols } = ctx;
  const { z } = symbols;
  if (schema.minLength === undefined) return;
  return $(z).attr(identifiers.minLength).call($.literal(schema.minLength));
}

function patternNode(ctx: StringResolverContext): Chain | undefined {
  const { schema, symbols } = ctx;
  const { z } = symbols;
  if (!schema.pattern) return;
  return $(z).attr(identifiers.regex).call($.regexp(schema.pattern));
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

  const checks: Array<Chain> = [];

  const lengthNode = ctx.nodes.length(ctx);
  if (lengthNode) {
    checks.push(lengthNode);
  } else {
    const minLengthNode = ctx.nodes.minLength(ctx);
    if (minLengthNode) checks.push(minLengthNode);

    const maxLengthNode = ctx.nodes.maxLength(ctx);
    if (maxLengthNode) checks.push(maxLengthNode);
  }

  const patternNode = ctx.nodes.pattern(ctx);
  if (patternNode) checks.push(patternNode);

  if (checks.length > 0) {
    ctx.chain.current = ctx.chain.current
      .attr(identifiers.check)
      .call(...checks);
  }

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

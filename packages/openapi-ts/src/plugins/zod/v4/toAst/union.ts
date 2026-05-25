import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { UnionResolverContext } from '../../resolvers';
import type { Chain } from '../../shared/chain';
import { tryBuildDiscriminatedUnion } from '../../shared/discriminated-union';
import type { ZodResult } from '../../shared/types';

function baseNode(ctx: UnionResolverContext): Chain {
  const { childResults, parentSchema, plugin, schemas, symbols } = ctx;
  const { z } = symbols;

  if (!childResults.length) {
    return $(z).attr(identifiers.null).call();
  }

  const nonNullItems: Array<ZodResult> = [];
  childResults.forEach((result, index) => {
    const schema = schemas[index]!;
    if (schema.type !== 'null' && schema.const !== null) {
      nonNullItems.push(result);
    }
  });

  let chain: Chain;
  if (!nonNullItems.length) {
    chain = $(z).attr(identifiers.null).call();
  } else if (nonNullItems.length === 1) {
    chain = nonNullItems[0]!.chain;
  } else {
    const discriminatedExpression = tryBuildDiscriminatedUnion({
      items: childResults,
      parentSchema,
      plugin,
      schemas,
    });

    if (discriminatedExpression) {
      const unionMembers = discriminatedExpression.members.map((member) =>
        member.refExpression
          .attr(identifiers.extend)
          .call(
            $.object().prop(
              discriminatedExpression.discriminatorKey,
              $(z).attr(identifiers.literal).call($.fromValue(member.discriminatedValue)),
            ),
          ),
      );

      chain = $(z)
        .attr(identifiers.discriminatedUnion)
        .call(
          $.literal(discriminatedExpression.discriminatorKey),
          $.array()
            .pretty()
            .elements(...unionMembers),
        );
    } else {
      chain = $(z)
        .attr(identifiers.union)
        .call(
          $.array()
            .pretty()
            .elements(...nonNullItems.map((item) => item.chain)),
        );
    }
  }

  return chain;
}

function unionResolver(ctx: UnionResolverContext): Chain {
  const baseResult = ctx.nodes.base(ctx);
  ctx.chain.current = baseResult;
  return ctx.chain.current;
}

export function unionToAst({
  childResults,
  parentSchema,
  path,
  plugin,
  schemas,
}: Pick<UnionResolverContext, 'childResults' | 'parentSchema' | 'path' | 'plugin' | 'schemas'>): {
  chain: Chain;
  childResults: Array<ZodResult>;
} {
  const z = plugin.external('zod.z');

  const ctx: UnionResolverContext = {
    $,
    chain: {
      current: $(z),
    },
    childResults,
    nodes: {
      base: baseNode,
    },
    parentSchema,
    path,
    plugin,
    schema: parentSchema,
    schemas,
    symbols: {
      z,
    },
  };

  const resolver = plugin.config['~resolvers']?.union;
  const chain = resolver?.(ctx) ?? unionResolver(ctx);

  return {
    chain,
    childResults,
  };
}

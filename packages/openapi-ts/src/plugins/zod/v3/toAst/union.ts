import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { UnionResolverContext } from '../../resolvers';
import type { Chain } from '../../shared/chain';
import { tryBuildDiscriminatedUnion } from '../../shared/discriminated-union';
import type { ZodResult } from '../../shared/types';

type UnionToAstOptions = Pick<
  UnionResolverContext,
  'childResults' | 'parentSchema' | 'plugin' | 'schemas'
>;

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

  if (!nonNullItems.length) {
    return $(z).attr(identifiers.null).call();
  }

  if (nonNullItems.length === 1) {
    return nonNullItems[0]!.expression;
  }

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

    return $(z)
      .attr(identifiers.discriminatedUnion)
      .call(
        $.literal(discriminatedExpression.discriminatorKey),
        $.array()
          .pretty()
          .elements(...unionMembers),
      );
  }

  return $(z)
    .attr(identifiers.union)
    .call(
      $.array()
        .pretty()
        .elements(...nonNullItems.map((item) => item.expression)),
    );
}

function unionResolver(ctx: UnionResolverContext): Chain {
  const baseResult = ctx.nodes.base(ctx);
  ctx.chain.current = baseResult;
  return ctx.chain.current;
}

export function unionToAst({ childResults, parentSchema, plugin, schemas }: UnionToAstOptions): {
  childResults: Array<ZodResult>;
  expression: Chain;
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
    plugin,
    schema: parentSchema,
    schemas,
    symbols: {
      z,
    },
  };

  const resolver = plugin.config['~resolvers']?.union;
  const expression = resolver?.(ctx) ?? unionResolver(ctx);

  return {
    childResults,
    expression,
  };
}

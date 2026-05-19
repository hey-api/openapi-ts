import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { UnionResolverContext } from '../../resolvers';
import type { Chain } from '../../shared/chain';
import {
  buildDiscriminatorExpression,
  tryBuildDiscriminatedUnion,
} from '../../shared/discriminated-union';
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
    // getDiscriminator in zod v3 only recognises ZodLiteral and ZodEnum — ZodUnion
    // is not supported. When a member maps multiple non-string values to one schema,
    // expand it into one branch per literal so every entry resolves to a ZodLiteral.
    //   [1, 2]      → two branches: extend({ code: z.literal(1) }), extend({ code: z.literal(2) })
    //   ["a", "b"]  → one branch:   extend({ code: z.enum(["a", "b"]) })   (ZodEnum is fine)
    //   "cat"       → one branch:   extend({ code: z.literal("cat") })
    const unionMembers = discriminatedExpression.members.flatMap((member) => {
      const isNonStringArray =
        Array.isArray(member.discriminatedValue) &&
        !member.discriminatedValue.every((v) => typeof v === 'string');

      if (isNonStringArray) {
        return (member.discriminatedValue as unknown[]).map((v) =>
          member.refExpression
            .attr(identifiers.extend)
            .call(
              $.object().prop(
                discriminatedExpression.discriminatorKey,
                $(z).attr(identifiers.literal).call($.fromValue(v)),
              ),
            ),
        );
      }

      return [
        member.refExpression
          .attr(identifiers.extend)
          .call(
            $.object().prop(
              discriminatedExpression.discriminatorKey,
              buildDiscriminatorExpression(z, member.discriminatedValue),
            ),
          ),
      ];
    });

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

export function unionToAst({
  childResults,
  parentSchema,
  path,
  plugin,
  schemas,
}: Pick<UnionResolverContext, 'childResults' | 'parentSchema' | 'path' | 'plugin' | 'schemas'>): {
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
    path,
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

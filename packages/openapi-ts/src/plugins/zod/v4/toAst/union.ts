import type { IR } from '@hey-api/shared';
import { buildDiscriminatedUnion } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import { ZodContracts } from '../../contracts';
import type { UnionResolverContext } from '../../resolvers';
import type { Chain } from '../../shared/chain';
import { shouldFallBackToUnion } from '../../shared/discriminator';
import type { ZodResult } from '../../shared/types';

function baseNode(ctx: UnionResolverContext): Chain {
  const { childResults, parentSchema, plugin, schemas } = ctx;
  const { z } = plugin.imports;

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
    return nonNullItems[0]!.chain;
  }

  const discriminatedData = buildDiscriminatedUnion({
    parentSchema,
    resolveIrRef: (ref) => {
      try {
        return plugin.context.resolveIrRef<IR.SchemaObject>(ref);
      } catch {
        return;
      }
    },
    schemas,
  });

  if (discriminatedData) {
    if (!shouldFallBackToUnion({ childResults, parentSchema, plugin, schemas })) {
      const unionMembers = discriminatedData.members.map((member) => {
        const refExpr = $(plugin.referenceSymbol(ZodContracts.definition(member.ref)));
        return member.needsExtend
          ? refExpr
              .attr(identifiers.extend)
              .call(
                $.object().prop(
                  discriminatedData.discriminatorKey,
                  $(z).attr(identifiers.literal).call($.fromValue(member.discriminatedValue)),
                ),
              )
          : refExpr;
      });

      return $(z)
        .attr(identifiers.discriminatedUnion)
        .call(
          $.literal(discriminatedData.discriminatorKey),
          $.array()
            .pretty()
            .elements(...unionMembers),
        );
    }

    const refToChildChain = new Map<string, Chain>();
    for (let i = 0; i < schemas.length; i++) {
      const schema = schemas[i]!;
      if (schema.type !== 'null' && schema.const !== null && schema.$ref) {
        refToChildChain.set(schema.$ref, childResults[i]!.chain);
      }
    }

    const unionMembers = discriminatedData.members.map((member) => {
      const childChain = refToChildChain.get(member.ref)!;
      return member.needsExtend
        ? $(z)
            .attr(identifiers.object)
            .call(
              $.object()
                .pretty()
                .prop(
                  discriminatedData.discriminatorKey,
                  $(z).attr(identifiers.literal).call($.fromValue(member.discriminatedValue)),
                ),
            )
            .attr(identifiers.and)
            .call(childChain)
        : childChain;
    });

    return $(z)
      .attr(identifiers.union)
      .call(
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
        .elements(...nonNullItems.map((item) => item.chain)),
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
  chain: Chain;
  childResults: Array<ZodResult>;
} {
  const z = plugin.imports.z;

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

  const resolver = plugin.config.$resolvers?.union ?? plugin.config['~resolvers']?.union;
  const chain = resolver?.(ctx) ?? unionResolver(ctx);

  return {
    chain,
    childResults,
  };
}

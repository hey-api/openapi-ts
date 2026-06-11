import type { IR } from '@hey-api/shared';
import { buildDiscriminatedUnion } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { UnionResolverContext } from '../../resolvers';
import type { Type } from '../../shared/types';

function baseNode(ctx: UnionResolverContext): Type {
  const { childResults, parentSchema, plugin, schemas } = ctx;

  if (childResults.length === 1) {
    return childResults[0]!.type;
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
    const grouped = new Map<string, { needsExtend: boolean; values: Array<unknown> }>();
    for (const member of discriminatedData.members) {
      const existing = grouped.get(member.ref);
      if (existing) {
        existing.values.push(member.discriminatedValue);
      } else {
        grouped.set(member.ref, {
          needsExtend: member.needsExtend,
          values: [member.discriminatedValue],
        });
      }
    }

    const members: Array<Type> = [];
    for (const [ref, group] of grouped) {
      const schemaIndex = schemas.findIndex((s) => s.$ref === ref);
      const base = childResults[schemaIndex]?.type;
      if (!base) continue;

      const discriminatorType =
        group.values.length === 1
          ? $.type.literal(group.values[0] as string)
          : $.type.or(...group.values.map((v) => $.type.literal(v as string)));

      members.push(
        $.type.and(
          $.type
            .object()
            .prop(discriminatedData.discriminatorKey, (p) =>
              p.required(true).type(discriminatorType),
            ),
          base,
        ),
      );
    }

    return $.type.or(...members);
  }

  return $.type.or(...childResults.map((r) => r.type));
}

function unionResolver(ctx: UnionResolverContext): Type {
  return ctx.nodes.base(ctx);
}

export function unionToAst({
  childResults,
  parentSchema,
  path,
  plugin,
  schemas,
}: Pick<
  UnionResolverContext,
  'childResults' | 'parentSchema' | 'path' | 'plugin' | 'schemas'
>): Type {
  const ctx: UnionResolverContext = {
    $,
    childResults,
    nodes: {
      base: baseNode,
    },
    parentSchema,
    path,
    plugin,
    schemas,
  };

  const resolver = plugin.config['~resolvers']?.union;
  const result = resolver?.(ctx);
  return result ?? unionResolver(ctx);
}

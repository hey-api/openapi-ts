import type { IR } from '@hey-api/shared';
import { buildDiscriminatedUnion } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { UnionResolverContext } from '../../resolvers';
import type { PipeResult, Pipes } from '../../shared/pipes';
import { pipes, pipesToNode } from '../../shared/pipes';
import type { CompositeHandlerResult, ValibotResult } from '../../shared/types';
import { identifiers } from '../constants';

function baseNode(ctx: UnionResolverContext): PipeResult {
  const { childResults, parentSchema, plugin, schemas } = ctx;
  const { v } = ctx.plugin.symbols;

  const nonNullItems: Array<ValibotResult> = [];
  childResults.forEach((item, index) => {
    const schema = schemas[index]!;
    if (schema.type !== 'null' && schema.const !== null) {
      nonNullItems.push(item);
    }
  });

  if (!nonNullItems.length) {
    return $(v).attr(identifiers.schemas.null).call();
  }

  if (nonNullItems.length === 1) {
    return nonNullItems[0]!.pipes;
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
    if (discriminatedData.members.some((m) => m.needsExtend)) {
      const refToNode = new Map<string, ReturnType<typeof pipesToNode>>();
      for (let i = 0; i < schemas.length; i++) {
        const schema = schemas[i]!;
        if (schema.type !== 'null' && schema.const !== null && schema.$ref) {
          refToNode.set(schema.$ref, pipesToNode(childResults[i]!.pipes, plugin));
        }
      }

      const memberNodes = discriminatedData.members.map((member) => {
        const childNode = refToNode.get(member.ref)!;
        if (member.needsExtend) {
          return $(v)
            .attr(identifiers.schemas.intersect)
            .call(
              $.array(
                $(v)
                  .attr(identifiers.schemas.object)
                  .call(
                    $.object()
                      .pretty()
                      .prop(
                        discriminatedData.discriminatorKey,
                        $(v)
                          .attr(identifiers.schemas.literal)
                          .call($.fromValue(member.discriminatedValue)),
                      ),
                  ),
                childNode,
              ),
            );
        }
        return childNode;
      });

      return $(v)
        .attr(identifiers.schemas.union)
        .call($.array(...memberNodes));
    }

    const itemNodes = nonNullItems.map((i) => pipesToNode(i.pipes, plugin));
    return $(v)
      .attr(identifiers.schemas.variant)
      .call($.literal(discriminatedData.discriminatorKey), $.array(...itemNodes));
  }

  const itemNodes = nonNullItems.map((i) => pipesToNode(i.pipes, plugin));
  return $(v)
    .attr(identifiers.schemas.union)
    .call($.array(...itemNodes));
}

function unionResolver(ctx: UnionResolverContext): Pipes {
  const base = ctx.nodes.base(ctx);
  if (base) {
    ctx.pipes.push(ctx.pipes.current, base);
  }
  return ctx.pipes.current;
}

export function unionToPipes({
  applyModifiers,
  childResults,
  parentSchema,
  path,
  plugin,
  schemas,
}: Pick<
  UnionResolverContext,
  'applyModifiers' | 'childResults' | 'parentSchema' | 'path' | 'plugin' | 'schemas'
>): CompositeHandlerResult {
  const resolverCtx: UnionResolverContext = {
    $,
    applyModifiers,
    childResults,
    nodes: {
      base: baseNode,
    },
    parentSchema,
    path,
    pipes: {
      ...pipes,
      current: [],
    },
    plugin,
    schema: parentSchema,
    schemas,
    symbols: {
      v: plugin.symbols.v,
    },
  };

  const resolver = plugin.config['~resolvers']?.union;
  const node = resolver?.(resolverCtx) ?? unionResolver(resolverCtx);

  return {
    childResults,
    pipes: [resolverCtx.pipes.toNode(node, plugin)],
  };
}

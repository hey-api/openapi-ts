import type { IR } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { UnionResolverContext } from '../../resolvers';
import { hasIntersectionDiscriminatorBranches } from '../../shared/discriminated-union';
import type { PipeResult, Pipes } from '../../shared/pipes';
import { pipes, pipesToNode } from '../../shared/pipes';
import type { CompositeHandlerResult, ValibotFinal, ValibotResult } from '../../shared/types';
import type { ValibotPlugin } from '../../types';
import { identifiers } from '../constants';

function baseNode(ctx: UnionResolverContext): PipeResult {
  const { childResults, parentSchema, plugin, schemas, symbols } = ctx;
  const { v } = symbols;

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

  const itemNodes = nonNullItems.map((i) => pipesToNode(i.pipes, plugin));
  const hasIntersectionBranch = hasIntersectionDiscriminatorBranches({
    items: childResults,
    parentSchema,
    schemas,
  });

  const discriminatorKey = parentSchema.discriminator?.propertyName;
  if (discriminatorKey && !hasIntersectionBranch) {
    return $(v)
      .attr(identifiers.schemas.variant)
      .call($.literal(discriminatorKey), $.array(...itemNodes));
  }

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

export function unionToPipes(ctx: {
  applyModifiers: (result: ValibotResult, options?: { optional?: boolean }) => ValibotFinal;
  childResults: Array<ValibotResult>;
  parentSchema: IR.SchemaObject;
  plugin: ValibotPlugin['Instance'];
  schemas: ReadonlyArray<IR.SchemaObject>;
}): CompositeHandlerResult {
  const { applyModifiers, childResults, parentSchema, plugin, schemas } = ctx;

  const resolverCtx: UnionResolverContext = {
    $,
    applyModifiers,
    childResults,
    nodes: {
      base: baseNode,
    },
    parentSchema,
    pipes: {
      ...pipes,
      current: [],
    },
    plugin,
    schema: parentSchema,
    schemas,
    symbols: {
      v: plugin.external('valibot.v'),
    },
  };

  const resolver = plugin.config['~resolvers']?.union;
  const node = resolver?.(resolverCtx) ?? unionResolver(resolverCtx);

  return {
    childResults,
    pipes: [resolverCtx.pipes.toNode(node, plugin)],
  };
}

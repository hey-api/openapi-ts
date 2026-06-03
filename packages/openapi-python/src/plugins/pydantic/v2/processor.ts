import { ref } from '@hey-api/codegen-core';
import type { SchemaExtractor } from '@hey-api/shared';
import { createSchemaProcessor, createSchemaWalker, pathToJsonPointer } from '@hey-api/shared';

import { $ as $$ } from '../dsl';
import { exportAst } from '../shared/export';
import type { ProcessorContext, ProcessorResult } from '../shared/processor';
import type { PydanticNode, PydanticResult } from '../shared/types';
import type { PydanticPlugin } from '../types';
import { createVisitor } from './visitor';

function toNode(result: PydanticResult, plugin: PydanticPlugin['Instance']): PydanticNode {
  if (result.node) {
    return result.node;
  }
  return { kind: 'alias', type: result.type ?? $$.constrainedType(plugin.symbols.typing.Any) };
}

export function createProcessor(plugin: PydanticPlugin['Instance']): ProcessorResult {
  const processor = createSchemaProcessor();

  const extractorHooks = plugin.getHooks(
    (hooks) => hooks.schemas?.shouldExtract,
    (ctx) =>
      ctx.schema.type === 'object' &&
      (ctx.schema.properties !== undefined || !ctx.schema.additionalProperties),
    (ctx) =>
      ctx.schema.type === 'enum' &&
      ctx.schema.items !== undefined &&
      Boolean(ctx.schema.items.length),
  );

  const schemaExtractor: SchemaExtractor<ProcessorContext> = (ctx) => {
    if (processor.hasEmitted(ctx.path)) {
      return ctx.schema;
    }

    for (const hook of extractorHooks) {
      const result = typeof hook === 'boolean' ? hook : hook(ctx);
      if (result) {
        process({
          namingAnchor: processor.context.anchor,
          tags: processor.context.tags,
          ...ctx,
        });
        return { $ref: pathToJsonPointer(ctx.path) };
      }
    }

    return ctx.schema;
  };

  function process(ctx: ProcessorContext): PydanticNode | void {
    if (!processor.markEmitted(ctx.path)) return;

    const shouldExport = ctx.export !== false;

    return processor.withContext({ anchor: ctx.namingAnchor, tags: ctx.tags }, () => {
      const visitor = createVisitor({ plugin, schemaExtractor });
      const walk = createSchemaWalker(visitor);

      const result = walk(ctx.schema, {
        path: ref(ctx.path),
        plugin,
      });

      const final = visitor.applyModifiers(result, {
        path: ref(ctx.path),
        plugin,
      }) as PydanticResult;

      const node = toNode(final, plugin);

      if (shouldExport) {
        exportAst({ ...ctx, node, plugin });
        return;
      }

      return node;
    });
  }

  return { process };
}

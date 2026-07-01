import { ref } from '@hey-api/codegen-core';
import type { IR, SchemaExtractor } from '@hey-api/shared';
import {
  createSchemaProcessor,
  createSchemaWalker,
  jsonPointerToPath,
  normalizeJsonPointer,
  pathToJsonPointer,
} from '@hey-api/shared';

import { exportAst } from '../shared/export';
import type { ProcessorContext, ProcessorResult } from '../shared/processor';
import type { ValibotFinal } from '../shared/types';
import type { ValibotPlugin } from '../types';
import { createVisitor } from './visitor';

export function createProcessor(plugin: ValibotPlugin['Instance']): ProcessorResult {
  const processor = createSchemaProcessor();

  const extractorHooks = plugin.getHooks((hooks) => hooks.schemas?.shouldExtract);

  function isCyclicReference(currentPointer: string, targetPointer: string): boolean {
    if (targetPointer === currentPointer) {
      return true;
    }

    return (
      plugin.context.graph?.transitiveDependencies.get(targetPointer)?.has(currentPointer) ?? false
    );
  }

  function ensureReferenceRegistered(currentPointer: string, $ref: string): void {
    const targetPointer = normalizeJsonPointer($ref);
    const query = {
      artifact: 'valibot',
      category: 'schema',
      resource: 'definition',
      resourceId: targetPointer,
    };

    if (plugin.isSymbolRegistered(query)) {
      return;
    }

    if (isCyclicReference(currentPointer, targetPointer)) {
      return;
    }

    const targetSchema = plugin.context.resolveIrRef<IR.SchemaObject>(targetPointer);
    const targetPath = jsonPointerToPath(targetPointer);
    const targetInfo = plugin.context.graph?.nodes.get(targetPointer);

    process({
      meta: {
        resource: 'definition',
        resourceId: targetPointer,
      },
      naming: plugin.config.definitions,
      path: targetPath,
      plugin,
      schema: targetSchema,
      tags: targetInfo?.tags ? Array.from(targetInfo.tags) : undefined,
    });

    if (!plugin.isSymbolRegistered(query)) {
      throw new Error(`Failed to emit acyclic Valibot schema reference "${$ref}"`);
    }
  }

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

  function process(ctx: ProcessorContext): ValibotFinal | void {
    if (!processor.markEmitted(ctx.path)) return;

    const shouldExport = ctx.export !== false;

    return processor.withContext({ anchor: ctx.namingAnchor, tags: ctx.tags }, () => {
      const currentPointer = pathToJsonPointer(ctx.path);
      const visitor = createVisitor({
        ensureReferenceRegistered: ($ref) => ensureReferenceRegistered(currentPointer, $ref),
        plugin,
        schemaExtractor,
      });
      const walk = createSchemaWalker(visitor);

      const result = walk(ctx.schema, {
        path: ref(ctx.path),
        plugin,
      });

      const final = visitor.applyModifiers(result, {
        path: ref(ctx.path),
        plugin,
      }) as ValibotFinal;

      if (shouldExport) {
        exportAst({ ...ctx, final, plugin });
        return;
      }

      return final;
    });
  }

  return { process };
}

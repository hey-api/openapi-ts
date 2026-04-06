import { ref } from '@hey-api/codegen-core';
import type { Hooks, IR } from '@hey-api/shared';
import { createSchemaProcessor, createSchemaWalker, pathToJsonPointer } from '@hey-api/shared';

import { exportAst } from '../shared/export';
import type { ProcessorContext, ProcessorResult } from '../shared/processor';
import type { EmitTracking, FakerResult } from '../shared/types';
import type { FakerJsFakerPlugin } from '../types';
import { createVisitor } from './walker';

export function createProcessor(
  plugin: FakerJsFakerPlugin['Instance'],
  tracking: EmitTracking,
  circularPointers: Set<string>,
): ProcessorResult {
  const processor = createSchemaProcessor();

  const extractorHooks: ReadonlyArray<NonNullable<Hooks['schemas']>['shouldExtract']> = [
    plugin.config['~hooks']?.schemas?.shouldExtract,
    plugin.context.config.parser.hooks.schemas?.shouldExtract,
  ];

  function extractor(ctx: ProcessorContext): IR.SchemaObject {
    if (processor.hasEmitted(ctx.path)) {
      return ctx.schema;
    }

    for (const hook of extractorHooks) {
      const result = typeof hook === 'function' ? hook(ctx) : hook;
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
  }

  function process(ctx: ProcessorContext): FakerResult | void {
    if (!processor.markEmitted(ctx.path)) return;

    const shouldExport = ctx.export !== false;
    const isCircularSchema = circularPointers.has(ctx.meta.resourceId);

    return processor.withContext({ anchor: ctx.namingAnchor, tags: ctx.tags }, () => {
      const visitor = createVisitor({
        circularPointers,
        isCircularSchema,
        plugin,
        schemaExtractor: extractor,
        tracking,
      });
      const walk = createSchemaWalker(visitor);

      const result = walk(ctx.schema, {
        path: ref(ctx.path),
        plugin,
      });

      const final = visitor.applyModifiers(result, {
        path: ref(ctx.path),
        plugin,
      }) as FakerResult;

      // Track whether this schema's function accepts options, so that
      // later $ref call sites can omit the argument when not needed.
      tracking.usesFakerByRef.set(ctx.meta.resourceId, final.usesFaker);
      // Track whether this schema produces an object-like value,
      // so that intersection handlers know if the result can be spread.
      tracking.isObjectByRef.set(ctx.meta.resourceId, !!final.isObjectLike);

      if (shouldExport) {
        exportAst({ ...ctx, final, isCircularSchema, plugin });
        return;
      }

      return final;
    });
  }

  return { process };
}

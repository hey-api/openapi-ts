import { ref } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';
import { createSchemaWalker } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { EmitTracking, Expression, FakerResult } from '../shared/types';
import type { FakerJsFakerPlugin } from '../types';
import { createVisitor } from './walker';

export function toNodeV10({
  plugin,
  schema,
}: {
  plugin: FakerJsFakerPlugin['Instance'];
  schema: IR.SchemaObject;
}): Expression {
  const tracking: EmitTracking = {
    isObjectByRef: new Map(),
    needsMaxCallDepth: false,
    needsResolveCondition: false,
    usesFakerByRef: new Map(),
  };
  const visitor = createVisitor({
    circularPointers: new Set(),
    isCircularSchema: false,
    plugin,
    tracking,
  });
  const walk = createSchemaWalker(visitor);
  const result = walk(schema, { path: ref([]), plugin });
  const final = visitor.applyModifiers(result, { path: ref([]), plugin }) as FakerResult;
  return final.expression;
}

export function toNodeRefV10({
  plugin,
  schema,
}: {
  plugin: FakerJsFakerPlugin['Instance'];
  schema: IR.SchemaObject;
}): Expression {
  if (schema.$ref) {
    const symbol = plugin.referenceSymbol({
      category: 'schema',
      resource: 'definition',
      resourceId: schema.$ref,
      tool: 'faker',
    });
    return $(symbol).call($('options'));
  }
  return toNodeV10({ plugin, schema });
}

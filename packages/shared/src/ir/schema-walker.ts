import type { Ref } from '@hey-api/codegen-core';
import { fromRef, ref } from '@hey-api/codegen-core';

import type { SchemaWithType } from '../plugins/shared/types/schema';
import { deduplicateSchema } from './schema';
import type { IR } from './types';

/**
 * Context passed to all visitor methods.
 */
export interface SchemaVisitorContext<TPlugin = unknown> {
  /** Current path in the schema tree. */
  path: Ref<ReadonlyArray<string | number>>;
  /** The plugin instance. */
  plugin: TPlugin;
}

/**
 * The walk function signature. Fully generic over TResult.
 */
export type Walker<TResult, TPlugin = unknown> = (
  schema: IR.SchemaObject,
  ctx: SchemaVisitorContext<TPlugin>,
) => TResult;

/**
 * The visitor interface. Plugins define their own TResult type.
 *
 * The walker handles orchestration (dispatch, deduplication, path tracking).
 * Result shape and semantics are entirely plugin-defined.
 */
export interface SchemaVisitor<TResult, TPlugin = unknown> {
  /**
   * Apply modifiers to a result.
   */
  applyModifiers(
    result: TResult,
    ctx: SchemaVisitorContext<TPlugin>,
    context?: {
      /** Is this property optional? */
      optional?: boolean;
    },
  ): unknown;
  array(
    schema: SchemaWithType<'array'>,
    ctx: SchemaVisitorContext<TPlugin>,
    walk: Walker<TResult, TPlugin>,
  ): TResult;
  boolean(schema: SchemaWithType<'boolean'>, ctx: SchemaVisitorContext<TPlugin>): TResult;
  enum(
    schema: SchemaWithType<'enum'>,
    ctx: SchemaVisitorContext<TPlugin>,
    walk: Walker<TResult, TPlugin>,
  ): TResult;
  integer(schema: SchemaWithType<'integer'>, ctx: SchemaVisitorContext<TPlugin>): TResult;
  /**
   * Called before any dispatch logic. Return a result to short-circuit,
   * or undefined to continue normal dispatch.
   */
  intercept?(
    schema: IR.SchemaObject,
    ctx: SchemaVisitorContext<TPlugin>,
    walk: Walker<TResult, TPlugin>,
  ): TResult | undefined;
  /**
   * Handle intersection types. Receives already-walked child results.
   */
  intersection(
    items: Array<TResult>,
    schemas: ReadonlyArray<IR.SchemaObject>,
    parentSchema: IR.SchemaObject,
    ctx: SchemaVisitorContext<TPlugin>,
  ): TResult;
  never(schema: SchemaWithType<'never'>, ctx: SchemaVisitorContext<TPlugin>): TResult;
  null(schema: SchemaWithType<'null'>, ctx: SchemaVisitorContext<TPlugin>): TResult;
  number(schema: SchemaWithType<'number'>, ctx: SchemaVisitorContext<TPlugin>): TResult;
  object(
    schema: SchemaWithType<'object'>,
    ctx: SchemaVisitorContext<TPlugin>,
    walk: Walker<TResult, TPlugin>,
  ): TResult;
  /**
   * Called after each typed schema visitor returns.
   */
  postProcess?(
    result: TResult,
    schema: IR.SchemaObject,
    ctx: SchemaVisitorContext<TPlugin>,
  ): TResult;
  /**
   * Handle $ref to another schema.
   */
  reference($ref: string, schema: IR.SchemaObject, ctx: SchemaVisitorContext<TPlugin>): TResult;
  string(schema: SchemaWithType<'string'>, ctx: SchemaVisitorContext<TPlugin>): TResult;
  tuple(
    schema: SchemaWithType<'tuple'>,
    ctx: SchemaVisitorContext<TPlugin>,
    walk: Walker<TResult, TPlugin>,
  ): TResult;
  undefined(schema: SchemaWithType<'undefined'>, ctx: SchemaVisitorContext<TPlugin>): TResult;
  /**
   * Handle union types. Receives already-walked child results.
   */
  union(
    items: Array<TResult>,
    schemas: ReadonlyArray<IR.SchemaObject>,
    parentSchema: IR.SchemaObject,
    ctx: SchemaVisitorContext<TPlugin>,
  ): TResult;
  unknown(schema: SchemaWithType<'unknown'>, ctx: SchemaVisitorContext<TPlugin>): TResult;
  void(schema: SchemaWithType<'void'>, ctx: SchemaVisitorContext<TPlugin>): TResult;
}

/**
 * Create a schema walker from a visitor.
 *
 * The walker handles:
 * - Dispatch order ($ref → type → items → fallback)
 * - Deduplication of union/intersection schemas
 * - Path tracking for child schemas
 */
export function createSchemaWalker<TResult, TPlugin = unknown>(
  visitor: SchemaVisitor<TResult, TPlugin>,
): Walker<TResult, TPlugin> {
  const walk: Walker<TResult, TPlugin> = (schema, ctx) => {
    // escape hatch
    if (visitor.intercept) {
      const intercepted = visitor.intercept(schema, ctx, walk);
      if (intercepted !== undefined) {
        return intercepted;
      }
    }

    if (schema.$ref) {
      return visitor.reference(schema.$ref, schema, ctx);
    }

    if (schema.type) {
      let result = visitTyped(schema as SchemaWithType, ctx, visitor, walk);
      if (visitor.postProcess) {
        result = visitor.postProcess(result, schema, ctx);
      }
      return result;
    }

    if (schema.items) {
      const deduplicated = deduplicateSchema({ schema });

      // deduplication might collapse to a single schema
      if (!deduplicated.items) {
        return walk(deduplicated, ctx);
      }

      const itemResults = deduplicated.items.map((item, index) =>
        walk(item, {
          ...ctx,
          path: ref([...fromRef(ctx.path), 'items', index]),
        }),
      );

      return deduplicated.logicalOperator === 'and'
        ? visitor.intersection(itemResults, deduplicated.items, schema, ctx)
        : visitor.union(itemResults, deduplicated.items, schema, ctx);
    }

    // fallback
    return visitor.unknown({ type: 'unknown' }, ctx);
  };

  return walk;
}

/**
 * Dispatch to the appropriate visitor method based on schema type.
 */
function visitTyped<TResult, TPlugin>(
  schema: SchemaWithType,
  ctx: SchemaVisitorContext<TPlugin>,
  visitor: SchemaVisitor<TResult, TPlugin>,
  walk: Walker<TResult, TPlugin>,
): TResult {
  switch (schema.type) {
    case 'array':
      return visitor.array(schema as SchemaWithType<'array'>, ctx, walk);
    case 'boolean':
      return visitor.boolean(schema as SchemaWithType<'boolean'>, ctx);
    case 'enum':
      return visitor.enum(schema as SchemaWithType<'enum'>, ctx, walk);
    case 'integer':
      return visitor.integer(schema as SchemaWithType<'integer'>, ctx);
    case 'never':
      return visitor.never(schema as SchemaWithType<'never'>, ctx);
    case 'null':
      return visitor.null(schema as SchemaWithType<'null'>, ctx);
    case 'number':
      return visitor.number(schema as SchemaWithType<'number'>, ctx);
    case 'object':
      return visitor.object(schema as SchemaWithType<'object'>, ctx, walk);
    case 'string':
      return visitor.string(schema as SchemaWithType<'string'>, ctx);
    case 'tuple':
      return visitor.tuple(schema as SchemaWithType<'tuple'>, ctx, walk);
    case 'undefined':
      return visitor.undefined(schema as SchemaWithType<'undefined'>, ctx);
    case 'unknown':
      return visitor.unknown(schema as SchemaWithType<'unknown'>, ctx);
    case 'void':
      return visitor.void(schema as SchemaWithType<'void'>, ctx);
  }
}

/**
 * Helper to create a child context with an extended path.
 */
export function childContext<TPlugin>(
  ctx: SchemaVisitorContext<TPlugin>,
  ...segments: ReadonlyArray<string | number>
): SchemaVisitorContext<TPlugin> {
  return {
    ...ctx,
    path: ref([...fromRef(ctx.path), ...segments]),
  };
}

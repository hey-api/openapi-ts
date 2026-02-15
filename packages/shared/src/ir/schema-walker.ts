import type { Ref } from '@hey-api/codegen-core';
import { fromRef, ref } from '@hey-api/codegen-core';

import type { SchemaWithType } from '../plugins/shared/types/schema';
import { deduplicateSchema } from './schema';
import type { IR } from './types';

/**
 * Result returned by visitor methods. Contains the expression plus metadata
 * needed for modifier application.
 */
export interface SchemaResult<TExpr> {
  /** Default value from schema, if any. */
  default?: unknown;
  /** The core schema expression, WITHOUT optional/nullable/default applied. */
  expression: TExpr;
  /** The original schema format. */
  format?: string;
  /** For libraries that need lazy evaluation. */
  hasLazyExpression?: boolean;
  /** Plugin-specific metadata bucket. */
  meta?: Record<string, unknown>;
  /** Does this schema explicitly allow null? */
  nullable: boolean;
  /** Is this schema read-only? */
  readonly: boolean;
}

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
 * The walk function signature.
 */
export type Walker<TExpr, TPlugin = unknown> = (
  schema: IR.SchemaObject,
  ctx: SchemaVisitorContext<TPlugin>,
) => SchemaResult<TExpr>;

/**
 * The visitor interface. Plugins implement this to define how schemas
 * are transformed into their target representation.
 */
export interface SchemaVisitor<TExpr, TPlugin = unknown> {
  /**
   * Apply modifiers (optional/nullable/nullish/default) to a schema result.
   */
  applyModifiers(
    result: SchemaResult<TExpr>,
    ctx: SchemaVisitorContext<TPlugin>,
    context?: {
      /** Is this property optional? */
      optional?: boolean;
    },
  ): TExpr;
  array(
    schema: SchemaWithType<'array'>,
    ctx: SchemaVisitorContext<TPlugin>,
    walk: Walker<TExpr, TPlugin>,
  ): SchemaResult<TExpr>;
  boolean(
    schema: SchemaWithType<'boolean'>,
    ctx: SchemaVisitorContext<TPlugin>,
  ): SchemaResult<TExpr>;
  enum(
    schema: SchemaWithType<'enum'>,
    ctx: SchemaVisitorContext<TPlugin>,
    walk: Walker<TExpr, TPlugin>,
  ): SchemaResult<TExpr>;
  integer(
    schema: SchemaWithType<'integer'>,
    ctx: SchemaVisitorContext<TPlugin>,
  ): SchemaResult<TExpr>;
  /**
   * Called before any dispatch logic. Return a result to short-circuit,
   * or undefined to continue normal dispatch.
   */
  intercept?(
    schema: IR.SchemaObject,
    ctx: SchemaVisitorContext<TPlugin>,
    walk: Walker<TExpr, TPlugin>,
  ): SchemaResult<TExpr> | undefined;
  /**
   * Handle intersection types. Receives already-walked child results.
   */
  intersection(
    items: Array<SchemaResult<TExpr>>,
    schemas: ReadonlyArray<IR.SchemaObject>,
    ctx: SchemaVisitorContext<TPlugin>,
  ): SchemaResult<TExpr>;
  never(schema: SchemaWithType<'never'>, ctx: SchemaVisitorContext<TPlugin>): SchemaResult<TExpr>;
  null(schema: SchemaWithType<'null'>, ctx: SchemaVisitorContext<TPlugin>): SchemaResult<TExpr>;
  number(schema: SchemaWithType<'number'>, ctx: SchemaVisitorContext<TPlugin>): SchemaResult<TExpr>;
  object(
    schema: SchemaWithType<'object'>,
    ctx: SchemaVisitorContext<TPlugin>,
    walk: Walker<TExpr, TPlugin>,
  ): SchemaResult<TExpr>;
  /**
   * Called after each typed schema visitor returns.
   */
  postProcess?(
    result: SchemaResult<TExpr>,
    schema: IR.SchemaObject,
    ctx: SchemaVisitorContext<TPlugin>,
  ): SchemaResult<TExpr>;
  /**
   * Handle $ref to another schema.
   */
  reference(
    $ref: string,
    schema: IR.SchemaObject,
    ctx: SchemaVisitorContext<TPlugin>,
  ): SchemaResult<TExpr>;
  string(schema: SchemaWithType<'string'>, ctx: SchemaVisitorContext<TPlugin>): SchemaResult<TExpr>;
  tuple(
    schema: SchemaWithType<'tuple'>,
    ctx: SchemaVisitorContext<TPlugin>,
    walk: Walker<TExpr, TPlugin>,
  ): SchemaResult<TExpr>;
  undefined(
    schema: SchemaWithType<'undefined'>,
    ctx: SchemaVisitorContext<TPlugin>,
  ): SchemaResult<TExpr>;
  /**
   * Handle union types. Receives already-walked child results.
   */
  union(
    items: Array<SchemaResult<TExpr>>,
    schemas: ReadonlyArray<IR.SchemaObject>,
    ctx: SchemaVisitorContext<TPlugin>,
  ): SchemaResult<TExpr>;
  unknown(
    schema: SchemaWithType<'unknown'>,
    ctx: SchemaVisitorContext<TPlugin>,
  ): SchemaResult<TExpr>;
  void(schema: SchemaWithType<'void'>, ctx: SchemaVisitorContext<TPlugin>): SchemaResult<TExpr>;
}

/**
 * Create a schema walker from a visitor.
 *
 * The walker handles:
 * - Dispatch order ($ref → type → items → fallback)
 * - Deduplication of union/intersection schemas
 * - Path tracking for child schemas
 * - Calling the appropriate visitor method
 */
export function createSchemaWalker<TExpr, TPlugin = unknown>(
  visitor: SchemaVisitor<TExpr, TPlugin>,
): Walker<TExpr, TPlugin> {
  const walk: Walker<TExpr, TPlugin> = (schema, ctx) => {
    // escape hatch
    if (visitor.intercept) {
      const intercepted = visitor.intercept(schema, ctx, walk);
      if (intercepted !== undefined) {
        return intercepted;
      }
    }

    const baseResult = {
      default: schema.default,
      readonly: schema.accessScope === 'read',
    };

    if (schema.$ref) {
      const result = visitor.reference(schema.$ref, schema, ctx);
      return {
        ...result,
        default: result.default ?? baseResult.default,
        readonly: result.readonly || baseResult.readonly,
      };
    }

    if (schema.type) {
      let result = visitTyped(schema as SchemaWithType, ctx, visitor, walk);
      if (visitor.postProcess) {
        result = visitor.postProcess(result, schema, ctx);
      }
      return {
        ...result,
        default: result.default ?? baseResult.default,
        readonly: result.readonly || baseResult.readonly,
      };
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

      const result =
        deduplicated.logicalOperator === 'and'
          ? visitor.intersection(itemResults, deduplicated.items, ctx)
          : visitor.union(itemResults, deduplicated.items, ctx);

      return {
        ...result,
        default: result.default ?? baseResult.default,
        readonly: result.readonly || baseResult.readonly,
      };
    }

    // fallback
    const result = visitor.unknown({ type: 'unknown' }, ctx);
    return {
      ...result,
      default: result.default ?? baseResult.default,
      readonly: result.readonly || baseResult.readonly,
    };
  };

  return walk;
}

/**
 * Dispatch to the appropriate visitor method based on schema type.
 */
function visitTyped<TExpr, TPlugin>(
  schema: SchemaWithType,
  ctx: SchemaVisitorContext<TPlugin>,
  visitor: SchemaVisitor<TExpr, TPlugin>,
  walk: Walker<TExpr, TPlugin>,
): SchemaResult<TExpr> {
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

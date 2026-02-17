import { pathToJsonPointer } from '../utils/ref';
import type { IR } from './types';

export interface SchemaProcessor {
  /** Current inherited context (set by withContext) */
  readonly context: {
    readonly anchor: string | undefined;
    readonly tags: ReadonlyArray<string> | undefined;
  };
  /** Check if pointer was already emitted */
  hasEmitted: (path: ReadonlyArray<string | number>) => boolean;
  /** Mark pointer as emitted. Returns false if already emitted. */
  markEmitted: (path: ReadonlyArray<string | number>) => boolean;
  /** Execute with inherited context for nested extractions */
  withContext: <T>(ctx: { anchor?: string; tags?: ReadonlyArray<string> }, fn: () => T) => T;
}

export interface SchemaProcessorContext {
  meta: { resource: string; resourceId: string; role?: string };
  namingAnchor?: string;
  path: ReadonlyArray<string | number>;
  schema: IR.SchemaObject;
  tags?: ReadonlyArray<string>;
}

export interface SchemaProcessorResult<
  Context extends SchemaProcessorContext = SchemaProcessorContext,
> {
  process: (ctx: Context) => void;
}

export type SchemaExtractor<Context extends SchemaProcessorContext = SchemaProcessorContext> = (
  ctx: Context,
) => IR.SchemaObject;

export function createSchemaProcessor(): SchemaProcessor {
  const emitted = new Set<string>();
  let contextTags: ReadonlyArray<string> | undefined;
  let contextAnchor: string | undefined;

  return {
    get context() {
      return {
        anchor: contextAnchor,
        tags: contextTags,
      };
    },
    hasEmitted(path) {
      return emitted.has(pathToJsonPointer(path));
    },
    markEmitted(path) {
      const pointer = pathToJsonPointer(path);
      if (emitted.has(pointer)) return false;
      emitted.add(pointer);
      return true;
    },
    withContext(ctx, fn) {
      const prevTags = contextTags;
      const prevAnchor = contextAnchor;
      contextTags = ctx.tags;
      contextAnchor = ctx.anchor;
      try {
        return fn();
      } finally {
        contextTags = prevTags;
        contextAnchor = prevAnchor;
      }
    },
  };
}

import { pathToJsonPointer } from '../utils/ref';
import type { IR } from './types';

/**
 * Simply adds `items` to the schema. Also handles setting the logical operator
 * and avoids setting it for a single item or tuples.
 */
export function addItemsToSchema({
  items,
  logicalOperator = 'or',
  mutateSchemaOneItem = false,
  schema,
}: {
  items: Array<IR.SchemaObject>;
  logicalOperator?: IR.SchemaObject['logicalOperator'];
  mutateSchemaOneItem?: boolean;
  schema: IR.SchemaObject;
}): IR.SchemaObject {
  if (!items.length) {
    return schema;
  }

  if (schema.type === 'tuple') {
    schema.items = items;
    return schema;
  }

  if (items.length !== 1) {
    schema.items = items;
    schema.logicalOperator = logicalOperator;
    return schema;
  }

  if (mutateSchemaOneItem) {
    // bring composition up to avoid extraneous brackets
    schema = {
      ...schema,
      ...items[0],
    };
    return schema;
  }

  schema.items = items;
  return schema;
}

export type SchemaExtractorContext = {
  path: ReadonlyArray<string | number>;
  schema: IR.SchemaObject;
};

export type SchemaExtractor = (ctx: SchemaExtractorContext) => IR.SchemaObject;

export const inlineSchema: SchemaExtractor = (ctx) => ctx.schema;

export function createSchemaExtractor({
  callback,
  shouldExtract,
}: {
  /** Called when a schema should be extracted. Should call irSchemaToAst with the provided path to extract the schema and register the symbol. */
  callback: (ctx: SchemaExtractorContext) => void;
  /** Determines whether a schema at a given path should be extracted. */
  shouldExtract: (ctx: SchemaExtractorContext) => boolean;
}): SchemaExtractor {
  // track pointers to prevent infinite recursion
  const extractedPointers = new Set<string>();

  const extractor: SchemaExtractor = (ctx) => {
    const pointer = pathToJsonPointer(ctx.path);
    if (extractedPointers.has(pointer) || !shouldExtract(ctx)) {
      return ctx.schema;
    }
    extractedPointers.add(pointer);
    callback(ctx);
    return { $ref: pointer };
  };

  return extractor;
}

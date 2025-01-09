import type { IR } from './types';

/**
 * Ensure we don't produce redundant types, e.g. string | string.
 */
export const deduplicateSchema = <T extends IR.SchemaObject>({
  schema,
}: {
  schema: T;
}): T => {
  if (!schema.items) {
    return schema;
  }

  const uniqueItems: Array<IR.SchemaObject> = [];
  const typeIds: Array<string> = [];

  for (const item of schema.items) {
    // skip nested schemas for now, handle if necessary
    if (!item.type && item.items) {
      uniqueItems.push(item);
      continue;
    }

    if (
      // no `type` might still include `$ref` or `const`
      !item.type ||
      item.type === 'boolean' ||
      item.type === 'integer' ||
      item.type === 'null' ||
      item.type === 'number' ||
      item.type === 'string' ||
      item.type === 'unknown' ||
      item.type === 'void'
    ) {
      // const needs namespace to handle empty string values, otherwise
      // fallback would equal an actual value and we would skip an item
      const typeId = `${item.$ref ?? ''}${item.type ?? ''}${item.const !== undefined ? `const-${item.const}` : ''}`;
      if (!typeIds.includes(typeId)) {
        typeIds.push(typeId);
        uniqueItems.push(item);
      }
      continue;
    }

    uniqueItems.push(item);
  }

  schema.items = uniqueItems;

  if (
    schema.items.length <= 1 &&
    schema.type !== 'array' &&
    schema.type !== 'enum' &&
    schema.type !== 'tuple'
  ) {
    // bring the only item up to clean up the schema
    const liftedSchema = schema.items[0];
    delete schema.logicalOperator;
    delete schema.items;
    schema = {
      ...schema,
      ...liftedSchema,
    };
  }

  // exclude unknown if it's the only type left
  if (schema.type === 'unknown') {
    return {} as T;
  }

  return schema;
};

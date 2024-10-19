import type { IRSchemaObject } from './ir';

/**
 * Simply adds `items` to the schema. Also handles setting the logical operator
 * and avoids setting it for a single item or tuples.
 */
export const addItemsToSchema = ({
  items,
  schema,
}: {
  items: Array<IRSchemaObject>;
  schema: IRSchemaObject;
}) => {
  if (!items.length) {
    return;
  }

  schema.items = items;

  if (items.length === 1 || schema.type === 'tuple') {
    return;
  }

  schema.logicalOperator = 'or';
};

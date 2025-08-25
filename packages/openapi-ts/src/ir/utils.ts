import { mergeSchemaAccessScopes } from '../openApi/shared/utils/schema';
import type { IR } from './types';

const assignItems = ({
  items,
  schema,
}: {
  items: Array<IR.SchemaObject>;
  schema: IR.SchemaObject;
}) => {
  for (const item of items) {
    schema.accessScopes = mergeSchemaAccessScopes(
      schema.accessScopes,
      item.accessScopes,
    );
  }
  schema.items = items;
};

/**
 * Simply adds `items` to the schema. Also handles setting the logical operator
 * and avoids setting it for a single item or tuples.
 */
export const addItemsToSchema = ({
  items,
  logicalOperator = 'or',
  mutateSchemaOneItem = false,
  schema,
}: {
  items: Array<IR.SchemaObject>;
  logicalOperator?: IR.SchemaObject['logicalOperator'];
  mutateSchemaOneItem?: boolean;
  schema: IR.SchemaObject;
}) => {
  if (!items.length) {
    return schema;
  }

  if (schema.type === 'tuple') {
    assignItems({ items, schema });
    return schema;
  }

  if (items.length !== 1) {
    assignItems({ items, schema });
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

  assignItems({ items, schema });
  return schema;
};

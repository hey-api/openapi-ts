import type ts from "typescript";

import { compiler } from "../../compiler";
import type { IR } from "../../ir/types"
import type { SchemaWithRequired, SchemaWithType } from "../../openApi/shared/types/schema";

const arrayTypeToExpression = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  schema,
}: {
  context: IR.Context;
  schema: SchemaWithType<'array'>;
}) => {
  // TODO: inject no/a few items based on argument
  const elements: Array<unknown> = [];
  return compiler.arrayLiteralExpression({
    elements,
  })
}

const objectTypeToExpression = ({
  context,
  schema,
}: {
  context: IR.Context;
  schema: SchemaWithType<'object'>;
}) => {
  const keys: Array<unknown> = [];
  for (const name in schema.properties) {
    const property = schema.properties[name]!
    const expression = schemaToExpression({
      context,
      schema: property,
    })
    keys.push({
      key: name,
      value: expression,
    })
  }
  return compiler.objectExpression({
    obj: keys,
  })
}

const stringTypeToExpression = ({
  schema,
}: {
  context: IR.Context;
  schema: SchemaWithType<'string'>;
}) => {
  // TODO: handle enums, need to either set a random value or import enum if TypeScript
  if (typeof schema.const === 'string') {
    return compiler.ots.string(schema.const);
  }
  return compiler.ots.string('');
}

// TODO: use faker + examples
const schemaTypeToExpression = ({
  context,
  schema,
}: {
  context: IR.Context;
  schema: SchemaWithRequired<IR.SchemaObject, 'type'>
}) => {
  // TODO: handle enum and tuple
  switch (schema.type) {
    // TODO: handle array
    case 'array':
      return arrayTypeToExpression({
        context,
        schema: schema as SchemaWithType<'array'>,
      })
    case 'boolean':
      return compiler.ots.boolean(true);
    case 'integer':
    case 'number':
      return compiler.ots.number(0);
    case 'null':
      return compiler.null()
    // TODO: handle object
    case 'object':
      return objectTypeToExpression({
        context,
        schema: schema as SchemaWithType<'object'>,
      })
    case 'string':
      return stringTypeToExpression({
        context,
        schema: schema as SchemaWithType<'string'>,
      })
    case 'never':
    case 'undefined':
    case 'unknown':
    case 'void':
    default:
      return compiler.identifier({ text: 'undefined' })
  }
}

export const schemaToExpression = ({
  context,
  schema,
}: {
  context: IR.Context;
  schema: IR.SchemaObject;
}) => {
  let expression: ts.Expression;

  if (schema.$ref) {
    const ref = context.resolveIrRef<IR.SchemaObject>(schema.$ref);
    expression = schemaToExpression({
      context,
      schema: ref,
    })
  } else if (schema.type) {
    expression = schemaTypeToExpression({
      context,
      schema: schema as SchemaWithRequired<IR.SchemaObject, 'type'>,
    })
  } else if (schema.items) {
    if (schema.logicalOperator === 'or' && schema.items[0]) {
      expression = schemaToExpression({
        context,
        schema: schema.items[0],
      })
    } else {
      console.warn(
        '🚨',
        `unhandled schema items with logical operator "${schema.logicalOperator}"`,
        JSON.stringify(schema),
      );
    }
  } else {
    console.warn(
      '🚨',
      'unhandled schema',
      JSON.stringify(schema),
    );
  }

  return expression!;
}

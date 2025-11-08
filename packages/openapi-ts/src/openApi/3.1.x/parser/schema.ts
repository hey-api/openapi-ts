import type { Context } from '~/ir/context';
import type { IR } from '~/ir/types';
import { addItemsToSchema } from '~/ir/utils';
import type {
  SchemaState,
  SchemaType,
  SchemaWithRequired,
} from '~/openApi/shared/types/schema';
import { discriminatorValues } from '~/openApi/shared/utils/discriminator';
import { refToName } from '~/utils/ref';

import type { SchemaObject } from '../types/spec';

export const getSchemaTypes = ({
  schema,
}: {
  schema: SchemaObject;
}): ReadonlyArray<SchemaType<SchemaObject>> => {
  if (typeof schema.type === 'string') {
    return [schema.type];
  }

  if (schema.type) {
    return schema.type;
  }

  // infer object based on the presence of properties
  if (schema.properties) {
    return ['object'];
  }

  return [];
};

const parseSchemaJsDoc = ({
  irSchema,
  schema,
}: {
  irSchema: IR.SchemaObject;
  schema: SchemaObject;
}) => {
  if (schema.deprecated !== undefined) {
    irSchema.deprecated = schema.deprecated;
  }

  if (schema.example) {
    irSchema.example = schema.example;
  }

  if (schema.description) {
    irSchema.description = schema.description;
  }

  if (schema.title) {
    irSchema.title = schema.title;
  }
};

const parseSchemaMeta = ({
  irSchema,
  schema,
}: {
  irSchema: IR.SchemaObject;
  schema: SchemaObject;
}) => {
  if (schema.const !== undefined) {
    irSchema.const = schema.const;

    // try to infer schema type
    if (!schema.type) {
      if (schema.const === null) {
        irSchema.type = 'null';
      } else {
        switch (typeof schema.const) {
          case 'bigint':
          case 'number':
            irSchema.type = 'number';
            break;
          case 'boolean':
            irSchema.type = 'boolean';
            break;
          case 'string':
            irSchema.type = 'string';
            break;
        }
      }
    }
  }

  if (schema.default !== undefined) {
    irSchema.default = schema.default;
  }

  if (schema.exclusiveMaximum !== undefined) {
    irSchema.exclusiveMaximum = schema.exclusiveMaximum;
  }

  if (schema.exclusiveMinimum !== undefined) {
    irSchema.exclusiveMinimum = schema.exclusiveMinimum;
  }

  if (schema.format) {
    irSchema.format = schema.format;
  }

  if (schema.maximum !== undefined) {
    irSchema.maximum = schema.maximum;
  }

  if (schema.maxItems !== undefined) {
    irSchema.maxItems = schema.maxItems;
  }

  if (schema.maxLength !== undefined) {
    irSchema.maxLength = schema.maxLength;
  }

  if (schema.minimum !== undefined) {
    irSchema.minimum = schema.minimum;
  }

  if (schema.minItems !== undefined) {
    irSchema.minItems = schema.minItems;
  }

  if (schema.minLength !== undefined) {
    irSchema.minLength = schema.minLength;
  }

  if (schema.pattern) {
    irSchema.pattern = schema.pattern;
  }

  if (schema.readOnly) {
    irSchema.accessScope = 'read';
  } else if (schema.writeOnly) {
    irSchema.accessScope = 'write';
  }
};

const parseArray = ({
  context,
  irSchema = {},
  schema,
  state,
}: {
  context: Context;
  irSchema?: IR.SchemaObject;
  schema: SchemaObject;
  state: SchemaState;
}): IR.SchemaObject => {
  if (
    (schema.prefixItems && schema.prefixItems.length) ||
    (schema.maxItems && schema.maxItems === schema.minItems) ||
    schema.const !== undefined
  ) {
    irSchema.type = 'tuple';
  } else {
    irSchema.type = 'array';
  }

  let schemaItems: Array<IR.SchemaObject> = [];

  for (const item of schema.prefixItems ?? []) {
    const irItemSchema = schemaToIrSchema({
      context,
      schema: item,
      state,
    });
    schemaItems.push(irItemSchema);
  }

  if (schema.items) {
    const irItemsSchema = schemaToIrSchema({
      context,
      schema: schema.items,
      state,
    });

    if (
      !schemaItems.length &&
      schema.maxItems &&
      schema.maxItems === schema.minItems
    ) {
      schemaItems = Array(schema.maxItems).fill(irItemsSchema);
    } else {
      const ofArray =
        schema.items.allOf || schema.items.anyOf || schema.items.oneOf;
      if (
        ofArray &&
        ofArray.length > 1 &&
        !getSchemaTypes({ schema: schema.items }).includes('null')
      ) {
        // bring composition up to avoid incorrectly nested arrays
        irSchema = {
          ...irSchema,
          ...irItemsSchema,
        };
      } else {
        schemaItems.push(irItemsSchema);
      }
    }
  }

  irSchema = addItemsToSchema({
    items: schemaItems,
    schema: irSchema,
  });

  return irSchema;
};

const parseBoolean = ({
  irSchema = {},
}: {
  context: Context;
  irSchema?: IR.SchemaObject;
  schema: SchemaObject;
}): IR.SchemaObject => {
  irSchema.type = 'boolean';

  return irSchema;
};

const parseNull = ({
  irSchema = {},
}: {
  context: Context;
  irSchema?: IR.SchemaObject;
  schema: SchemaObject;
}) => {
  irSchema.type = 'null';

  return irSchema;
};

const parseNumber = ({
  irSchema = {},
  schema,
}: {
  context: Context;
  irSchema?: IR.SchemaObject;
  schema: Omit<SchemaObject, 'type'> & {
    type: SchemaType<SchemaObject>;
  };
}): IR.SchemaObject => {
  irSchema.type = schema.type;

  return irSchema;
};

const parseObject = ({
  context,
  irSchema = {},
  schema,
  state,
}: {
  context: Context;
  irSchema?: IR.SchemaObject;
  schema: SchemaObject;
  state: SchemaState;
}): IR.SchemaObject => {
  irSchema.type = 'object';

  const schemaProperties: Record<string, IR.SchemaObject> = {};

  for (const name in schema.properties) {
    const property = schema.properties[name]!;
    if (typeof property === 'boolean') {
      // TODO: parser - handle boolean properties
    } else {
      const irPropertySchema = schemaToIrSchema({
        context,
        schema: property,
        state,
      });
      schemaProperties[name] = irPropertySchema;
    }
  }

  if (Object.keys(schemaProperties).length) {
    irSchema.properties = schemaProperties;
  }

  if (schema.additionalProperties === undefined) {
    if (!irSchema.properties) {
      irSchema.additionalProperties = {
        type: 'unknown',
      };
    }
  } else if (typeof schema.additionalProperties === 'boolean') {
    // Avoid [key: string]: never for empty objects with additionalProperties: false inside allOf
    // This would override inherited properties from other schemas in the composition
    const isEmptyObjectInAllOf =
      state.inAllOf &&
      schema.additionalProperties === false &&
      (!schema.properties || !Object.keys(schema.properties).length) &&
      (!schema.patternProperties ||
        !Object.keys(schema.patternProperties).length);

    if (!isEmptyObjectInAllOf) {
      irSchema.additionalProperties = {
        type: schema.additionalProperties ? 'unknown' : 'never',
      };
    }
  } else {
    const irAdditionalPropertiesSchema = schemaToIrSchema({
      context,
      schema: schema.additionalProperties,
      state,
    });
    irSchema.additionalProperties = irAdditionalPropertiesSchema;
  }

  if (schema.patternProperties) {
    const patternProperties: Record<string, IR.SchemaObject> = {};

    for (const pattern in schema.patternProperties) {
      const patternSchema = schema.patternProperties[pattern]!;
      const irPatternSchema = schemaToIrSchema({
        context,
        schema: patternSchema,
        state,
      });
      patternProperties[pattern] = irPatternSchema;
    }

    if (Object.keys(patternProperties).length) {
      irSchema.patternProperties = patternProperties;
    }
  }

  if (schema.propertyNames) {
    irSchema.propertyNames = schemaToIrSchema({
      context,
      schema: schema.propertyNames,
      state,
    });
  }

  if (schema.required) {
    irSchema.required = schema.required;
  }

  return irSchema;
};

const parseString = ({
  irSchema = {},
}: {
  context: Context;
  irSchema?: IR.SchemaObject;
  schema: SchemaObject;
}): IR.SchemaObject => {
  irSchema.type = 'string';

  return irSchema;
};

const initIrSchema = ({
  schema,
}: {
  schema: SchemaObject;
}): IR.SchemaObject => {
  const irSchema: IR.SchemaObject = {};

  parseSchemaJsDoc({
    irSchema,
    schema,
  });

  return irSchema;
};

const parseAllOf = ({
  context,
  schema,
  state,
}: {
  context: Context;
  schema: SchemaWithRequired<SchemaObject, 'allOf'>;
  state: SchemaState;
}): IR.SchemaObject => {
  let irSchema = initIrSchema({ schema });
  parseSchemaMeta({ irSchema, schema });

  const schemaItems: Array<IR.SchemaObject> = [];
  const schemaTypes = getSchemaTypes({ schema });

  const compositionSchemas = schema.allOf;

  for (const compositionSchema of compositionSchemas) {
    const originalInAllOf = state.inAllOf;
    // Don't propagate inAllOf flag to $ref schemas to avoid issues with reusable components
    if (!('$ref' in compositionSchema)) {
      state.inAllOf = true;
    }
    const irCompositionSchema = schemaToIrSchema({
      context,
      schema: compositionSchema,
      state,
    });
    state.inAllOf = originalInAllOf;
    if (state.inAllOf === undefined) {
      delete state.inAllOf;
    }

    if (schema.required) {
      if (irCompositionSchema.required) {
        irCompositionSchema.required = [
          ...irCompositionSchema.required,
          ...schema.required,
        ];
      } else {
        irCompositionSchema.required = schema.required;
      }
    }

    schemaItems.push(irCompositionSchema);

    if (compositionSchema.$ref) {
      const ref = context.resolveRef<SchemaObject>(compositionSchema.$ref);
      // `$ref` should be passed from the root `parseSchema()` call
      if (ref.discriminator && state.$ref) {
        const values = discriminatorValues(
          state.$ref,
          ref.discriminator.mapping,
          // If the ref has oneOf, we only use the schema name as the value
          // only if current schema is part of the oneOf. Else it is extending
          // the ref schema
          ref.oneOf
            ? () => ref.oneOf!.some((o) => '$ref' in o && o.$ref === state.$ref)
            : undefined,
        );
        if (values.length > 0) {
          const valueSchemas: ReadonlyArray<IR.SchemaObject> = values.map(
            (value) => ({
              const: value,
              type: 'string',
            }),
          );
          const irDiscriminatorSchema: IR.SchemaObject = {
            properties: {
              [ref.discriminator.propertyName]:
                valueSchemas.length > 1
                  ? {
                      items: valueSchemas,
                      logicalOperator: 'or',
                    }
                  : valueSchemas[0]!,
            },
            type: 'object',
          };
          if (ref.required?.includes(ref.discriminator.propertyName)) {
            irDiscriminatorSchema.required = [ref.discriminator.propertyName];
          }
          schemaItems.push(irDiscriminatorSchema);
        }
      }
    }
  }

  if (schemaTypes.includes('object')) {
    const irObjectSchema = parseOneType({
      context,
      schema: {
        ...schema,
        type: 'object',
      },
      state,
    });

    if (irObjectSchema.properties) {
      for (const requiredProperty of irObjectSchema.required ?? []) {
        if (!irObjectSchema.properties[requiredProperty]) {
          for (const compositionSchema of compositionSchemas) {
            // TODO: parser - this could be probably resolved more accurately
            const finalCompositionSchema = compositionSchema.$ref
              ? context.resolveRef<SchemaObject>(compositionSchema.$ref)
              : compositionSchema;

            if (
              getSchemaTypes({ schema: finalCompositionSchema }).includes(
                'object',
              )
            ) {
              const irCompositionSchema = parseOneType({
                context,
                schema: {
                  ...finalCompositionSchema,
                  type: 'object',
                },
                state,
              });

              if (irCompositionSchema.properties?.[requiredProperty]) {
                irObjectSchema.properties[requiredProperty] =
                  irCompositionSchema.properties[requiredProperty];
                break;
              }
            }
          }
        }
      }
      schemaItems.push(irObjectSchema);
    }
  }

  irSchema = addItemsToSchema({
    items: schemaItems,
    logicalOperator: 'and',
    mutateSchemaOneItem: true,
    schema: irSchema,
  });

  if (schemaTypes.includes('null')) {
    // nest composition to avoid producing an intersection with null
    const nestedItems: Array<IR.SchemaObject> = [
      {
        type: 'null',
      },
    ];

    if (schemaItems.length) {
      nestedItems.unshift(irSchema);
    }

    irSchema = {
      items: nestedItems,
      logicalOperator: 'or',
    };
  }

  return irSchema;
};

const parseAnyOf = ({
  context,
  schema,
  state,
}: {
  context: Context;
  schema: SchemaWithRequired<SchemaObject, 'anyOf'>;
  state: SchemaState;
}): IR.SchemaObject => {
  let irSchema = initIrSchema({ schema });
  parseSchemaMeta({ irSchema, schema });

  const schemaItems: Array<IR.SchemaObject> = [];
  const schemaTypes = getSchemaTypes({ schema });

  const compositionSchemas = schema.anyOf;

  for (const compositionSchema of compositionSchemas) {
    let irCompositionSchema = schemaToIrSchema({
      context,
      schema: compositionSchema,
      state,
    });

    // `$ref` should be defined with discriminators
    if (schema.discriminator && irCompositionSchema.$ref != null) {
      const values = discriminatorValues(
        irCompositionSchema.$ref,
        schema.discriminator.mapping,
      );
      const valueSchemas: ReadonlyArray<IR.SchemaObject> = values.map(
        (value) => ({
          const: value,
          type: 'string',
        }),
      );
      const irDiscriminatorSchema: IR.SchemaObject = {
        properties: {
          [schema.discriminator.propertyName]:
            valueSchemas.length > 1
              ? {
                  items: valueSchemas,
                  logicalOperator: 'or',
                }
              : valueSchemas[0]!,
        },
        type: 'object',
      };
      irCompositionSchema = {
        items: [irDiscriminatorSchema, irCompositionSchema],
        logicalOperator: 'and',
      };
    }

    schemaItems.push(irCompositionSchema);
  }

  if (schemaTypes.includes('null')) {
    schemaItems.push({ type: 'null' });
  }

  irSchema = addItemsToSchema({
    items: schemaItems,
    mutateSchemaOneItem: true,
    schema: irSchema,
  });

  if (schemaTypes.includes('object')) {
    // nest composition to avoid producing a union with object properties
    const irObjectSchema = parseOneType({
      context,
      schema: {
        ...schema,
        type: 'object',
      },
      state,
    });

    if (irObjectSchema.properties) {
      irSchema = {
        items: [irSchema, irObjectSchema],
        logicalOperator: 'and',
      };
    }
  }

  return irSchema;
};

const parseEnum = ({
  context,
  schema,
  state,
}: {
  context: Context;
  schema: SchemaWithRequired<SchemaObject, 'enum'>;
  state: SchemaState;
}): IR.SchemaObject => {
  let irSchema = initIrSchema({ schema });

  irSchema.type = 'enum';

  const schemaItems: Array<IR.SchemaObject> = [];
  const schemaTypes = getSchemaTypes({ schema });

  for (const [index, enumValue] of schema.enum.entries()) {
    const typeOfEnumValue = typeof enumValue;
    let enumType: SchemaType<SchemaObject> | undefined;

    if (
      typeOfEnumValue === 'string' ||
      typeOfEnumValue === 'number' ||
      typeOfEnumValue === 'boolean'
    ) {
      enumType = typeOfEnumValue;
    } else if (typeOfEnumValue === 'object' && Array.isArray(enumValue)) {
      enumType = 'array';
    } else if (enumValue === null) {
      // type must contain null
      if (schemaTypes.includes('null')) {
        enumType = 'null';
      }
    } else {
      console.warn(
        '🚨',
        `unhandled "${typeOfEnumValue}" typeof value "${enumValue}" for enum`,
        schema.enum,
      );
    }

    if (!enumType) {
      continue;
    }

    const irTypeSchema = parseOneType({
      context,
      schema: {
        const: enumValue,
        description: schema['x-enum-descriptions']?.[index],
        title:
          schema['x-enum-varnames']?.[index] ?? schema['x-enumNames']?.[index],
        type: enumType,
      },
      state,
    });

    schemaItems.push(irTypeSchema);
  }

  irSchema = addItemsToSchema({
    items: schemaItems,
    schema: irSchema,
  });

  return irSchema;
};

const parseOneOf = ({
  context,
  schema,
  state,
}: {
  context: Context;
  schema: SchemaWithRequired<SchemaObject, 'oneOf'>;
  state: SchemaState;
}): IR.SchemaObject => {
  let irSchema = initIrSchema({ schema });
  parseSchemaMeta({ irSchema, schema });

  let schemaItems: Array<IR.SchemaObject> = [];
  const schemaTypes = getSchemaTypes({ schema });

  const compositionSchemas = schema.oneOf;

  for (const compositionSchema of compositionSchemas) {
    let irCompositionSchema = schemaToIrSchema({
      context,
      schema: compositionSchema,
      state,
    });

    // `$ref` should be defined with discriminators
    if (schema.discriminator && irCompositionSchema.$ref != null) {
      const values = discriminatorValues(
        irCompositionSchema.$ref,
        schema.discriminator.mapping,
      );
      const valueSchemas: ReadonlyArray<IR.SchemaObject> = values.map(
        (value) => ({
          const: value,
          type: 'string',
        }),
      );
      const irDiscriminatorSchema: IR.SchemaObject = {
        properties: {
          [schema.discriminator.propertyName]:
            valueSchemas.length > 1
              ? {
                  items: valueSchemas,
                  logicalOperator: 'or',
                }
              : valueSchemas[0]!,
        },
        required: [schema.discriminator.propertyName],
        type: 'object',
      };
      irCompositionSchema = {
        items: [irDiscriminatorSchema, irCompositionSchema],
        logicalOperator: 'and',
      };
    }

    // since we know oneOf will be using "or" logical operator, if the parsed
    // composition schema also has an "or" operator, we can bring it up
    // to avoid unnecessary brackets
    if (
      irCompositionSchema.logicalOperator === 'or' &&
      irCompositionSchema.type !== 'array' &&
      irCompositionSchema.items
    ) {
      schemaItems = schemaItems.concat(irCompositionSchema.items);
    } else {
      schemaItems.push(irCompositionSchema);
    }
  }

  if (schemaTypes.includes('null')) {
    schemaItems.push({ type: 'null' });
  }

  irSchema = addItemsToSchema({
    items: schemaItems,
    mutateSchemaOneItem: true,
    schema: irSchema,
  });

  if (schemaTypes.includes('object')) {
    // nest composition to avoid producing a union with object properties
    const irObjectSchema = parseOneType({
      context,
      schema: {
        ...schema,
        type: 'object',
      },
      state,
    });

    if (irObjectSchema.properties) {
      irSchema = {
        items: [irSchema, irObjectSchema],
        logicalOperator: 'and',
      };
    }
  }

  return irSchema;
};

const parseRef = ({
  context,
  schema,
  state,
}: {
  context: Context;
  schema: SchemaWithRequired<SchemaObject, '$ref'>;
  state: SchemaState;
}): IR.SchemaObject => {
  // Inline non-component refs (e.g. #/paths/...) to avoid generating orphaned named types
  const isComponentsRef = schema.$ref.startsWith('#/components/');
  if (!isComponentsRef) {
    if (!state.circularReferenceTracker.has(schema.$ref)) {
      const refSchema = context.resolveRef<SchemaObject>(schema.$ref);
      const originalRef = state.$ref;
      state.$ref = schema.$ref;
      const irSchema = schemaToIrSchema({
        context,
        schema: refSchema,
        state,
      });
      state.$ref = originalRef;
      return irSchema;
    }
    // Fallback to preserving the ref if circular
  }

  let irSchema = initIrSchema({ schema });
  parseSchemaMeta({ irSchema, schema });

  const irRefSchema: IR.SchemaObject = {};

  // refs using unicode characters become encoded, didn't investigate why
  // but the suspicion is this comes from `@hey-api/json-schema-ref-parser`
  irRefSchema.$ref = decodeURI(schema.$ref);

  if (!state.circularReferenceTracker.has(schema.$ref)) {
    const refSchema = context.resolveRef<SchemaObject>(schema.$ref);
    const originalRef = state.$ref;
    state.$ref = schema.$ref;
    schemaToIrSchema({
      context,
      schema: refSchema,
      state,
    });
    state.$ref = originalRef;
  }

  const schemaItems: Array<IR.SchemaObject> = [];
  schemaItems.push(irRefSchema);

  if (schema.type && typeof schema.type !== 'string') {
    if (schema.type.includes('null')) {
      schemaItems.push({ type: 'null' });
    }
  }

  irSchema = addItemsToSchema({
    items: schemaItems,
    mutateSchemaOneItem: true,
    schema: irSchema,
  });

  return irSchema;
};

const parseOneType = ({
  context,
  irSchema,
  schema,
  state,
}: {
  context: Context;
  irSchema?: IR.SchemaObject;
  schema: Omit<SchemaObject, 'type'> & {
    type: SchemaType<SchemaObject>;
  };
  state: SchemaState;
}): IR.SchemaObject => {
  if (!irSchema) {
    irSchema = initIrSchema({ schema });
    parseSchemaMeta({ irSchema, schema });
  }

  switch (schema.type) {
    case 'array':
      return parseArray({
        context,
        irSchema,
        schema,
        state,
      });
    case 'boolean':
      return parseBoolean({
        context,
        irSchema,
        schema,
      });
    case 'integer':
    case 'number':
      return parseNumber({
        context,
        irSchema,
        schema,
      });
    case 'null':
      return parseNull({
        context,
        irSchema,
        schema,
      });
    case 'object':
      return parseObject({
        context,
        irSchema,
        schema,
        state,
      });
    case 'string':
      return parseString({
        context,
        irSchema,
        schema,
      });
    default:
      // gracefully handle invalid type
      return parseUnknown({ context, irSchema, schema });
  }
};

const parseManyTypes = ({
  context,
  irSchema,
  schema,
  state,
}: {
  context: Context;
  irSchema?: IR.SchemaObject;
  schema: Omit<SchemaObject, 'type'> & {
    type: ReadonlyArray<SchemaType<SchemaObject>>;
  };
  state: SchemaState;
}): IR.SchemaObject => {
  if (!irSchema) {
    irSchema = initIrSchema({ schema });
  }

  const typeIrSchema: IR.SchemaObject = {};

  parseSchemaMeta({ irSchema: typeIrSchema, schema });

  if (schema.type.includes('null') && typeIrSchema.default === null) {
    // clear to avoid duplicate default inside the non-null schema.
    // this would produce incorrect validator output
    delete typeIrSchema.default;
  }

  const schemaItems: Array<IR.SchemaObject> = [];

  for (const type of schema.type) {
    if (type === 'null') {
      schemaItems.push({ type: 'null' });
    } else {
      const irTypeSchema = parseOneType({
        context,
        irSchema: { ...typeIrSchema },
        schema: {
          ...schema,
          type,
        },
        state,
      });

      schemaItems.push(irTypeSchema);
    }
  }

  irSchema = addItemsToSchema({
    items: schemaItems,
    schema: irSchema,
  });

  return irSchema;
};

const parseType = ({
  context,
  schema,
  state,
}: {
  context: Context;
  schema: SchemaWithRequired<SchemaObject, 'type'>;
  state: SchemaState;
}): IR.SchemaObject => {
  const irSchema = initIrSchema({ schema });

  parseSchemaMeta({ irSchema, schema });

  const schemaTypes = getSchemaTypes({ schema });

  if (schemaTypes.length === 1) {
    return parseOneType({
      context,
      irSchema,
      schema: {
        ...schema,
        type: schemaTypes[0]!,
      },
      state,
    });
  }

  return parseManyTypes({
    context,
    irSchema,
    schema: {
      ...schema,
      type: schemaTypes,
    },
    state,
  });
};

const parseUnknown = ({
  irSchema,
  schema,
}: {
  context: Context;
  irSchema?: IR.SchemaObject;
  schema: SchemaObject;
}): IR.SchemaObject => {
  if (!irSchema) {
    irSchema = initIrSchema({ schema });
  }

  irSchema.type = 'unknown';

  parseSchemaMeta({ irSchema, schema });

  return irSchema;
};

export const schemaToIrSchema = ({
  context,
  schema,
  state,
}: {
  context: Context;
  schema: SchemaObject;
  state: SchemaState | undefined;
}): IR.SchemaObject => {
  if (!state) {
    state = {
      circularReferenceTracker: new Set(),
    };
  }

  if (state.$ref) {
    state.circularReferenceTracker.add(state.$ref);
  }

  if (schema.$ref) {
    return parseRef({
      context,
      schema: schema as SchemaWithRequired<SchemaObject, '$ref'>,
      state,
    });
  }

  if (schema.enum) {
    return parseEnum({
      context,
      schema: schema as SchemaWithRequired<SchemaObject, 'enum'>,
      state,
    });
  }

  if (schema.allOf) {
    return parseAllOf({
      context,
      schema: schema as SchemaWithRequired<SchemaObject, 'allOf'>,
      state,
    });
  }

  if (schema.anyOf) {
    return parseAnyOf({
      context,
      schema: schema as SchemaWithRequired<SchemaObject, 'anyOf'>,
      state,
    });
  }

  if (schema.oneOf) {
    return parseOneOf({
      context,
      schema: schema as SchemaWithRequired<SchemaObject, 'oneOf'>,
      state,
    });
  }

  // infer object based on the presence of properties
  if (schema.type || schema.properties) {
    return parseType({
      context,
      schema: schema as SchemaWithRequired<SchemaObject, 'type'>,
      state,
    });
  }

  return parseUnknown({ context, schema });
};

export const parseSchema = ({
  $ref,
  context,
  schema,
}: {
  $ref: string;
  context: Context;
  schema: SchemaObject;
}) => {
  if (!context.ir.components) {
    context.ir.components = {};
  }

  if (!context.ir.components.schemas) {
    context.ir.components.schemas = {};
  }

  context.ir.components.schemas[refToName($ref)] = schemaToIrSchema({
    context,
    schema,
    state: {
      $ref,
      circularReferenceTracker: new Set(),
    },
  });
};

import type { IR } from '../../../ir/types';
import { addItemsToSchema } from '../../../ir/utils';
import { refToName } from '../../../utils/ref';
import type {
  SchemaState,
  SchemaType,
  SchemaWithRequired,
} from '../../shared/types/schema';
import { discriminatorValue } from '../../shared/utils/discriminator';
import { mergeSchemaAccessScopes } from '../../shared/utils/schema';
import type { ReferenceObject, SchemaObject } from '../types/spec';

export const getSchemaType = ({
  schema,
}: {
  schema: SchemaObject;
}): SchemaType<SchemaObject> | undefined => {
  if (schema.type) {
    return schema.type;
  }

  // infer object based on the presence of properties
  if (schema.properties) {
    return 'object';
  }
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
  if (schema.default !== undefined) {
    irSchema.default = schema.default;
  }

  if (schema.exclusiveMaximum) {
    if (schema.maximum !== undefined) {
      irSchema.exclusiveMaximum = schema.maximum;
    }
  } else if (schema.maximum !== undefined) {
    irSchema.maximum = schema.maximum;
  }

  if (schema.exclusiveMinimum) {
    if (schema.minimum !== undefined) {
      irSchema.exclusiveMinimum = schema.minimum;
    }
  } else if (schema.minimum !== undefined) {
    irSchema.minimum = schema.minimum;
  }

  if (schema.format) {
    irSchema.format = schema.format;
  }

  if (schema.maxItems !== undefined) {
    irSchema.maxItems = schema.maxItems;
  }

  if (schema.maxLength !== undefined) {
    irSchema.maxLength = schema.maxLength;
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
    irSchema.accessScopes = mergeSchemaAccessScopes(irSchema.accessScopes, [
      'read',
    ]);
  } else if (schema.writeOnly) {
    irSchema.accessScope = 'write';
    irSchema.accessScopes = mergeSchemaAccessScopes(irSchema.accessScopes, [
      'write',
    ]);
  }
};

const parseArray = ({
  context,
  irSchema = {},
  schema,
  state,
}: {
  context: IR.Context;
  irSchema?: IR.SchemaObject;
  schema: SchemaObject;
  state: SchemaState;
}): IR.SchemaObject => {
  if (schema.maxItems && schema.maxItems === schema.minItems) {
    irSchema.type = 'tuple';
  } else {
    irSchema.type = 'array';
  }

  let schemaItems: Array<IR.SchemaObject> = [];

  if (schema.items) {
    const irItemsSchema = schemaToIrSchema({
      context,
      schema: schema.items,
      state,
    });

    irSchema.accessScopes = mergeSchemaAccessScopes(
      irSchema.accessScopes,
      irItemsSchema.accessScopes,
    );

    if (
      !schemaItems.length &&
      schema.maxItems &&
      schema.maxItems === schema.minItems
    ) {
      schemaItems = Array(schema.maxItems).fill(irItemsSchema);
    } else {
      if ('$ref' in schema.items) {
        schemaItems.push(irItemsSchema);
      } else {
        const ofArray =
          schema.items.allOf || schema.items.anyOf || schema.items.oneOf;
        if (ofArray && ofArray.length > 1 && !schema.items.nullable) {
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
  context: IR.Context;
  irSchema?: IR.SchemaObject;
  schema: SchemaObject;
  state: SchemaState;
}): IR.SchemaObject => {
  irSchema.type = 'boolean';

  return irSchema;
};

const parseNumber = ({
  irSchema = {},
  schema,
}: {
  context: IR.Context;
  irSchema?: IR.SchemaObject;
  schema: SchemaWithRequired<SchemaObject, 'type'>;
  state: SchemaState;
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
  context: IR.Context;
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
      irSchema.accessScopes = mergeSchemaAccessScopes(
        irSchema.accessScopes,
        irPropertySchema.accessScopes,
      );
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
    irSchema.additionalProperties = {
      type: schema.additionalProperties ? 'unknown' : 'never',
    };
  } else {
    const irAdditionalPropertiesSchema = schemaToIrSchema({
      context,
      schema: schema.additionalProperties,
      state,
    });
    // no need to add "any" additional properties if there are no defined properties
    if (
      irSchema.properties ||
      irAdditionalPropertiesSchema.type !== 'unknown'
    ) {
      irSchema.additionalProperties = irAdditionalPropertiesSchema;
    }
  }

  if (schema.required) {
    irSchema.required = schema.required;
  }

  return irSchema;
};

const parseString = ({
  irSchema = {},
}: {
  context: IR.Context;
  irSchema?: IR.SchemaObject;
  schema: SchemaObject;
  state: SchemaState;
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
  context: IR.Context;
  schema: SchemaWithRequired<SchemaObject, 'allOf'>;
  state: SchemaState;
}): IR.SchemaObject => {
  let irSchema = initIrSchema({ schema });

  const schemaItems: Array<IR.SchemaObject> = [];
  const schemaType = getSchemaType({ schema });

  const compositionSchemas = schema.allOf;

  for (const compositionSchema of compositionSchemas) {
    const irCompositionSchema = schemaToIrSchema({
      context,
      schema: compositionSchema,
      state,
    });

    irSchema.accessScopes = mergeSchemaAccessScopes(
      irSchema.accessScopes,
      irCompositionSchema.accessScopes,
    );

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

    if ('$ref' in compositionSchema) {
      const ref = context.resolveRef<SchemaObject>(compositionSchema.$ref);
      // `$ref` should be passed from the root `parseSchema()` call
      if (ref.discriminator && state.$ref) {
        const irDiscriminatorSchema: IR.SchemaObject = {
          properties: {
            [ref.discriminator.propertyName]: {
              const: discriminatorValue(state.$ref, ref.discriminator.mapping),
              type: 'string',
            },
          },
          type: 'object',
        };
        if (ref.required?.includes(ref.discriminator.propertyName)) {
          irDiscriminatorSchema.required = [ref.discriminator.propertyName];
        }
        schemaItems.push(irDiscriminatorSchema);
      }

      if (!state.circularReferenceTracker.has(compositionSchema.$ref)) {
        const irRefSchema = schemaToIrSchema({
          context,
          schema: ref,
          state: {
            ...state,
            $ref: compositionSchema.$ref,
          },
        });
        irSchema.accessScopes = mergeSchemaAccessScopes(
          irSchema.accessScopes,
          irRefSchema.accessScopes,
        );
      }
    }
  }

  if (schemaType === 'object') {
    const irObjectSchema = parseOneType({
      context,
      schema: {
        ...schema,
        type: 'object',
      },
      state,
    });

    irSchema.accessScopes = mergeSchemaAccessScopes(
      irSchema.accessScopes,
      irObjectSchema.accessScopes,
    );

    if (irObjectSchema.properties) {
      for (const requiredProperty of irObjectSchema.required ?? []) {
        if (!irObjectSchema.properties[requiredProperty]) {
          for (const compositionSchema of compositionSchemas) {
            // TODO: parser - this could be probably resolved more accurately
            const finalCompositionSchema =
              '$ref' in compositionSchema
                ? context.resolveRef<SchemaObject>(compositionSchema.$ref)
                : compositionSchema;

            if (
              getSchemaType({ schema: finalCompositionSchema }) === 'object'
            ) {
              const irCompositionSchema = parseOneType({
                context,
                schema: {
                  ...finalCompositionSchema,
                  type: 'object',
                },
                state,
              });

              irSchema.accessScopes = mergeSchemaAccessScopes(
                irSchema.accessScopes,
                irCompositionSchema.accessScopes,
              );

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

  if (schema.nullable) {
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

    // TODO: parser - this is a hack to bring back up meta fields
    // without it, some schemas were missing original deprecated
    if (nestedItems[0]!.deprecated) {
      irSchema.deprecated = nestedItems[0]!.deprecated;
    }

    // TODO: parser - this is a hack to bring back up meta fields
    // without it, some schemas were missing original description
    if (nestedItems[0]!.description) {
      irSchema.description = nestedItems[0]!.description;
    }
  }

  return irSchema;
};

const parseAnyOf = ({
  context,
  schema,
  state,
}: {
  context: IR.Context;
  schema: SchemaWithRequired<SchemaObject, 'anyOf'>;
  state: SchemaState;
}): IR.SchemaObject => {
  let irSchema = initIrSchema({ schema });

  const schemaItems: Array<IR.SchemaObject> = [];
  const schemaType = getSchemaType({ schema });

  const compositionSchemas = schema.anyOf;

  for (const compositionSchema of compositionSchemas) {
    let irCompositionSchema = schemaToIrSchema({
      context,
      schema: compositionSchema,
      state,
    });

    irSchema.accessScopes = mergeSchemaAccessScopes(
      irSchema.accessScopes,
      irCompositionSchema.accessScopes,
    );

    // `$ref` should be defined with discriminators
    if (schema.discriminator && '$ref' in compositionSchema) {
      const irDiscriminatorSchema: IR.SchemaObject = {
        properties: {
          [schema.discriminator.propertyName]: {
            const: discriminatorValue(
              compositionSchema.$ref,
              schema.discriminator.mapping,
            ),
            type: 'string',
          },
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

  if (schema.nullable) {
    schemaItems.push({ type: 'null' });
  }

  irSchema = addItemsToSchema({
    items: schemaItems,
    mutateSchemaOneItem: true,
    schema: irSchema,
  });

  if (schemaType === 'object') {
    // nest composition to avoid producing a union with object properties
    const irObjectSchema = parseOneType({
      context,
      schema: {
        ...schema,
        type: 'object',
      },
      state,
    });

    irSchema.accessScopes = mergeSchemaAccessScopes(
      irSchema.accessScopes,
      irObjectSchema.accessScopes,
    );

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
  context: IR.Context;
  schema: SchemaWithRequired<SchemaObject, 'enum'>;
  state: SchemaState;
}): IR.SchemaObject => {
  let irSchema = initIrSchema({ schema });

  irSchema.type = 'enum';

  const schemaItems: Array<IR.SchemaObject> = [];

  for (const [index, enumValue] of schema.enum.entries()) {
    const typeOfEnumValue = typeof enumValue;
    let enumType: SchemaType<SchemaObject> | 'null' | undefined;

    if (
      typeOfEnumValue === 'string' ||
      typeOfEnumValue === 'number' ||
      typeOfEnumValue === 'boolean'
    ) {
      enumType = typeOfEnumValue;
    } else if (enumValue === null) {
      // nullable must be true
      if (schema.nullable) {
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
        description: schema['x-enum-descriptions']?.[index],
        title:
          schema['x-enum-varnames']?.[index] ?? schema['x-enumNames']?.[index],
        // cast enum to string temporarily
        type: enumType === 'null' ? 'string' : enumType,
      },
      state,
    });

    irTypeSchema.const = enumValue;

    // cast enum back
    if (enumType === 'null') {
      irTypeSchema.type = enumType;
    }

    irSchema.accessScopes = mergeSchemaAccessScopes(
      irSchema.accessScopes,
      irTypeSchema.accessScopes,
    );

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
  context: IR.Context;
  schema: SchemaWithRequired<SchemaObject, 'oneOf'>;
  state: SchemaState;
}): IR.SchemaObject => {
  let irSchema = initIrSchema({ schema });

  let schemaItems: Array<IR.SchemaObject> = [];
  const schemaType = getSchemaType({ schema });

  const compositionSchemas = schema.oneOf;

  for (const compositionSchema of compositionSchemas) {
    let irCompositionSchema = schemaToIrSchema({
      context,
      schema: compositionSchema,
      state,
    });

    irSchema.accessScopes = mergeSchemaAccessScopes(
      irSchema.accessScopes,
      irCompositionSchema.accessScopes,
    );

    // `$ref` should be defined with discriminators
    if (schema.discriminator && '$ref' in compositionSchema) {
      const irDiscriminatorSchema: IR.SchemaObject = {
        properties: {
          [schema.discriminator.propertyName]: {
            const: discriminatorValue(
              compositionSchema.$ref,
              schema.discriminator.mapping,
            ),
            type: 'string',
          },
        },
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
      irCompositionSchema.items
    ) {
      schemaItems = schemaItems.concat(irCompositionSchema.items);
    } else {
      schemaItems.push(irCompositionSchema);
    }
  }

  if (schema.nullable) {
    schemaItems.push({ type: 'null' });
  }

  irSchema = addItemsToSchema({
    items: schemaItems,
    mutateSchemaOneItem: true,
    schema: irSchema,
  });

  if (schemaType === 'object') {
    // nest composition to avoid producing a union with object properties
    const irObjectSchema = parseOneType({
      context,
      schema: {
        ...schema,
        type: 'object',
      },
      state,
    });

    irSchema.accessScopes = mergeSchemaAccessScopes(
      irSchema.accessScopes,
      irObjectSchema.accessScopes,
    );

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
  context: IR.Context;
  schema: ReferenceObject;
  state: SchemaState;
}): IR.SchemaObject => {
  const irSchema: IR.SchemaObject = {};

  // refs using unicode characters become encoded, didn't investigate why
  // but the suspicion is this comes from `@hey-api/json-schema-ref-parser`
  irSchema.$ref = decodeURI(schema.$ref);

  if (!state.circularReferenceTracker.has(schema.$ref)) {
    const refSchema = context.resolveRef<SchemaObject>(schema.$ref);
    const irRefSchema = schemaToIrSchema({
      context,
      schema: refSchema,
      state: {
        ...state,
        $ref: schema.$ref,
      },
    });
    irSchema.accessScopes = mergeSchemaAccessScopes(
      irSchema.accessScopes,
      irRefSchema.accessScopes,
    );
  }

  return irSchema;
};

const parseNullableType = ({
  context,
  irSchema,
  schema,
  state,
}: {
  context: IR.Context;
  irSchema?: IR.SchemaObject;
  schema: SchemaWithRequired<SchemaObject, 'type'>;
  state: SchemaState;
}): IR.SchemaObject => {
  if (!irSchema) {
    irSchema = initIrSchema({ schema });
  }

  const typeIrSchema: IR.SchemaObject = {};

  parseSchemaMeta({
    irSchema: typeIrSchema,
    schema,
  });

  if (typeIrSchema.default === null) {
    // clear to avoid duplicate default inside the non-null schema.
    // this would produce incorrect validator output
    delete typeIrSchema.default;
  }

  const schemaItems: Array<IR.SchemaObject> = [
    parseOneType({
      context,
      irSchema: typeIrSchema,
      schema,
      state,
    }),
    {
      type: 'null',
    },
  ];

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
  context: IR.Context;
  schema: SchemaWithRequired<SchemaObject, 'type'>;
  state: SchemaState;
}): IR.SchemaObject => {
  const irSchema = initIrSchema({ schema });

  parseSchemaMeta({
    irSchema,
    schema,
  });

  const type = getSchemaType({ schema });

  if (!type) {
    return irSchema;
  }

  if (!schema.nullable) {
    return parseOneType({
      context,
      irSchema,
      schema: {
        ...schema,
        type,
      },
      state,
    });
  }

  return parseNullableType({
    context,
    irSchema,
    schema: {
      ...schema,
      type,
    },
    state,
  });
};

const parseOneType = ({
  context,
  irSchema,
  schema,
  state,
}: {
  context: IR.Context;
  irSchema?: IR.SchemaObject;
  schema: SchemaWithRequired<SchemaObject, 'type'>;
  state: SchemaState;
}): IR.SchemaObject => {
  if (!irSchema) {
    irSchema = initIrSchema({ schema });

    parseSchemaMeta({
      irSchema,
      schema,
    });
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
        state,
      });
    case 'integer':
    case 'number':
      return parseNumber({
        context,
        irSchema,
        schema,
        state,
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
        state,
      });
    default:
      // gracefully handle invalid type
      return parseUnknown({
        context,
        irSchema,
        schema,
        state,
      });
  }
};

const parseUnknown = ({
  irSchema,
  schema,
}: {
  context: IR.Context;
  irSchema?: IR.SchemaObject;
  schema: SchemaObject;
  state: SchemaState;
}): IR.SchemaObject => {
  if (!irSchema) {
    irSchema = initIrSchema({ schema });
  }

  irSchema.type = 'unknown';

  parseSchemaMeta({
    irSchema,
    schema,
  });

  return irSchema;
};

export const schemaToIrSchema = ({
  context,
  schema,
  state,
}: {
  context: IR.Context;
  schema: SchemaObject | ReferenceObject;
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

  if ('$ref' in schema) {
    return parseRef({
      context,
      schema,
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

  return parseUnknown({
    context,
    schema,
    state,
  });
};

export const parseSchema = ({
  $ref,
  context,
  schema,
}: {
  $ref: string;
  context: IR.Context;
  schema: SchemaObject | ReferenceObject;
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

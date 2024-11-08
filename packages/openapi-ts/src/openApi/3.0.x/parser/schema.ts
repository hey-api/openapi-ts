import type { IRContext } from '../../../ir/context';
import type { IRSchemaObject } from '../../../ir/ir';
import { addItemsToSchema } from '../../../ir/utils';
import type { ReferenceObject, SchemaObject } from '../types/spec';

type SchemaWithRequired<K extends keyof Required<SchemaObject>> = Omit<
  SchemaObject,
  K
> &
  Pick<Required<SchemaObject>, K>;

type SchemaType = Required<SchemaObject>['type'];

export const getSchemaType = ({
  schema,
}: {
  schema: SchemaObject;
}): SchemaType | undefined => {
  if (schema.type) {
    return schema.type;
  }

  // infer object based on the presence of properties
  if (schema.properties) {
    return 'object';
  }
};

const parseSchemaMeta = ({
  irSchema,
  schema,
}: {
  irSchema: IRSchemaObject;
  schema: SchemaObject;
}) => {
  if (schema.format) {
    irSchema.format = schema.format;
  }

  if (schema.readOnly) {
    irSchema.accessScope = 'read';
  } else if (schema.writeOnly) {
    irSchema.accessScope = 'write';
  }

  if (schema.title) {
    irSchema.title = schema.title;
  }
};

const parseArray = ({
  context,
  irSchema = {},
  schema,
}: {
  context: IRContext;
  irSchema?: IRSchemaObject;
  schema: SchemaObject;
}): IRSchemaObject => {
  if (schema.maxItems && schema.maxItems === schema.minItems) {
    irSchema.type = 'tuple';
  } else {
    irSchema.type = 'array';
  }

  let schemaItems: Array<IRSchemaObject> = [];

  if (schema.items) {
    const irItemsSchema = schemaToIrSchema({
      context,
      schema: schema.items,
    });

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
        const isComposedSchema = Boolean(
          schema.items.allOf || schema.items.anyOf || schema.items.oneOf,
        );
        if (isComposedSchema) {
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
  context: IRContext;
  irSchema?: IRSchemaObject;
  schema: SchemaObject;
}): IRSchemaObject => {
  irSchema.type = 'boolean';

  return irSchema;
};

const parseNumber = ({
  irSchema = {},
}: {
  context: IRContext;
  irSchema?: IRSchemaObject;
  schema: SchemaObject;
}): IRSchemaObject => {
  irSchema.type = 'number';

  return irSchema;
};

const parseObject = ({
  context,
  irSchema = {},
  schema,
}: {
  context: IRContext;
  irSchema?: IRSchemaObject;
  schema: SchemaObject;
}): IRSchemaObject => {
  irSchema.type = 'object';

  const schemaProperties: Record<string, IRSchemaObject> = {};

  for (const name in schema.properties) {
    const property = schema.properties[name];
    if (typeof property === 'boolean') {
      // TODO: parser - handle boolean properties
    } else {
      schemaProperties[name] = schemaToIrSchema({
        context,
        schema: property,
      });
    }
  }

  if (Object.keys(schemaProperties).length) {
    irSchema.properties = schemaProperties;
  }

  if (schema.additionalProperties !== undefined) {
    if (typeof schema.additionalProperties === 'boolean') {
      irSchema.additionalProperties = {
        type: schema.additionalProperties ? 'unknown' : 'never',
      };
    } else {
      const irAdditionalPropertiesSchema = schemaToIrSchema({
        context,
        schema: schema.additionalProperties,
      });
      // no need to add "any" additional properties if there are no defined properties
      if (
        irSchema.properties ||
        irAdditionalPropertiesSchema.type !== 'unknown'
      ) {
        irSchema.additionalProperties = irAdditionalPropertiesSchema;
      }
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
  context: IRContext;
  irSchema?: IRSchemaObject;
  schema: SchemaObject;
}): IRSchemaObject => {
  irSchema.type = 'string';

  return irSchema;
};

const parseSchemaJsDoc = ({
  irSchema,
  schema,
}: {
  irSchema: IRSchemaObject;
  schema: SchemaObject;
}) => {
  if (schema.deprecated !== undefined) {
    irSchema.deprecated = schema.deprecated;
  }

  if (schema.description) {
    irSchema.description = schema.description;
  }
};

const initIrSchema = ({ schema }: { schema: SchemaObject }): IRSchemaObject => {
  const irSchema: IRSchemaObject = {};

  parseSchemaJsDoc({
    irSchema,
    schema,
  });

  return irSchema;
};

const parseAllOf = ({
  context,
  schema,
}: {
  context: IRContext;
  schema: SchemaWithRequired<'allOf'>;
}): IRSchemaObject => {
  let irSchema = initIrSchema({ schema });

  const schemaItems: Array<IRSchemaObject> = [];
  const schemaType = getSchemaType({ schema });

  const compositionSchemas = schema.allOf;

  for (const compositionSchema of compositionSchemas) {
    schemaItems.push(
      schemaToIrSchema({
        context,
        schema: compositionSchema,
      }),
    );
  }

  if (schemaType === 'object') {
    const irObjectSchema = parseOneType({
      context,
      schema: {
        ...schema,
        type: 'object',
      },
    });

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

  if (schema.nullable) {
    // nest composition to avoid producing an intersection with null
    const nestedItems: Array<IRSchemaObject> = [
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
    if (nestedItems[0].deprecated) {
      irSchema.deprecated = nestedItems[0].deprecated;
    }

    // TODO: parser - this is a hack to bring back up meta fields
    // without it, some schemas were missing original description
    if (nestedItems[0].description) {
      irSchema.description = nestedItems[0].description;
    }
  }

  if (schema.discriminator) {
    // TODO: parser - support discriminator
    // TODO: parser - maybe abstract discriminator from oneOf, anyOf, and allOf
  }

  return irSchema;
};

const parseAnyOf = ({
  context,
  schema,
}: {
  context: IRContext;
  schema: SchemaWithRequired<'anyOf'>;
}): IRSchemaObject => {
  let irSchema = initIrSchema({ schema });

  const schemaItems: Array<IRSchemaObject> = [];
  const schemaType = getSchemaType({ schema });

  for (const anyOf of schema.anyOf) {
    schemaItems.push(
      schemaToIrSchema({
        context,
        schema: anyOf,
      }),
    );
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
    });

    if (irObjectSchema.properties) {
      irSchema = {
        items: [irSchema, irObjectSchema],
        logicalOperator: 'and',
      };
    }
  }

  if (schema.discriminator) {
    // TODO: parser - support discriminator
    // TODO: parser - maybe abstract discriminator from oneOf, anyOf, and allOf
  }

  return irSchema;
};

const parseEnum = ({
  context,
  schema,
}: {
  context: IRContext;
  schema: SchemaWithRequired<'enum'>;
}): IRSchemaObject => {
  let irSchema = initIrSchema({ schema });

  irSchema.type = 'enum';

  const schemaItems: Array<IRSchemaObject> = [];

  for (const [index, enumValue] of schema.enum.entries()) {
    const typeOfEnumValue = typeof enumValue;
    let enumType: SchemaType | 'null' | undefined;

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

    const enumSchema = parseOneType({
      context,
      schema: {
        description: schema['x-enum-descriptions']?.[index],
        title:
          schema['x-enum-varnames']?.[index] ?? schema['x-enumNames']?.[index],
        // cast enum to string temporarily
        type: enumType === 'null' ? 'string' : enumType,
      },
    });

    enumSchema.const = enumValue;

    // cast enum back
    if (enumType === 'null') {
      enumSchema.type = enumType;
    }

    schemaItems.push(enumSchema);
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
}: {
  context: IRContext;
  schema: SchemaWithRequired<'oneOf'>;
}): IRSchemaObject => {
  let irSchema = initIrSchema({ schema });

  let schemaItems: Array<IRSchemaObject> = [];
  const schemaType = getSchemaType({ schema });

  for (const oneOf of schema.oneOf) {
    const irOneOfSchema = schemaToIrSchema({
      context,
      schema: oneOf,
    });

    // since we know oneOf will be using "or" logical operator, if the parsed
    // composition schema also has an "or" operator, we can bring it up
    // to avoid unnecessary brackets
    if (irOneOfSchema.logicalOperator === 'or' && irOneOfSchema.items) {
      schemaItems = schemaItems.concat(irOneOfSchema.items);
    } else {
      schemaItems.push(irOneOfSchema);
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
    });

    if (irObjectSchema.properties) {
      irSchema = {
        items: [irSchema, irObjectSchema],
        logicalOperator: 'and',
      };
    }
  }

  if (schema.discriminator) {
    // TODO: parser - support discriminator
    // TODO: parser - maybe abstract discriminator from oneOf, anyOf, and allOf
  }

  return irSchema;
};

const parseRef = ({
  schema,
}: {
  context: IRContext;
  schema: ReferenceObject;
}): IRSchemaObject => {
  const irSchema: IRSchemaObject = {};

  // refs using unicode characters become encoded, didn't investigate why
  // but the suspicion is this comes from `@apidevtools/json-schema-ref-parser`
  irSchema.$ref = decodeURI(schema.$ref);

  return irSchema;
};

const parseNullableType = ({
  context,
  irSchema,
  schema,
}: {
  context: IRContext;
  irSchema?: IRSchemaObject;
  schema: SchemaWithRequired<'type'>;
}): IRSchemaObject => {
  if (!irSchema) {
    irSchema = initIrSchema({ schema });

    parseSchemaMeta({
      irSchema,
      schema,
    });
  }

  const schemaItems: Array<IRSchemaObject> = [
    parseOneType({
      context,
      irSchema: {},
      schema,
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
}: {
  context: IRContext;
  schema: SchemaWithRequired<'type'>;
}): IRSchemaObject => {
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
    });
  }

  return parseNullableType({
    context,
    irSchema,
    schema: {
      ...schema,
      type,
    },
  });
};

const parseOneType = ({
  context,
  irSchema,
  schema,
}: {
  context: IRContext;
  irSchema?: IRSchemaObject;
  schema: SchemaWithRequired<'type'>;
}): IRSchemaObject => {
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
    case 'object':
      return parseObject({
        context,
        irSchema,
        schema,
      });
    case 'string':
      return parseString({
        context,
        irSchema,
        schema,
      });
  }
};

const parseUnknown = ({
  schema,
}: {
  context: IRContext;
  schema: SchemaObject;
}): IRSchemaObject => {
  const irSchema = initIrSchema({ schema });

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
}: {
  context: IRContext;
  schema: SchemaObject | ReferenceObject;
}): IRSchemaObject => {
  if ('$ref' in schema) {
    return parseRef({
      context,
      schema,
    });
  }

  if (schema.enum) {
    return parseEnum({
      context,
      schema: schema as SchemaWithRequired<'enum'>,
    });
  }

  if (schema.allOf) {
    return parseAllOf({
      context,
      schema: schema as SchemaWithRequired<'allOf'>,
    });
  }

  if (schema.anyOf) {
    return parseAnyOf({
      context,
      schema: schema as SchemaWithRequired<'anyOf'>,
    });
  }

  if (schema.oneOf) {
    return parseOneOf({
      context,
      schema: schema as SchemaWithRequired<'oneOf'>,
    });
  }

  // infer object based on the presence of properties
  if (schema.type || schema.properties) {
    return parseType({
      context,
      schema: schema as SchemaWithRequired<'type'>,
    });
  }

  return parseUnknown({
    context,
    schema,
  });
};

export const parseSchema = ({
  context,
  name,
  schema,
}: {
  context: IRContext;
  name: string;
  schema: SchemaObject | ReferenceObject;
}) => {
  if (!context.ir.components) {
    context.ir.components = {};
  }

  if (!context.ir.components.schemas) {
    context.ir.components.schemas = {};
  }

  context.ir.components.schemas[name] = schemaToIrSchema({
    context,
    schema,
  });
};

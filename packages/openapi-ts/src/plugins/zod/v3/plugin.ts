import ts from 'typescript';

import { deduplicateSchema } from '../../../ir/schema';
import type { IR } from '../../../ir/types';
import { buildName } from '../../../openApi/shared/utils/name';
import { tsc } from '../../../tsc';
import { refToName } from '../../../utils/ref';
import { numberRegExp } from '../../../utils/regexp';
import { identifiers, zodId } from '../constants';
import { exportZodSchema } from '../export';
import { getZodModule } from '../shared/module';
import { operationToZodSchema } from '../shared/operation';
import type { SchemaWithType, State, ZodSchema } from '../shared/types';
import type { ZodPlugin } from '../types';

const arrayTypeToZodSchema = ({
  plugin,
  schema,
  state,
}: {
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'array'>;
  state: State;
}): ts.CallExpression => {
  const functionName = tsc.propertyAccessExpression({
    expression: identifiers.z,
    name: identifiers.array,
  });

  let arrayExpression: ts.CallExpression | undefined;

  if (!schema.items) {
    arrayExpression = tsc.callExpression({
      functionName,
      parameters: [
        unknownTypeToZodSchema({
          schema: {
            type: 'unknown',
          },
        }),
      ],
    });
  } else {
    schema = deduplicateSchema({ schema });

    // at least one item is guaranteed
    const itemExpressions = schema.items!.map(
      (item) =>
        schemaToZodSchema({
          plugin,
          schema: item,
          state,
        }).expression,
    );

    if (itemExpressions.length === 1) {
      arrayExpression = tsc.callExpression({
        functionName,
        parameters: itemExpressions,
      });
    } else {
      if (schema.logicalOperator === 'and') {
        // TODO: parser - handle intersection
        // return tsc.typeArrayNode(
        //   tsc.typeIntersectionNode({ types: itemExpressions }),
        // );
      }

      arrayExpression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: identifiers.z,
          name: identifiers.array,
        }),
        parameters: [
          tsc.callExpression({
            functionName: tsc.propertyAccessExpression({
              expression: identifiers.z,
              name: identifiers.union,
            }),
            parameters: [
              tsc.arrayLiteralExpression({
                elements: itemExpressions,
              }),
            ],
          }),
        ],
      });
    }
  }

  if (schema.minItems === schema.maxItems && schema.minItems !== undefined) {
    arrayExpression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: arrayExpression,
        name: identifiers.length,
      }),
      parameters: [tsc.valueToExpression({ value: schema.minItems })],
    });
  } else {
    if (schema.minItems !== undefined) {
      arrayExpression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: arrayExpression,
          name: identifiers.min,
        }),
        parameters: [tsc.valueToExpression({ value: schema.minItems })],
      });
    }

    if (schema.maxItems !== undefined) {
      arrayExpression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: arrayExpression,
          name: identifiers.max,
        }),
        parameters: [tsc.valueToExpression({ value: schema.maxItems })],
      });
    }
  }

  return arrayExpression;
};

const booleanTypeToZodSchema = ({
  schema,
}: {
  schema: SchemaWithType<'boolean'>;
}) => {
  if (typeof schema.const === 'boolean') {
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: identifiers.z,
        name: identifiers.literal,
      }),
      parameters: [tsc.ots.boolean(schema.const)],
    });
    return expression;
  }

  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: identifiers.z,
      name: identifiers.boolean,
    }),
  });
  return expression;
};

const enumTypeToZodSchema = ({
  schema,
}: {
  schema: SchemaWithType<'enum'>;
}): ts.CallExpression => {
  const enumMembers: Array<ts.LiteralExpression> = [];

  let isNullable = false;

  for (const item of schema.items ?? []) {
    // Zod supports only string enums
    if (item.type === 'string' && typeof item.const === 'string') {
      enumMembers.push(
        tsc.stringLiteral({
          text: item.const,
        }),
      );
    } else if (item.type === 'null' || item.const === null) {
      isNullable = true;
    }
  }

  if (!enumMembers.length) {
    return unknownTypeToZodSchema({
      schema: {
        type: 'unknown',
      },
    });
  }

  let enumExpression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: identifiers.z,
      name: identifiers.enum,
    }),
    parameters: [
      tsc.arrayLiteralExpression({
        elements: enumMembers,
        multiLine: false,
      }),
    ],
  });

  if (isNullable) {
    enumExpression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: enumExpression,
        name: identifiers.nullable,
      }),
    });
  }

  return enumExpression;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const neverTypeToZodSchema = (_props: { schema: SchemaWithType<'never'> }) => {
  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: identifiers.z,
      name: identifiers.never,
    }),
  });
  return expression;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const nullTypeToZodSchema = (_props: { schema: SchemaWithType<'null'> }) => {
  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: identifiers.z,
      name: identifiers.null,
    }),
  });
  return expression;
};

const numberParameter = ({
  isBigInt,
  value,
}: {
  isBigInt: boolean;
  value: unknown;
}) => {
  const expression = tsc.valueToExpression({ value });

  if (
    isBigInt &&
    (typeof value === 'bigint' ||
      typeof value === 'number' ||
      typeof value === 'string' ||
      typeof value === 'boolean')
  ) {
    return tsc.callExpression({
      functionName: 'BigInt',
      parameters: [expression],
    });
  }

  return expression;
};

const numberTypeToZodSchema = ({
  schema,
}: {
  schema: SchemaWithType<'integer' | 'number'>;
}) => {
  const isBigInt = schema.type === 'integer' && schema.format === 'int64';

  if (typeof schema.const === 'number') {
    // TODO: parser - handle bigint constants
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: identifiers.z,
        name: identifiers.literal,
      }),
      parameters: [tsc.ots.number(schema.const)],
    });
    return expression;
  }

  let numberExpression = tsc.callExpression({
    functionName: isBigInt
      ? tsc.propertyAccessExpression({
          expression: tsc.propertyAccessExpression({
            expression: identifiers.z,
            name: identifiers.coerce,
          }),
          name: identifiers.bigint,
        })
      : tsc.propertyAccessExpression({
          expression: identifiers.z,
          name: identifiers.number,
        }),
  });

  if (!isBigInt && schema.type === 'integer') {
    numberExpression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: numberExpression,
        name: identifiers.int,
      }),
    });
  }

  if (schema.exclusiveMinimum !== undefined) {
    numberExpression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: numberExpression,
        name: identifiers.gt,
      }),
      parameters: [
        numberParameter({ isBigInt, value: schema.exclusiveMinimum }),
      ],
    });
  } else if (schema.minimum !== undefined) {
    numberExpression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: numberExpression,
        name: identifiers.gte,
      }),
      parameters: [numberParameter({ isBigInt, value: schema.minimum })],
    });
  }

  if (schema.exclusiveMaximum !== undefined) {
    numberExpression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: numberExpression,
        name: identifiers.lt,
      }),
      parameters: [
        numberParameter({ isBigInt, value: schema.exclusiveMaximum }),
      ],
    });
  } else if (schema.maximum !== undefined) {
    numberExpression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: numberExpression,
        name: identifiers.lte,
      }),
      parameters: [numberParameter({ isBigInt, value: schema.maximum })],
    });
  }

  return numberExpression;
};

const objectTypeToZodSchema = ({
  plugin,
  schema,
  state,
}: {
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'object'>;
  state: State;
}): {
  anyType: string;
  expression: ts.CallExpression;
} => {
  // TODO: parser - handle constants
  const properties: Array<ts.PropertyAssignment> = [];

  const required = schema.required ?? [];

  for (const name in schema.properties) {
    const property = schema.properties[name]!;
    const isRequired = required.includes(name);

    const propertyExpression = schemaToZodSchema({
      optional: !isRequired,
      plugin,
      schema: property,
      state,
    }).expression;

    numberRegExp.lastIndex = 0;
    let propertyName;
    if (numberRegExp.test(name)) {
      // For numeric literals, we'll handle negative numbers by using a string literal
      // instead of trying to use a PrefixUnaryExpression
      propertyName = name.startsWith('-')
        ? ts.factory.createStringLiteral(name)
        : ts.factory.createNumericLiteral(name);
    } else {
      propertyName = name;
    }
    // TODO: parser - abstract safe property name logic
    if (
      ((name.match(/^[0-9]/) && name.match(/\D+/g)) || name.match(/\W/g)) &&
      !name.startsWith("'") &&
      !name.endsWith("'")
    ) {
      propertyName = `'${name}'`;
    }
    properties.push(
      tsc.propertyAssignment({
        initializer: propertyExpression,
        name: propertyName,
      }),
    );
  }

  if (
    schema.additionalProperties &&
    schema.additionalProperties.type === 'object' &&
    !Object.keys(properties).length
  ) {
    const zodSchema = schemaToZodSchema({
      plugin,
      schema: schema.additionalProperties,
      state,
    }).expression;
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: identifiers.z,
        name: identifiers.record,
      }),
      parameters: [zodSchema],
    });
    return {
      anyType: 'AnyZodObject',
      expression,
    };
  }

  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: identifiers.z,
      name: identifiers.object,
    }),
    parameters: [ts.factory.createObjectLiteralExpression(properties, true)],
  });
  return {
    anyType: 'AnyZodObject',
    expression,
  };
};

const stringTypeToZodSchema = ({
  plugin,
  schema,
}: {
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'string'>;
}) => {
  if (typeof schema.const === 'string') {
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: identifiers.z,
        name: identifiers.literal,
      }),
      parameters: [tsc.ots.string(schema.const)],
    });
    return expression;
  }

  let stringExpression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: identifiers.z,
      name: identifiers.string,
    }),
  });

  if (schema.format) {
    switch (schema.format) {
      case 'date':
        stringExpression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: stringExpression,
            name: identifiers.date,
          }),
        });
        break;
      case 'date-time':
        stringExpression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: stringExpression,
            name: identifiers.datetime,
          }),
          parameters: plugin.config.dates.offset
            ? [
                tsc.objectExpression({
                  obj: [
                    {
                      key: 'offset',
                      value: true,
                    },
                  ],
                }),
              ]
            : [],
        });
        break;
      case 'email':
        stringExpression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: stringExpression,
            name: identifiers.email,
          }),
        });
        break;
      case 'ipv4':
      case 'ipv6':
        stringExpression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: stringExpression,
            name: identifiers.ip,
          }),
        });
        break;
      case 'time':
        stringExpression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: stringExpression,
            name: identifiers.time,
          }),
        });
        break;
      case 'uri':
        stringExpression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: stringExpression,
            name: identifiers.url,
          }),
        });
        break;
      case 'uuid':
        stringExpression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: stringExpression,
            name: identifiers.uuid,
          }),
        });
        break;
    }
  }

  if (schema.minLength === schema.maxLength && schema.minLength !== undefined) {
    stringExpression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: stringExpression,
        name: identifiers.length,
      }),
      parameters: [tsc.valueToExpression({ value: schema.minLength })],
    });
  } else {
    if (schema.minLength !== undefined) {
      stringExpression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: stringExpression,
          name: identifiers.min,
        }),
        parameters: [tsc.valueToExpression({ value: schema.minLength })],
      });
    }

    if (schema.maxLength !== undefined) {
      stringExpression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: stringExpression,
          name: identifiers.max,
        }),
        parameters: [tsc.valueToExpression({ value: schema.maxLength })],
      });
    }
  }

  if (schema.pattern) {
    stringExpression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: stringExpression,
        name: identifiers.regex,
      }),
      parameters: [tsc.regularExpressionLiteral({ text: schema.pattern })],
    });
  }

  return stringExpression;
};

const tupleTypeToZodSchema = ({
  plugin,
  schema,
  state,
}: {
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'tuple'>;
  state: State;
}) => {
  if (schema.const && Array.isArray(schema.const)) {
    const tupleElements = schema.const.map((value) =>
      tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: identifiers.z,
          name: identifiers.literal,
        }),
        parameters: [tsc.valueToExpression({ value })],
      }),
    );
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: identifiers.z,
        name: identifiers.tuple,
      }),
      parameters: [
        tsc.arrayLiteralExpression({
          elements: tupleElements,
        }),
      ],
    });
    return expression;
  }

  const tupleElements: Array<ts.Expression> = [];

  for (const item of schema.items ?? []) {
    tupleElements.push(
      schemaToZodSchema({
        plugin,
        schema: item,
        state,
      }).expression,
    );
  }

  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: identifiers.z,
      name: identifiers.tuple,
    }),
    parameters: [
      tsc.arrayLiteralExpression({
        elements: tupleElements,
      }),
    ],
  });
  return expression;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const undefinedTypeToZodSchema = (_props: {
  schema: SchemaWithType<'undefined'>;
}) => {
  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: identifiers.z,
      name: identifiers.undefined,
    }),
  });
  return expression;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const unknownTypeToZodSchema = (_props: {
  schema: SchemaWithType<'unknown'>;
}) => {
  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: identifiers.z,
      name: identifiers.unknown,
    }),
  });
  return expression;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const voidTypeToZodSchema = (_props: { schema: SchemaWithType<'void'> }) => {
  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: identifiers.z,
      name: identifiers.void,
    }),
  });
  return expression;
};

const schemaTypeToZodSchema = ({
  plugin,
  schema,
  state,
}: {
  plugin: ZodPlugin['Instance'];
  schema: IR.SchemaObject;
  state: State;
}): {
  anyType?: string;
  expression: ts.Expression;
} => {
  switch (schema.type as Required<IR.SchemaObject>['type']) {
    case 'array':
      return {
        expression: arrayTypeToZodSchema({
          plugin,
          schema: schema as SchemaWithType<'array'>,
          state,
        }),
      };
    case 'boolean':
      return {
        expression: booleanTypeToZodSchema({
          schema: schema as SchemaWithType<'boolean'>,
        }),
      };
    case 'enum':
      return {
        expression: enumTypeToZodSchema({
          schema: schema as SchemaWithType<'enum'>,
        }),
      };
    case 'integer':
    case 'number':
      return {
        expression: numberTypeToZodSchema({
          schema: schema as SchemaWithType<'integer' | 'number'>,
        }),
      };
    case 'never':
      return {
        expression: neverTypeToZodSchema({
          schema: schema as SchemaWithType<'never'>,
        }),
      };
    case 'null':
      return {
        expression: nullTypeToZodSchema({
          schema: schema as SchemaWithType<'null'>,
        }),
      };
    case 'object':
      return objectTypeToZodSchema({
        plugin,
        schema: schema as SchemaWithType<'object'>,
        state,
      });
    case 'string':
      return {
        expression: stringTypeToZodSchema({
          plugin,
          schema: schema as SchemaWithType<'string'>,
        }),
      };
    case 'tuple':
      return {
        expression: tupleTypeToZodSchema({
          plugin,
          schema: schema as SchemaWithType<'tuple'>,
          state,
        }),
      };
    case 'undefined':
      return {
        expression: undefinedTypeToZodSchema({
          schema: schema as SchemaWithType<'undefined'>,
        }),
      };
    case 'unknown':
      return {
        expression: unknownTypeToZodSchema({
          schema: schema as SchemaWithType<'unknown'>,
        }),
      };
    case 'void':
      return {
        expression: voidTypeToZodSchema({
          schema: schema as SchemaWithType<'void'>,
        }),
      };
  }
};

const schemaToZodSchema = ({
  optional,
  plugin,
  schema,
  state,
}: {
  /**
   * Accept `optional` to handle optional object properties. We can't handle
   * this inside the object function because `.optional()` must come before
   * `.default()` which is handled in this function.
   */
  optional?: boolean;
  plugin: ZodPlugin['Instance'];
  schema: IR.SchemaObject;
  state: State;
}): ZodSchema => {
  const file = plugin.context.file({ id: zodId })!;

  let zodSchema: Partial<ZodSchema> = {};

  if (schema.$ref) {
    const isCircularReference = state.circularReferenceTracker.includes(
      schema.$ref,
    );
    state.circularReferenceTracker.push(schema.$ref);
    state.currentReferenceTracker.push(schema.$ref);

    const id = plugin.api.getId({ type: 'ref', value: schema.$ref });

    if (isCircularReference) {
      const expression = file.addNodeReference(id, {
        factory: (text) => tsc.identifier({ text }),
      });
      zodSchema.expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: identifiers.z,
          name: identifiers.lazy,
        }),
        parameters: [
          tsc.arrowFunction({
            statements: [tsc.returnStatement({ expression })],
          }),
        ],
      });
      state.hasCircularReference = true;
    } else if (!file.getName(id)) {
      // if $ref hasn't been processed yet, inline it to avoid the
      // "Block-scoped variable used before its declaration." error
      // this could be (maybe?) fixed by reshuffling the generation order
      const ref = plugin.context.resolveIrRef<IR.SchemaObject>(schema.$ref);
      handleComponent({
        id: schema.$ref,
        plugin,
        schema: ref,
        state,
      });
    }

    if (!isCircularReference) {
      const expression = file.addNodeReference(id, {
        factory: (text) => tsc.identifier({ text }),
      });
      zodSchema.expression = expression;
    }

    state.circularReferenceTracker.pop();
    state.currentReferenceTracker.pop();
  } else if (schema.type) {
    const zSchema = schemaTypeToZodSchema({ plugin, schema, state });
    zodSchema.expression = zSchema.expression;
    zodSchema.typeName = zSchema.anyType;

    if (plugin.config.metadata && schema.description) {
      zodSchema.expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: zodSchema.expression,
          name: identifiers.describe,
        }),
        parameters: [tsc.stringLiteral({ text: schema.description })],
      });
    }
  } else if (schema.items) {
    schema = deduplicateSchema({ schema });

    if (schema.items) {
      const itemTypes = schema.items.map(
        (item) =>
          schemaToZodSchema({
            plugin,
            schema: item,
            state,
          }).expression,
      );

      if (schema.logicalOperator === 'and') {
        const firstSchema = schema.items[0]!;
        // we want to add an intersection, but not every schema can use the same API.
        // if the first item contains another array or not an object, we cannot use
        // `.merge()` as that does not exist on `.union()` and non-object schemas.
        if (
          firstSchema.logicalOperator === 'or' ||
          (firstSchema.type && firstSchema.type !== 'object')
        ) {
          zodSchema.expression = tsc.callExpression({
            functionName: tsc.propertyAccessExpression({
              expression: identifiers.z,
              name: identifiers.intersection,
            }),
            parameters: itemTypes,
          });
        } else {
          zodSchema.expression = itemTypes[0];
          itemTypes.slice(1).forEach((item) => {
            zodSchema.expression = tsc.callExpression({
              functionName: tsc.propertyAccessExpression({
                expression: zodSchema.expression!,
                name: identifiers.and,
              }),
              parameters: [item],
            });
          });
        }
      } else {
        zodSchema.expression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: identifiers.z,
            name: identifiers.union,
          }),
          parameters: [
            tsc.arrayLiteralExpression({
              elements: itemTypes,
            }),
          ],
        });
      }
    } else {
      zodSchema = schemaToZodSchema({ plugin, schema, state });
    }
  } else {
    // catch-all fallback for failed schemas
    const zSchema = schemaTypeToZodSchema({
      plugin,
      schema: {
        type: 'unknown',
      },
      state,
    });
    zodSchema.expression = zSchema.expression;
    zodSchema.typeName = zSchema.anyType;
  }

  if (zodSchema.expression) {
    if (schema.accessScope === 'read') {
      zodSchema.expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: zodSchema.expression,
          name: identifiers.readonly,
        }),
      });
    }

    if (optional) {
      zodSchema.expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: zodSchema.expression,
          name: identifiers.optional,
        }),
      });
    }

    if (schema.default !== undefined) {
      const isBigInt = schema.type === 'integer' && schema.format === 'int64';
      const callParameter = numberParameter({
        isBigInt,
        value: schema.default,
      });
      if (callParameter) {
        zodSchema.expression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: zodSchema.expression,
            name: identifiers.default,
          }),
          parameters: [callParameter],
        });
      }
    }
  }

  if (state.hasCircularReference) {
    if (!zodSchema.typeName) {
      zodSchema.typeName = 'ZodTypeAny';
    }
  } else {
    zodSchema.typeName = undefined;
  }

  return zodSchema as ZodSchema;
};

const handleComponent = ({
  id,
  plugin,
  schema,
  state,
}: {
  id: string;
  plugin: ZodPlugin['Instance'];
  schema: IR.SchemaObject;
  state?: State;
}): void => {
  if (!state) {
    state = {
      circularReferenceTracker: [id],
      currentReferenceTracker: [id],
      hasCircularReference: false,
    };
  }

  const file = plugin.context.file({ id: zodId })!;
  const schemaId = plugin.api.getId({ type: 'ref', value: id });

  if (file.getName(schemaId)) return;

  const zodSchema = schemaToZodSchema({ plugin, schema, state });
  const typeInferId = plugin.config.definitions.types.infer.enabled
    ? plugin.api.getId({ type: 'type-infer-ref', value: id })
    : undefined;
  exportZodSchema({
    plugin,
    schema,
    schemaId,
    typeInferId,
    zodSchema,
  });
  const baseName = refToName(id);
  file.updateNodeReferences(
    schemaId,
    buildName({
      config: plugin.config.definitions,
      name: baseName,
    }),
  );
  if (typeInferId) {
    file.updateNodeReferences(
      typeInferId,
      buildName({
        config: plugin.config.definitions.types.infer,
        name: baseName,
      }),
    );
  }
};

export const handlerV3: ZodPlugin['Handler'] = ({ plugin }) => {
  const file = plugin.createFile({
    case: plugin.config.case,
    id: zodId,
    path: plugin.output,
  });

  file.import({
    module: getZodModule({ plugin }),
    name: identifiers.z.text,
  });

  plugin.forEach('operation', 'parameter', 'requestBody', 'schema', (event) => {
    if (event.type === 'operation') {
      operationToZodSchema({
        getZodSchema: (schema) => {
          const state: State = {
            circularReferenceTracker: [],
            currentReferenceTracker: [],
            hasCircularReference: false,
          };
          return schemaToZodSchema({ plugin, schema, state });
        },
        operation: event.operation,
        plugin,
      });
    } else if (event.type === 'parameter') {
      handleComponent({
        id: event.$ref,
        plugin,
        schema: event.parameter.schema,
      });
    } else if (event.type === 'requestBody') {
      handleComponent({
        id: event.$ref,
        plugin,
        schema: event.requestBody.schema,
      });
    } else if (event.type === 'schema') {
      handleComponent({
        id: event.$ref,
        plugin,
        schema: event.schema,
      });
    }
  });
};

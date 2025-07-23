import ts from 'typescript';

import { compiler } from '../../../compiler';
import { deduplicateSchema } from '../../../ir/schema';
import type { IR } from '../../../ir/types';
import { buildName } from '../../../openApi/shared/utils/name';
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
}): Omit<ZodSchema, 'typeName'> => {
  const result: Partial<Omit<ZodSchema, 'typeName'>> = {};

  const functionName = compiler.propertyAccessExpression({
    expression: identifiers.z,
    name: identifiers.array,
  });

  if (!schema.items) {
    result.expression = compiler.callExpression({
      functionName,
      parameters: [
        unknownTypeToZodSchema({
          schema: {
            type: 'unknown',
          },
        }).expression,
      ],
    });
  } else {
    schema = deduplicateSchema({ schema });

    // at least one item is guaranteed
    const itemExpressions = schema.items!.map((item) => {
      const zodSchema = schemaToZodSchema({
        plugin,
        schema: item,
        state,
      });
      if (zodSchema.hasCircularReference) {
        result.hasCircularReference = true;
      }
      return zodSchema.expression;
    });

    if (itemExpressions.length === 1) {
      result.expression = compiler.callExpression({
        functionName,
        parameters: itemExpressions,
      });
    } else {
      if (schema.logicalOperator === 'and') {
        // TODO: parser - handle intersection
        // return compiler.typeArrayNode(
        //   compiler.typeIntersectionNode({ types: itemExpressions }),
        // );
      }

      result.expression = compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: identifiers.z,
          name: identifiers.array,
        }),
        parameters: [
          compiler.callExpression({
            functionName: compiler.propertyAccessExpression({
              expression: identifiers.z,
              name: identifiers.union,
            }),
            parameters: [
              compiler.arrayLiteralExpression({
                elements: itemExpressions,
              }),
            ],
          }),
        ],
      });
    }
  }

  const checks: Array<ts.Expression> = [];

  if (schema.minItems === schema.maxItems && schema.minItems !== undefined) {
    checks.push(
      compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: identifiers.z,
          name: identifiers.length,
        }),
        parameters: [compiler.valueToExpression({ value: schema.minItems })],
      }),
    );
  } else {
    if (schema.minItems !== undefined) {
      checks.push(
        compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: identifiers.z,
            name: identifiers.minLength,
          }),
          parameters: [compiler.valueToExpression({ value: schema.minItems })],
        }),
      );
    }

    if (schema.maxItems !== undefined) {
      checks.push(
        compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: identifiers.z,
            name: identifiers.maxLength,
          }),
          parameters: [compiler.valueToExpression({ value: schema.maxItems })],
        }),
      );
    }
  }

  if (checks.length) {
    result.expression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: result.expression,
        name: identifiers.check,
      }),
      parameters: checks,
    });
  }

  return result as Omit<ZodSchema, 'typeName'>;
};

const booleanTypeToZodSchema = ({
  schema,
}: {
  schema: SchemaWithType<'boolean'>;
}): Omit<ZodSchema, 'typeName'> => {
  const result: Partial<Omit<ZodSchema, 'typeName'>> = {};

  if (typeof schema.const === 'boolean') {
    result.expression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: identifiers.z,
        name: identifiers.literal,
      }),
      parameters: [compiler.ots.boolean(schema.const)],
    });
    return result as Omit<ZodSchema, 'typeName'>;
  }

  result.expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: identifiers.z,
      name: identifiers.boolean,
    }),
  });
  return result as Omit<ZodSchema, 'typeName'>;
};

const enumTypeToZodSchema = ({
  schema,
}: {
  schema: SchemaWithType<'enum'>;
}): Omit<ZodSchema, 'typeName'> => {
  const result: Partial<Omit<ZodSchema, 'typeName'>> = {};

  const enumMembers: Array<ts.LiteralExpression> = [];

  let isNullable = false;

  for (const item of schema.items ?? []) {
    // Zod supports only string enums
    if (item.type === 'string' && typeof item.const === 'string') {
      enumMembers.push(
        compiler.stringLiteral({
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

  result.expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: identifiers.z,
      name: identifiers.enum,
    }),
    parameters: [
      compiler.arrayLiteralExpression({
        elements: enumMembers,
        multiLine: false,
      }),
    ],
  });

  if (isNullable) {
    result.expression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: identifiers.z,
        name: identifiers.nullable,
      }),
      parameters: [result.expression],
    });
  }

  return result as Omit<ZodSchema, 'typeName'>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const neverTypeToZodSchema = (_props: {
  schema: SchemaWithType<'never'>;
}): Omit<ZodSchema, 'typeName'> => {
  const result: Partial<Omit<ZodSchema, 'typeName'>> = {};
  result.expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: identifiers.z,
      name: identifiers.never,
    }),
  });
  return result as Omit<ZodSchema, 'typeName'>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const nullTypeToZodSchema = (_props: {
  schema: SchemaWithType<'null'>;
}): Omit<ZodSchema, 'typeName'> => {
  const result: Partial<Omit<ZodSchema, 'typeName'>> = {};
  result.expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: identifiers.z,
      name: identifiers.null,
    }),
  });
  return result as Omit<ZodSchema, 'typeName'>;
};

const numberParameter = ({
  isBigInt,
  value,
}: {
  isBigInt: boolean;
  value: unknown;
}): ts.Expression | undefined => {
  const expression = compiler.valueToExpression({ value });

  if (
    isBigInt &&
    (typeof value === 'bigint' ||
      typeof value === 'number' ||
      typeof value === 'string' ||
      typeof value === 'boolean')
  ) {
    return compiler.callExpression({
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
}): Omit<ZodSchema, 'typeName'> => {
  const result: Partial<Omit<ZodSchema, 'typeName'>> = {};

  const isBigInt = schema.type === 'integer' && schema.format === 'int64';

  if (typeof schema.const === 'number') {
    // TODO: parser - handle bigint constants
    result.expression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: identifiers.z,
        name: identifiers.literal,
      }),
      parameters: [compiler.ots.number(schema.const)],
    });
    return result as Omit<ZodSchema, 'typeName'>;
  }

  result.expression = compiler.callExpression({
    functionName: isBigInt
      ? compiler.propertyAccessExpression({
          expression: compiler.propertyAccessExpression({
            expression: identifiers.z,
            name: identifiers.coerce,
          }),
          name: identifiers.bigint,
        })
      : compiler.propertyAccessExpression({
          expression: identifiers.z,
          name: identifiers.number,
        }),
  });

  if (!isBigInt && schema.type === 'integer') {
    result.expression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: identifiers.z,
        name: identifiers.int,
      }),
    });
  }

  const checks: Array<ts.Expression> = [];

  if (schema.exclusiveMinimum !== undefined) {
    checks.push(
      compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: identifiers.z,
          name: identifiers.gt,
        }),
        parameters: [
          numberParameter({ isBigInt, value: schema.exclusiveMinimum }),
        ],
      }),
    );
  } else if (schema.minimum !== undefined) {
    checks.push(
      compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: identifiers.z,
          name: identifiers.gte,
        }),
        parameters: [numberParameter({ isBigInt, value: schema.minimum })],
      }),
    );
  }

  if (schema.exclusiveMaximum !== undefined) {
    checks.push(
      compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: identifiers.z,
          name: identifiers.lt,
        }),
        parameters: [
          numberParameter({ isBigInt, value: schema.exclusiveMaximum }),
        ],
      }),
    );
  } else if (schema.maximum !== undefined) {
    checks.push(
      compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: identifiers.z,
          name: identifiers.lte,
        }),
        parameters: [numberParameter({ isBigInt, value: schema.maximum })],
      }),
    );
  }

  if (checks.length) {
    result.expression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: result.expression,
        name: identifiers.check,
      }),
      parameters: checks,
    });
  }

  return result as Omit<ZodSchema, 'typeName'>;
};

const objectTypeToZodSchema = ({
  plugin,
  schema,
  state,
}: {
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'object'>;
  state: State;
}): Omit<ZodSchema, 'typeName'> => {
  const result: Partial<Omit<ZodSchema, 'typeName'>> = {};

  // TODO: parser - handle constants
  const properties: Array<ts.PropertyAssignment | ts.GetAccessorDeclaration> =
    [];

  const required = schema.required ?? [];

  for (const name in schema.properties) {
    const property = schema.properties[name]!;
    const isRequired = required.includes(name);

    const propertySchema = schemaToZodSchema({
      optional: !isRequired,
      plugin,
      schema: property,
      state,
    });
    if (propertySchema.hasCircularReference) {
      result.hasCircularReference = true;
    }

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

    if (propertySchema.hasCircularReference) {
      properties.push(
        compiler.getAccessorDeclaration({
          name: propertyName,
          // @ts-expect-error
          returnType: propertySchema.typeName
            ? compiler.propertyAccessExpression({
                expression: identifiers.z,
                name: propertySchema.typeName,
              })
            : undefined,
          statements: [
            compiler.returnStatement({
              expression: propertySchema.expression,
            }),
          ],
        }),
      );
    } else {
      properties.push(
        compiler.propertyAssignment({
          initializer: propertySchema.expression,
          name: propertyName,
        }),
      );
    }
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
    });
    result.expression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: identifiers.z,
        name: identifiers.record,
      }),
      parameters: [
        compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: identifiers.z,
            name: identifiers.string,
          }),
          parameters: [],
        }),
        zodSchema.expression,
      ],
    });
    if (zodSchema.hasCircularReference) {
      result.hasCircularReference = true;
    }
    return result as Omit<ZodSchema, 'typeName'>;
  }

  result.expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: identifiers.z,
      name: identifiers.object,
    }),
    parameters: [ts.factory.createObjectLiteralExpression(properties, true)],
  });

  return result as Omit<ZodSchema, 'typeName'>;
};

const stringTypeToZodSchema = ({
  plugin,
  schema,
}: {
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'string'>;
}): Omit<ZodSchema, 'typeName'> => {
  const result: Partial<Omit<ZodSchema, 'typeName'>> = {};

  if (typeof schema.const === 'string') {
    result.expression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: identifiers.z,
        name: identifiers.literal,
      }),
      parameters: [compiler.ots.string(schema.const)],
    });
    return result as Omit<ZodSchema, 'typeName'>;
  }

  result.expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: identifiers.z,
      name: identifiers.string,
    }),
  });

  if (schema.format) {
    switch (schema.format) {
      case 'date':
        result.expression = compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: compiler.propertyAccessExpression({
              expression: identifiers.z,
              name: identifiers.iso,
            }),
            name: identifiers.date,
          }),
        });
        break;
      case 'date-time':
        result.expression = compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: compiler.propertyAccessExpression({
              expression: identifiers.z,
              name: identifiers.iso,
            }),
            name: identifiers.datetime,
          }),
          parameters: plugin.config.dates.offset
            ? [
                compiler.objectExpression({
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
        result.expression = compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: identifiers.z,
            name: identifiers.email,
          }),
        });
        break;
      case 'ipv4':
        result.expression = compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: identifiers.z,
            name: identifiers.ipv4,
          }),
        });
        break;
      case 'ipv6':
        result.expression = compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: identifiers.z,
            name: identifiers.ipv6,
          }),
        });
        break;
      case 'time':
        result.expression = compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: compiler.propertyAccessExpression({
              expression: identifiers.z,
              name: identifiers.iso,
            }),
            name: identifiers.time,
          }),
        });
        break;
      case 'uri':
        result.expression = compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: identifiers.z,
            name: identifiers.url,
          }),
        });
        break;
      case 'uuid':
        result.expression = compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: identifiers.z,
            name: identifiers.uuid,
          }),
        });
        break;
    }
  }

  const checks: Array<ts.Expression> = [];

  if (schema.minLength === schema.maxLength && schema.minLength !== undefined) {
    checks.push(
      compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: identifiers.z,
          name: identifiers.length,
        }),
        parameters: [compiler.valueToExpression({ value: schema.minLength })],
      }),
    );
  } else {
    if (schema.minLength !== undefined) {
      checks.push(
        compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: identifiers.z,
            name: identifiers.minLength,
          }),
          parameters: [compiler.valueToExpression({ value: schema.minLength })],
        }),
      );
    }

    if (schema.maxLength !== undefined) {
      checks.push(
        compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: identifiers.z,
            name: identifiers.maxLength,
          }),
          parameters: [compiler.valueToExpression({ value: schema.maxLength })],
        }),
      );
    }
  }

  if (schema.pattern) {
    checks.push(
      compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: identifiers.z,
          name: identifiers.regex,
        }),
        parameters: [
          compiler.regularExpressionLiteral({ text: schema.pattern }),
        ],
      }),
    );
  }

  if (checks.length) {
    result.expression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: result.expression,
        name: identifiers.check,
      }),
      parameters: checks,
    });
  }

  return result as Omit<ZodSchema, 'typeName'>;
};

const tupleTypeToZodSchema = ({
  plugin,
  schema,
  state,
}: {
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'tuple'>;
  state: State;
}): Omit<ZodSchema, 'typeName'> => {
  const result: Partial<Omit<ZodSchema, 'typeName'>> = {};

  if (schema.const && Array.isArray(schema.const)) {
    const tupleElements = schema.const.map((value) =>
      compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: identifiers.z,
          name: identifiers.literal,
        }),
        parameters: [compiler.valueToExpression({ value })],
      }),
    );
    result.expression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: identifiers.z,
        name: identifiers.tuple,
      }),
      parameters: [
        compiler.arrayLiteralExpression({
          elements: tupleElements,
        }),
      ],
    });
    return result as Omit<ZodSchema, 'typeName'>;
  }

  const tupleElements: Array<ts.Expression> = [];

  for (const item of schema.items ?? []) {
    const itemSchema = schemaToZodSchema({
      plugin,
      schema: item,
      state,
    });
    tupleElements.push(itemSchema.expression);

    if (itemSchema.hasCircularReference) {
      result.hasCircularReference = true;
    }
  }

  result.expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: identifiers.z,
      name: identifiers.tuple,
    }),
    parameters: [
      compiler.arrayLiteralExpression({
        elements: tupleElements,
      }),
    ],
  });

  return result as Omit<ZodSchema, 'typeName'>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const undefinedTypeToZodSchema = (_props: {
  schema: SchemaWithType<'undefined'>;
}): Omit<ZodSchema, 'typeName'> => {
  const result: Partial<Omit<ZodSchema, 'typeName'>> = {};
  result.expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: identifiers.z,
      name: identifiers.undefined,
    }),
  });
  return result as Omit<ZodSchema, 'typeName'>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const unknownTypeToZodSchema = (_props: {
  schema: SchemaWithType<'unknown'>;
}): Omit<ZodSchema, 'typeName'> => {
  const result: Partial<Omit<ZodSchema, 'typeName'>> = {};
  result.expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: identifiers.z,
      name: identifiers.unknown,
    }),
  });
  return result as Omit<ZodSchema, 'typeName'>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const voidTypeToZodSchema = (_props: {
  schema: SchemaWithType<'void'>;
}): Omit<ZodSchema, 'typeName'> => {
  const result: Partial<Omit<ZodSchema, 'typeName'>> = {};
  result.expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: identifiers.z,
      name: identifiers.void,
    }),
  });
  return result as Omit<ZodSchema, 'typeName'>;
};

const schemaTypeToZodSchema = ({
  plugin,
  schema,
  state,
}: {
  plugin: ZodPlugin['Instance'];
  schema: IR.SchemaObject;
  state: State;
}): Omit<ZodSchema, 'typeName'> => {
  switch (schema.type as Required<IR.SchemaObject>['type']) {
    case 'array':
      return arrayTypeToZodSchema({
        plugin,
        schema: schema as SchemaWithType<'array'>,
        state,
      });
    case 'boolean':
      return booleanTypeToZodSchema({
        schema: schema as SchemaWithType<'boolean'>,
      });
    case 'enum':
      return enumTypeToZodSchema({
        schema: schema as SchemaWithType<'enum'>,
      });
    case 'integer':
    case 'number':
      return numberTypeToZodSchema({
        schema: schema as SchemaWithType<'integer' | 'number'>,
      });
    case 'never':
      return neverTypeToZodSchema({
        schema: schema as SchemaWithType<'never'>,
      });
    case 'null':
      return nullTypeToZodSchema({
        schema: schema as SchemaWithType<'null'>,
      });
    case 'object':
      return objectTypeToZodSchema({
        plugin,
        schema: schema as SchemaWithType<'object'>,
        state,
      });
    case 'string':
      return stringTypeToZodSchema({
        plugin,
        schema: schema as SchemaWithType<'string'>,
      });
    case 'tuple':
      return tupleTypeToZodSchema({
        plugin,
        schema: schema as SchemaWithType<'tuple'>,
        state,
      });
    case 'undefined':
      return undefinedTypeToZodSchema({
        schema: schema as SchemaWithType<'undefined'>,
      });
    case 'unknown':
      return unknownTypeToZodSchema({
        schema: schema as SchemaWithType<'unknown'>,
      });
    case 'void':
      return voidTypeToZodSchema({
        schema: schema as SchemaWithType<'void'>,
      });
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
    const isSelfReference = state.currentReferenceTracker.includes(schema.$ref);
    state.circularReferenceTracker.push(schema.$ref);
    state.currentReferenceTracker.push(schema.$ref);

    const id = plugin.api.getId({ type: 'ref', value: schema.$ref });

    if (isCircularReference) {
      const expression = file.addNodeReference(id, {
        factory: (text) => compiler.identifier({ text }),
      });
      if (isSelfReference) {
        zodSchema.expression = compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: identifiers.z,
            name: identifiers.lazy,
          }),
          parameters: [
            compiler.arrowFunction({
              returnType: compiler.keywordTypeNode({ keyword: 'any' }),
              statements: [compiler.returnStatement({ expression })],
            }),
          ],
        });
      } else {
        zodSchema.expression = expression;
      }
      zodSchema.hasCircularReference = true;
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
        factory: (text) => compiler.identifier({ text }),
      });
      zodSchema.expression = expression;
    }

    state.circularReferenceTracker.pop();
    state.currentReferenceTracker.pop();
  } else if (schema.type) {
    const zSchema = schemaTypeToZodSchema({ plugin, schema, state });
    zodSchema.expression = zSchema.expression;
    zodSchema.hasCircularReference = zSchema.hasCircularReference;

    if (plugin.config.metadata && schema.description) {
      zodSchema.expression = compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: zodSchema.expression,
          name: identifiers.register,
        }),
        parameters: [
          compiler.propertyAccessExpression({
            expression: identifiers.z,
            name: identifiers.globalRegistry,
          }),
          compiler.objectExpression({
            obj: [
              {
                key: 'description',
                value: compiler.stringLiteral({ text: schema.description }),
              },
            ],
          }),
        ],
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
          zodSchema.expression = compiler.callExpression({
            functionName: compiler.propertyAccessExpression({
              expression: identifiers.z,
              name: identifiers.intersection,
            }),
            parameters: itemTypes,
          });
        } else {
          zodSchema.expression = itemTypes[0];
          itemTypes.slice(1).forEach((item) => {
            zodSchema.expression = compiler.callExpression({
              functionName: compiler.propertyAccessExpression({
                expression: identifiers.z,
                name: identifiers.intersection,
              }),
              parameters: [zodSchema.expression, item],
            });
          });
        }
      } else {
        zodSchema.expression = compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: identifiers.z,
            name: identifiers.union,
          }),
          parameters: [
            compiler.arrayLiteralExpression({
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
  }

  if (zodSchema.expression) {
    if (schema.accessScope === 'read') {
      zodSchema.expression = compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: identifiers.z,
          name: identifiers.readonly,
        }),
        parameters: [zodSchema.expression],
      });
    }

    if (optional) {
      zodSchema.expression = compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: identifiers.z,
          name: identifiers.optional,
        }),
        parameters: [zodSchema.expression],
      });
      zodSchema.typeName = identifiers.ZodMiniOptional;
    }

    if (schema.default !== undefined) {
      const isBigInt = schema.type === 'integer' && schema.format === 'int64';
      const callParameter = numberParameter({
        isBigInt,
        value: schema.default,
      });
      if (callParameter) {
        zodSchema.expression = compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: identifiers.z,
            name: identifiers._default,
          }),
          parameters: [zodSchema.expression, callParameter],
        });
      }
    }
  }

  return zodSchema as ZodSchema;
};

const handleComponent = ({
  id,
  plugin,
  schema,
  state: _state,
}: {
  id: string;
  plugin: ZodPlugin['Instance'];
  schema: IR.SchemaObject;
  state?: Omit<State, 'currentReferenceTracker'>;
}): void => {
  const state: State = {
    circularReferenceTracker: [id],
    hasCircularReference: false,
    ..._state,
    currentReferenceTracker: [id],
  };

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

export const handlerMini: ZodPlugin['Handler'] = ({ plugin }) => {
  const file = plugin.createFile({
    case: plugin.config.case,
    id: zodId,
    path: plugin.output,
  });

  file.import({
    alias: identifiers.z.text,
    module: getZodModule({ plugin }),
    name: '*',
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

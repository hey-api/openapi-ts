import ts from 'typescript';

import { deduplicateSchema } from '../../../ir/schema';
import type { IR } from '../../../ir/types';
import { buildName } from '../../../openApi/shared/utils/name';
import { tsc } from '../../../tsc';
import { refToName } from '../../../utils/ref';
import { numberRegExp } from '../../../utils/regexp';
import { identifiers } from '../constants';
import { exportZodSchema } from '../export';
import { getZodModule } from '../shared/module';
import { operationToZodSchema } from '../shared/operation';
import type { SchemaWithType, State, ZodSchema } from '../shared/types';
import { webhookToZodSchema } from '../shared/webhook';
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

  const zSymbol = plugin.referenceSymbol(
    plugin.api.getSelector('import', 'zod'),
  );

  const functionName = tsc.propertyAccessExpression({
    expression: zSymbol.placeholder,
    name: identifiers.array,
  });

  if (!schema.items) {
    result.expression = tsc.callExpression({
      functionName,
      parameters: [
        unknownTypeToZodSchema({
          plugin,
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
      result.expression = tsc.callExpression({
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

      result.expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: zSymbol.placeholder,
          name: identifiers.array,
        }),
        parameters: [
          tsc.callExpression({
            functionName: tsc.propertyAccessExpression({
              expression: zSymbol.placeholder,
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
    result.expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: result.expression,
        name: identifiers.length,
      }),
      parameters: [tsc.valueToExpression({ value: schema.minItems })],
    });
  } else {
    if (schema.minItems !== undefined) {
      result.expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: result.expression,
          name: identifiers.min,
        }),
        parameters: [tsc.valueToExpression({ value: schema.minItems })],
      });
    }

    if (schema.maxItems !== undefined) {
      result.expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: result.expression,
          name: identifiers.max,
        }),
        parameters: [tsc.valueToExpression({ value: schema.maxItems })],
      });
    }
  }

  return result as Omit<ZodSchema, 'typeName'>;
};

const booleanTypeToZodSchema = ({
  plugin,
  schema,
}: {
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'boolean'>;
}): Omit<ZodSchema, 'typeName'> => {
  const result: Partial<Omit<ZodSchema, 'typeName'>> = {};

  const zSymbol = plugin.referenceSymbol(
    plugin.api.getSelector('import', 'zod'),
  );

  if (typeof schema.const === 'boolean') {
    result.expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: zSymbol.placeholder,
        name: identifiers.literal,
      }),
      parameters: [tsc.ots.boolean(schema.const)],
    });
    return result as Omit<ZodSchema, 'typeName'>;
  }

  result.expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: zSymbol.placeholder,
      name: identifiers.boolean,
    }),
  });
  return result as Omit<ZodSchema, 'typeName'>;
};

const enumTypeToZodSchema = ({
  plugin,
  schema,
}: {
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'enum'>;
}): Omit<ZodSchema, 'typeName'> => {
  const result: Partial<Omit<ZodSchema, 'typeName'>> = {};

  const zSymbol = plugin.referenceSymbol(
    plugin.api.getSelector('import', 'zod'),
  );

  const enumMembers: Array<ts.LiteralExpression> = [];
  const literalMembers: Array<ts.CallExpression> = [];

  let isNullable = false;
  let allStrings = true;

  for (const item of schema.items ?? []) {
    // Zod supports string, number, and boolean enums
    if (item.type === 'string' && typeof item.const === 'string') {
      const stringLiteral = tsc.stringLiteral({
        text: item.const,
      });
      enumMembers.push(stringLiteral);
      literalMembers.push(
        tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: zSymbol.placeholder,
            name: identifiers.literal,
          }),
          parameters: [stringLiteral],
        }),
      );
    } else if (
      (item.type === 'number' || item.type === 'integer') &&
      typeof item.const === 'number'
    ) {
      allStrings = false;
      const numberLiteral = tsc.ots.number(item.const);
      literalMembers.push(
        tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: zSymbol.placeholder,
            name: identifiers.literal,
          }),
          parameters: [numberLiteral],
        }),
      );
    } else if (item.type === 'boolean' && typeof item.const === 'boolean') {
      allStrings = false;
      const booleanLiteral = tsc.ots.boolean(item.const);
      literalMembers.push(
        tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: zSymbol.placeholder,
            name: identifiers.literal,
          }),
          parameters: [booleanLiteral],
        }),
      );
    } else if (item.type === 'null' || item.const === null) {
      isNullable = true;
    }
  }

  if (!literalMembers.length) {
    return unknownTypeToZodSchema({
      plugin,
      schema: {
        type: 'unknown',
      },
    });
  }

  // Use z.enum() for pure string enums, z.union() for mixed or non-string types
  if (allStrings && enumMembers.length > 0) {
    result.expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: zSymbol.placeholder,
        name: identifiers.enum,
      }),
      parameters: [
        tsc.arrayLiteralExpression({
          elements: enumMembers,
          multiLine: false,
        }),
      ],
    });
  } else if (literalMembers.length === 1) {
    // For single-member unions, use the member directly instead of wrapping in z.union()
    result.expression = literalMembers[0];
  } else {
    result.expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: zSymbol.placeholder,
        name: identifiers.union,
      }),
      parameters: [
        tsc.arrayLiteralExpression({
          elements: literalMembers,
          multiLine: literalMembers.length > 3,
        }),
      ],
    });
  }

  if (isNullable) {
    result.expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: zSymbol.placeholder,
        name: identifiers.nullable,
      }),
      parameters: [result.expression],
    });
  }

  return result as Omit<ZodSchema, 'typeName'>;
};

const neverTypeToZodSchema = ({
  plugin,
}: {
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'never'>;
}): Omit<ZodSchema, 'typeName'> => {
  const result: Partial<Omit<ZodSchema, 'typeName'>> = {};
  const zSymbol = plugin.referenceSymbol(
    plugin.api.getSelector('import', 'zod'),
  );
  result.expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: zSymbol.placeholder,
      name: identifiers.never,
    }),
  });
  return result as Omit<ZodSchema, 'typeName'>;
};

const nullTypeToZodSchema = ({
  plugin,
}: {
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'null'>;
}): Omit<ZodSchema, 'typeName'> => {
  const result: Partial<Omit<ZodSchema, 'typeName'>> = {};
  const zSymbol = plugin.referenceSymbol(
    plugin.api.getSelector('import', 'zod'),
  );
  result.expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: zSymbol.placeholder,
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
  plugin,
  schema,
}: {
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'integer' | 'number'>;
}): Omit<ZodSchema, 'typeName'> => {
  const result: Partial<Omit<ZodSchema, 'typeName'>> = {};

  const isBigInt = schema.type === 'integer' && schema.format === 'int64';

  const zSymbol = plugin.referenceSymbol(
    plugin.api.getSelector('import', 'zod'),
  );

  if (typeof schema.const === 'number') {
    // TODO: parser - handle bigint constants
    result.expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: zSymbol.placeholder,
        name: identifiers.literal,
      }),
      parameters: [tsc.ots.number(schema.const)],
    });
    return result as Omit<ZodSchema, 'typeName'>;
  }

  result.expression = tsc.callExpression({
    functionName: isBigInt
      ? tsc.propertyAccessExpression({
          expression: tsc.propertyAccessExpression({
            expression: zSymbol.placeholder,
            name: identifiers.coerce,
          }),
          name: identifiers.bigint,
        })
      : tsc.propertyAccessExpression({
          expression: zSymbol.placeholder,
          name: identifiers.number,
        }),
  });

  if (!isBigInt && schema.type === 'integer') {
    result.expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: zSymbol.placeholder,
        name: identifiers.int,
      }),
    });
  }

  if (schema.exclusiveMinimum !== undefined) {
    result.expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: result.expression,
        name: identifiers.gt,
      }),
      parameters: [
        numberParameter({ isBigInt, value: schema.exclusiveMinimum }),
      ],
    });
  } else if (schema.minimum !== undefined) {
    result.expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: result.expression,
        name: identifiers.gte,
      }),
      parameters: [numberParameter({ isBigInt, value: schema.minimum })],
    });
  }

  if (schema.exclusiveMaximum !== undefined) {
    result.expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: result.expression,
        name: identifiers.lt,
      }),
      parameters: [
        numberParameter({ isBigInt, value: schema.exclusiveMaximum }),
      ],
    });
  } else if (schema.maximum !== undefined) {
    result.expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: result.expression,
        name: identifiers.lte,
      }),
      parameters: [numberParameter({ isBigInt, value: schema.maximum })],
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

  const zSymbol = plugin.referenceSymbol(
    plugin.api.getSelector('import', 'zod'),
  );

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
        tsc.getAccessorDeclaration({
          name: propertyName,
          // @ts-expect-error
          returnType: propertySchema.typeName
            ? tsc.propertyAccessExpression({
                expression: zSymbol.placeholder,
                name: propertySchema.typeName,
              })
            : undefined,
          statements: [
            tsc.returnStatement({
              expression: propertySchema.expression,
            }),
          ],
        }),
      );
    } else {
      properties.push(
        tsc.propertyAssignment({
          initializer: propertySchema.expression,
          name: propertyName,
        }),
      );
    }
  }

  if (
    schema.additionalProperties &&
    (!schema.properties || !Object.keys(schema.properties).length)
  ) {
    const zodSchema = schemaToZodSchema({
      plugin,
      schema: schema.additionalProperties,
      state,
    });
    result.expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: zSymbol.placeholder,
        name: identifiers.record,
      }),
      parameters: [
        tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: zSymbol.placeholder,
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

    // Return with typeName for circular references
    if (result.hasCircularReference) {
      return {
        ...result,
        typeName: 'ZodType',
      } as ZodSchema;
    }

    return result as Omit<ZodSchema, 'typeName'>;
  }

  result.expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: zSymbol.placeholder,
      name: identifiers.object,
    }),
    parameters: [ts.factory.createObjectLiteralExpression(properties, true)],
  });

  // Return with typeName for circular references (AnyZodObject doesn't exist in Zod v4, use ZodType)
  if (result.hasCircularReference) {
    return {
      ...result,
      typeName: 'ZodType',
    } as ZodSchema;
  }

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

  const zSymbol = plugin.referenceSymbol(
    plugin.api.getSelector('import', 'zod'),
  );

  if (typeof schema.const === 'string') {
    result.expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: zSymbol.placeholder,
        name: identifiers.literal,
      }),
      parameters: [tsc.ots.string(schema.const)],
    });
    return result as Omit<ZodSchema, 'typeName'>;
  }

  result.expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: zSymbol.placeholder,
      name: identifiers.string,
    }),
  });

  const dateTimeOptions: { key: string; value: boolean }[] = [];

  if (plugin.config.dates.offset) {
    dateTimeOptions.push({ key: 'offset', value: true });
  }
  if (plugin.config.dates.local) {
    dateTimeOptions.push({ key: 'local', value: true });
  }

  if (schema.format) {
    switch (schema.format) {
      case 'date':
        result.expression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: tsc.propertyAccessExpression({
              expression: zSymbol.placeholder,
              name: identifiers.iso,
            }),
            name: identifiers.date,
          }),
        });
        break;
      case 'date-time':
        result.expression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: tsc.propertyAccessExpression({
              expression: zSymbol.placeholder,
              name: identifiers.iso,
            }),
            name: identifiers.datetime,
          }),
          parameters:
            dateTimeOptions.length > 0
              ? [
                  tsc.objectExpression({
                    obj: dateTimeOptions,
                  }),
                ]
              : [],
        });
        break;
      case 'email':
        result.expression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: zSymbol.placeholder,
            name: identifiers.email,
          }),
        });
        break;
      case 'ipv4':
        result.expression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: zSymbol.placeholder,
            name: identifiers.ipv4,
          }),
        });
        break;
      case 'ipv6':
        result.expression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: zSymbol.placeholder,
            name: identifiers.ipv6,
          }),
        });
        break;
      case 'time':
        result.expression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: tsc.propertyAccessExpression({
              expression: zSymbol.placeholder,
              name: identifiers.iso,
            }),
            name: identifiers.time,
          }),
        });
        break;
      case 'uri':
        result.expression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: zSymbol.placeholder,
            name: identifiers.url,
          }),
        });
        break;
      case 'uuid':
        result.expression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: zSymbol.placeholder,
            name: identifiers.uuid,
          }),
        });
        break;
    }
  }

  if (schema.minLength === schema.maxLength && schema.minLength !== undefined) {
    result.expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: result.expression,
        name: identifiers.length,
      }),
      parameters: [tsc.valueToExpression({ value: schema.minLength })],
    });
  } else {
    if (schema.minLength !== undefined) {
      result.expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: result.expression,
          name: identifiers.min,
        }),
        parameters: [tsc.valueToExpression({ value: schema.minLength })],
      });
    }

    if (schema.maxLength !== undefined) {
      result.expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: result.expression,
          name: identifiers.max,
        }),
        parameters: [tsc.valueToExpression({ value: schema.maxLength })],
      });
    }
  }

  if (schema.pattern) {
    result.expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: result.expression,
        name: identifiers.regex,
      }),
      parameters: [tsc.regularExpressionLiteral({ text: schema.pattern })],
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

  const zSymbol = plugin.referenceSymbol(
    plugin.api.getSelector('import', 'zod'),
  );

  if (schema.const && Array.isArray(schema.const)) {
    const tupleElements = schema.const.map((value) =>
      tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: zSymbol.placeholder,
          name: identifiers.literal,
        }),
        parameters: [tsc.valueToExpression({ value })],
      }),
    );
    result.expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: zSymbol.placeholder,
        name: identifiers.tuple,
      }),
      parameters: [
        tsc.arrayLiteralExpression({
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

  result.expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: zSymbol.placeholder,
      name: identifiers.tuple,
    }),
    parameters: [
      tsc.arrayLiteralExpression({
        elements: tupleElements,
      }),
    ],
  });

  return result as Omit<ZodSchema, 'typeName'>;
};

const undefinedTypeToZodSchema = ({
  plugin,
}: {
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'undefined'>;
}): Omit<ZodSchema, 'typeName'> => {
  const result: Partial<Omit<ZodSchema, 'typeName'>> = {};
  const zSymbol = plugin.referenceSymbol(
    plugin.api.getSelector('import', 'zod'),
  );
  result.expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: zSymbol.placeholder,
      name: identifiers.undefined,
    }),
  });
  return result as Omit<ZodSchema, 'typeName'>;
};

const unknownTypeToZodSchema = ({
  plugin,
}: {
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'unknown'>;
}): Omit<ZodSchema, 'typeName'> => {
  const result: Partial<Omit<ZodSchema, 'typeName'>> = {};
  const zSymbol = plugin.referenceSymbol(
    plugin.api.getSelector('import', 'zod'),
  );
  result.expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: zSymbol.placeholder,
      name: identifiers.unknown,
    }),
  });
  return result as Omit<ZodSchema, 'typeName'>;
};

const voidTypeToZodSchema = ({
  plugin,
}: {
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'void'>;
}): Omit<ZodSchema, 'typeName'> => {
  const result: Partial<Omit<ZodSchema, 'typeName'>> = {};
  const zSymbol = plugin.referenceSymbol(
    plugin.api.getSelector('import', 'zod'),
  );
  result.expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: zSymbol.placeholder,
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
        plugin,
        schema: schema as SchemaWithType<'boolean'>,
      });
    case 'enum':
      return enumTypeToZodSchema({
        plugin,
        schema: schema as SchemaWithType<'enum'>,
      });
    case 'integer':
    case 'number':
      return numberTypeToZodSchema({
        plugin,
        schema: schema as SchemaWithType<'integer' | 'number'>,
      });
    case 'never':
      return neverTypeToZodSchema({
        plugin,
        schema: schema as SchemaWithType<'never'>,
      });
    case 'null':
      return nullTypeToZodSchema({
        plugin,
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
        plugin,
        schema: schema as SchemaWithType<'undefined'>,
      });
    case 'unknown':
      return unknownTypeToZodSchema({
        plugin,
        schema: schema as SchemaWithType<'unknown'>,
      });
    case 'void':
      return voidTypeToZodSchema({
        plugin,
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
  let zodSchema: Partial<ZodSchema> = {};

  const zSymbol = plugin.referenceSymbol(
    plugin.api.getSelector('import', 'zod'),
  );

  if (schema.$ref) {
    const isCircularReference = state.circularReferenceTracker.includes(
      schema.$ref,
    );
    const isSelfReference = state.currentReferenceTracker.includes(schema.$ref);
    state.circularReferenceTracker.push(schema.$ref);
    state.currentReferenceTracker.push(schema.$ref);

    const selector = plugin.api.getSelector('ref', schema.$ref);
    let symbol = plugin.getSymbol(selector);

    if (isCircularReference) {
      if (!symbol) {
        symbol = plugin.referenceSymbol(selector);
      }

      if (isSelfReference) {
        zodSchema.expression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: zSymbol.placeholder,
            name: identifiers.lazy,
          }),
          parameters: [
            tsc.arrowFunction({
              returnType: tsc.keywordTypeNode({ keyword: 'any' }),
              statements: [
                tsc.returnStatement({
                  expression: tsc.identifier({ text: symbol.placeholder }),
                }),
              ],
            }),
          ],
        });
      } else {
        zodSchema.expression = tsc.identifier({ text: symbol.placeholder });
      }
      zodSchema.hasCircularReference = schema.circular;
    } else {
      if (!symbol) {
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
      } else {
        zodSchema.hasCircularReference = schema.circular;
      }

      const refSymbol = plugin.referenceSymbol(selector);
      zodSchema.expression = tsc.identifier({ text: refSymbol.placeholder });
    }

    state.circularReferenceTracker.pop();
    state.currentReferenceTracker.pop();
  } else if (schema.type) {
    const zSchema = schemaTypeToZodSchema({ plugin, schema, state });
    zodSchema.expression = zSchema.expression;
    zodSchema.hasCircularReference = zSchema.hasCircularReference;

    if (plugin.config.metadata && schema.description) {
      zodSchema.expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: zodSchema.expression,
          name: identifiers.register,
        }),
        parameters: [
          tsc.propertyAccessExpression({
            expression: zSymbol.placeholder,
            name: identifiers.globalRegistry,
          }),
          tsc.objectExpression({
            obj: [
              {
                key: 'description',
                value: tsc.stringLiteral({ text: schema.description }),
              },
            ],
          }),
        ],
      });
    }
  } else if (schema.items) {
    schema = deduplicateSchema({ schema });

    if (schema.items) {
      const itemSchemas = schema.items.map((item) =>
        schemaToZodSchema({
          plugin,
          schema: item,
          state,
        }),
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
              expression: zSymbol.placeholder,
              name: identifiers.intersection,
            }),
            parameters: itemSchemas.map((schema) => schema.expression),
          });
        } else {
          zodSchema.expression = itemSchemas[0]!.expression;
          itemSchemas.slice(1).forEach((schema) => {
            zodSchema.expression = tsc.callExpression({
              functionName: tsc.propertyAccessExpression({
                expression: zodSchema.expression!,
                name: identifiers.and,
              }),
              parameters: [
                schema.hasCircularReference
                  ? tsc.callExpression({
                      functionName: tsc.propertyAccessExpression({
                        expression: zSymbol.placeholder,
                        name: identifiers.lazy,
                      }),
                      parameters: [
                        tsc.arrowFunction({
                          statements: [
                            tsc.returnStatement({
                              expression: schema.expression,
                            }),
                          ],
                        }),
                      ],
                    })
                  : schema.expression,
              ],
            });
          });
        }
      } else {
        zodSchema.expression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: zSymbol.placeholder,
            name: identifiers.union,
          }),
          parameters: [
            tsc.arrayLiteralExpression({
              elements: itemSchemas.map((schema) => schema.expression),
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
          expression: zSymbol.placeholder,
          name: identifiers.optional,
        }),
        parameters: [zodSchema.expression],
      });
      zodSchema.typeName = identifiers.ZodOptional;
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

  const selector = plugin.api.getSelector('ref', id);
  let symbol = plugin.getSymbol(selector);
  if (symbol && !plugin.getSymbolValue(symbol)) return;

  const zodSchema = schemaToZodSchema({ plugin, schema, state });
  const baseName = refToName(id);
  symbol = plugin.registerSymbol({
    exported: true,
    name: buildName({
      config: plugin.config.definitions,
      name: baseName,
    }),
    selector,
  });
  const typeInferSymbol = plugin.config.definitions.types.infer.enabled
    ? plugin.registerSymbol({
        exported: true,
        meta: {
          kind: 'type',
        },
        name: buildName({
          config: plugin.config.definitions.types.infer,
          name: baseName,
        }),
        selector: plugin.api.getSelector('type-infer-ref', id),
      })
    : undefined;
  exportZodSchema({
    plugin,
    schema,
    symbol,
    typeInferSymbol,
    zodSchema,
  });
};

export const handlerV4: ZodPlugin['Handler'] = ({ plugin }) => {
  plugin.registerSymbol({
    external: getZodModule({ plugin }),
    name: 'z',
    selector: plugin.api.getSelector('import', 'zod'),
  });

  plugin.forEach(
    'operation',
    'parameter',
    'requestBody',
    'schema',
    'webhook',
    (event) => {
      switch (event.type) {
        case 'operation':
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
          break;
        case 'parameter':
          handleComponent({
            id: event.$ref,
            plugin,
            schema: event.parameter.schema,
          });
          break;
        case 'requestBody':
          handleComponent({
            id: event.$ref,
            plugin,
            schema: event.requestBody.schema,
          });
          break;
        case 'schema':
          handleComponent({
            id: event.$ref,
            plugin,
            schema: event.schema,
          });
          break;
        case 'webhook':
          webhookToZodSchema({
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
          break;
      }
    },
  );
};

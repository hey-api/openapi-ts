import ts from 'typescript';

import { TypeScriptRenderer } from '../../../generate/renderer';
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
}): ts.CallExpression => {
  const zSymbol = plugin.gen.selectSymbolFirstOrThrow(
    plugin.api.getSelector('import', 'zod'),
  );

  const functionName = tsc.propertyAccessExpression({
    expression: zSymbol.placeholder,
    name: identifiers.array,
  });

  let arrayExpression: ts.CallExpression | undefined;

  if (!schema.items) {
    arrayExpression = tsc.callExpression({
      functionName,
      parameters: [
        unknownTypeToZodSchema({
          plugin,
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
  plugin,
  schema,
}: {
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'boolean'>;
}) => {
  const zSymbol = plugin.gen.selectSymbolFirstOrThrow(
    plugin.api.getSelector('import', 'zod'),
  );

  if (typeof schema.const === 'boolean') {
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: zSymbol.placeholder,
        name: identifiers.literal,
      }),
      parameters: [tsc.ots.boolean(schema.const)],
    });
    return expression;
  }

  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: zSymbol.placeholder,
      name: identifiers.boolean,
    }),
  });
  return expression;
};

const enumTypeToZodSchema = ({
  plugin,
  schema,
}: {
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'enum'>;
}): ts.CallExpression => {
  const zSymbol = plugin.gen.selectSymbolFirstOrThrow(
    plugin.api.getSelector('import', 'zod'),
  );

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
      plugin,
      schema: {
        type: 'unknown',
      },
    });
  }

  let enumExpression = tsc.callExpression({
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

const neverTypeToZodSchema = ({
  plugin,
}: {
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'never'>;
}) => {
  const zSymbol = plugin.gen.selectSymbolFirstOrThrow(
    plugin.api.getSelector('import', 'zod'),
  );
  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: zSymbol.placeholder,
      name: identifiers.never,
    }),
  });
  return expression;
};

const nullTypeToZodSchema = ({
  plugin,
}: {
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'null'>;
}) => {
  const zSymbol = plugin.gen.selectSymbolFirstOrThrow(
    plugin.api.getSelector('import', 'zod'),
  );
  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: zSymbol.placeholder,
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
  plugin,
  schema,
}: {
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'integer' | 'number'>;
}) => {
  const zSymbol = plugin.gen.selectSymbolFirstOrThrow(
    plugin.api.getSelector('import', 'zod'),
  );

  const isBigInt = schema.type === 'integer' && schema.format === 'int64';

  if (typeof schema.const === 'number') {
    // TODO: parser - handle bigint constants
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: zSymbol.placeholder,
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
  const zSymbol = plugin.gen.selectSymbolFirstOrThrow(
    plugin.api.getSelector('import', 'zod'),
  );

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
    (!schema.properties || !Object.keys(schema.properties).length)
  ) {
    const zodSchema = schemaToZodSchema({
      plugin,
      schema: schema.additionalProperties,
      state,
    }).expression;
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: zSymbol.placeholder,
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
      expression: zSymbol.placeholder,
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
  const zSymbol = plugin.gen.selectSymbolFirstOrThrow(
    plugin.api.getSelector('import', 'zod'),
  );

  if (typeof schema.const === 'string') {
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: zSymbol.placeholder,
        name: identifiers.literal,
      }),
      parameters: [tsc.ots.string(schema.const)],
    });
    return expression;
  }

  let stringExpression = tsc.callExpression({
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
  const zSymbol = plugin.gen.selectSymbolFirstOrThrow(
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
    const expression = tsc.callExpression({
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
      expression: zSymbol.placeholder,
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

const undefinedTypeToZodSchema = ({
  plugin,
}: {
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'undefined'>;
}) => {
  const zSymbol = plugin.gen.selectSymbolFirstOrThrow(
    plugin.api.getSelector('import', 'zod'),
  );
  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: zSymbol.placeholder,
      name: identifiers.undefined,
    }),
  });
  return expression;
};

const unknownTypeToZodSchema = ({
  plugin,
}: {
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'unknown'>;
}) => {
  const zSymbol = plugin.gen.selectSymbolFirstOrThrow(
    plugin.api.getSelector('import', 'zod'),
  );
  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: zSymbol.placeholder,
      name: identifiers.unknown,
    }),
  });
  return expression;
};

const voidTypeToZodSchema = ({
  plugin,
}: {
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'void'>;
}) => {
  const zSymbol = plugin.gen.selectSymbolFirstOrThrow(
    plugin.api.getSelector('import', 'zod'),
  );
  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: zSymbol.placeholder,
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
          plugin,
          schema: schema as SchemaWithType<'boolean'>,
        }),
      };
    case 'enum':
      return {
        expression: enumTypeToZodSchema({
          plugin,
          schema: schema as SchemaWithType<'enum'>,
        }),
      };
    case 'integer':
    case 'number':
      return {
        expression: numberTypeToZodSchema({
          plugin,
          schema: schema as SchemaWithType<'integer' | 'number'>,
        }),
      };
    case 'never':
      return {
        expression: neverTypeToZodSchema({
          plugin,
          schema: schema as SchemaWithType<'never'>,
        }),
      };
    case 'null':
      return {
        expression: nullTypeToZodSchema({
          plugin,
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
          plugin,
          schema: schema as SchemaWithType<'undefined'>,
        }),
      };
    case 'unknown':
      return {
        expression: unknownTypeToZodSchema({
          plugin,
          schema: schema as SchemaWithType<'unknown'>,
        }),
      };
    case 'void':
      return {
        expression: voidTypeToZodSchema({
          plugin,
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
  const f = plugin.gen.ensureFile(plugin.output);

  let zodSchema: Partial<ZodSchema> = {};

  const zSymbol = plugin.gen.selectSymbolFirstOrThrow(
    plugin.api.getSelector('import', 'zod'),
  );

  if (schema.$ref) {
    const isCircularReference = state.circularReferenceTracker.includes(
      schema.$ref,
    );
    state.circularReferenceTracker.push(schema.$ref);
    state.currentReferenceTracker.push(schema.$ref);

    const selector = plugin.api.getSelector('ref', schema.$ref);
    let symbol = plugin.gen.selectSymbolFirst(selector);

    if (isCircularReference) {
      if (!symbol) {
        symbol = f.ensureSymbol({ selector });
      }

      zodSchema.expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: zSymbol.placeholder,
          name: identifiers.lazy,
        }),
        parameters: [
          tsc.arrowFunction({
            statements: [
              tsc.returnStatement({
                expression: tsc.identifier({ text: symbol.placeholder }),
              }),
            ],
          }),
        ],
      });
      state.hasCircularReference = true;
    } else if (!symbol) {
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
      const symbol = plugin.gen.selectSymbolFirstOrThrow(selector);
      zodSchema.expression = tsc.identifier({ text: symbol.placeholder });
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
              expression: zSymbol.placeholder,
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
            expression: zSymbol.placeholder,
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

  const selector = plugin.api.getSelector('ref', id);
  let symbol = plugin.gen.selectSymbolFirst(selector);
  if (symbol && !symbol.headless) return;

  const zodSchema = schemaToZodSchema({ plugin, schema, state });
  const f = plugin.gen.ensureFile(plugin.output);
  const baseName = refToName(id);
  symbol = f.ensureSymbol({ selector });
  symbol = f.patchSymbol(symbol.id, {
    name: buildName({
      config: plugin.config.definitions,
      name: baseName,
    }),
  });
  const typeInferSymbol = plugin.config.definitions.types.infer.enabled
    ? f.addSymbol({
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

export const handlerV3: ZodPlugin['Handler'] = ({ plugin }) => {
  const f = plugin.gen.createFile(plugin.output, {
    extension: '.ts',
    path: '{{path}}.gen',
    renderer: new TypeScriptRenderer(),
  });

  const zSymbol = f.ensureSymbol({
    name: 'z',
    selector: plugin.api.getSelector('import', 'zod'),
  });
  f.addImport({
    aliases: {
      z: zSymbol.placeholder,
    },
    from: getZodModule({ plugin }),
    names: ['z'],
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

  if (plugin.config.exportFromIndex && f.hasContent()) {
    const index = plugin.gen.ensureFile('index');
    index.addExport({ from: f, namespaceImport: true });
  }
};

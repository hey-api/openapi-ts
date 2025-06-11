import ts from 'typescript';

import { compiler } from '../../compiler';
import { operationResponsesMap } from '../../ir/operation';
import { deduplicateSchema } from '../../ir/schema';
import type { IR } from '../../ir/types';
import { numberRegExp } from '../../utils/regexp';
import { operationIrRef } from '../shared/utils/ref';
import { createSchemaComment } from '../shared/utils/schema';
import type { Plugin } from '../types';
import type { Config } from './types';

interface SchemaWithType<T extends Required<IR.SchemaObject>['type']>
  extends Omit<IR.SchemaObject, 'type'> {
  type: Extract<Required<IR.SchemaObject>['type'], T>;
}

interface Result {
  circularReferenceTracker: Set<string>;
  hasCircularReference: boolean;
}

export const zodId = 'zod';

// frequently used identifiers
const andIdentifier = compiler.identifier({ text: 'and' });
const coerceIdentifier = compiler.identifier({ text: 'coerce' });
const defaultIdentifier = compiler.identifier({ text: 'default' });
const intersectionIdentifier = compiler.identifier({ text: 'intersection' });
const lazyIdentifier = compiler.identifier({ text: 'lazy' });
const lengthIdentifier = compiler.identifier({ text: 'length' });
const literalIdentifier = compiler.identifier({ text: 'literal' });
const maxIdentifier = compiler.identifier({ text: 'max' });
const minIdentifier = compiler.identifier({ text: 'min' });
const objectIdentifier = compiler.identifier({ text: 'object' });
const optionalIdentifier = compiler.identifier({ text: 'optional' });
const readonlyIdentifier = compiler.identifier({ text: 'readonly' });
const regexIdentifier = compiler.identifier({ text: 'regex' });
const unionIdentifier = compiler.identifier({ text: 'union' });
const zIdentifier = compiler.identifier({ text: 'z' });

const nameTransformer = (name: string) => `z-${name}`;

const arrayTypeToZodSchema = ({
  context,
  plugin,
  result,
  schema,
}: {
  context: IR.Context;
  plugin: Plugin.Instance<Config>;
  result: Result;
  schema: SchemaWithType<'array'>;
}): ts.CallExpression => {
  const functionName = compiler.propertyAccessExpression({
    expression: zIdentifier,
    name: compiler.identifier({ text: 'array' }),
  });

  let arrayExpression: ts.CallExpression | undefined;

  if (!schema.items) {
    arrayExpression = compiler.callExpression({
      functionName,
      parameters: [
        unknownTypeToZodSchema({
          context,
          schema: {
            type: 'unknown',
          },
        }),
      ],
    });
  } else {
    schema = deduplicateSchema({ schema });

    // at least one item is guaranteed
    const itemExpressions = schema.items!.map((item) =>
      schemaToZodSchema({
        context,
        plugin,
        result,
        schema: item,
      }),
    );

    if (itemExpressions.length === 1) {
      arrayExpression = compiler.callExpression({
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

      arrayExpression = compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: zIdentifier,
          name: compiler.identifier({ text: 'array' }),
        }),
        parameters: [
          compiler.callExpression({
            functionName: compiler.propertyAccessExpression({
              expression: zIdentifier,
              name: unionIdentifier,
            }),
            parameters: [
              compiler.arrayLiteralExpression({
                elements: itemExpressions,
              }),
            ],
          }),
        ],

        // compiler.callExpression({
        //   functionName: compiler.propertyAccessExpression({
        //     expression: zIdentifier,
        //     name: unionIdentifier,
        //   }),
        //   parameters: [
        //     compiler.arrayLiteralExpression({
        //       elements: itemExpressions,
        //     }),
        //   ],
      });
    }
  }

  if (schema.minItems === schema.maxItems && schema.minItems !== undefined) {
    arrayExpression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: arrayExpression,
        name: lengthIdentifier,
      }),
      parameters: [compiler.valueToExpression({ value: schema.minItems })],
    });
  } else {
    if (schema.minItems !== undefined) {
      arrayExpression = compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: arrayExpression,
          name: minIdentifier,
        }),
        parameters: [compiler.valueToExpression({ value: schema.minItems })],
      });
    }

    if (schema.maxItems !== undefined) {
      arrayExpression = compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: arrayExpression,
          name: maxIdentifier,
        }),
        parameters: [compiler.valueToExpression({ value: schema.maxItems })],
      });
    }
  }

  return arrayExpression;
};

const booleanTypeToZodSchema = ({
  schema,
}: {
  context: IR.Context;
  schema: SchemaWithType<'boolean'>;
}) => {
  if (typeof schema.const === 'boolean') {
    const expression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: zIdentifier,
        name: literalIdentifier,
      }),
      parameters: [compiler.ots.boolean(schema.const)],
    });
    return expression;
  }

  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: zIdentifier,
      name: compiler.identifier({ text: 'boolean' }),
    }),
  });
  return expression;
};

const enumTypeToZodSchema = ({
  context,
  schema,
}: {
  context: IR.Context;
  schema: SchemaWithType<'enum'>;
}): ts.CallExpression => {
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
      context,
      schema: {
        type: 'unknown',
      },
    });
  }

  let enumExpression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: zIdentifier,
      name: compiler.identifier({ text: 'enum' }),
    }),
    parameters: [
      compiler.arrayLiteralExpression({
        elements: enumMembers,
        multiLine: false,
      }),
    ],
  });

  if (isNullable) {
    enumExpression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: enumExpression,
        name: compiler.identifier({ text: 'nullable' }),
      }),
    });
  }

  return enumExpression;
};

const neverTypeToZodSchema = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  schema,
}: {
  context: IR.Context;
  schema: SchemaWithType<'never'>;
}) => {
  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: zIdentifier,
      name: compiler.identifier({ text: 'never' }),
    }),
  });
  return expression;
};

const nullTypeToZodSchema = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  schema,
}: {
  context: IR.Context;
  schema: SchemaWithType<'null'>;
}) => {
  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: zIdentifier,
      name: compiler.identifier({ text: 'null' }),
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
  context: IR.Context;
  schema: SchemaWithType<'integer' | 'number'>;
}) => {
  const isBigInt = schema.type === 'integer' && schema.format === 'int64';

  if (typeof schema.const === 'number') {
    // TODO: parser - handle bigint constants
    const expression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: zIdentifier,
        name: literalIdentifier,
      }),
      parameters: [compiler.ots.number(schema.const)],
    });
    return expression;
  }

  let numberExpression = compiler.callExpression({
    functionName: isBigInt
      ? compiler.propertyAccessExpression({
          expression: compiler.propertyAccessExpression({
            expression: zIdentifier,
            name: coerceIdentifier,
          }),
          name: compiler.identifier({ text: 'bigint' }),
        })
      : compiler.propertyAccessExpression({
          expression: zIdentifier,
          name: compiler.identifier({ text: 'number' }),
        }),
  });

  if (!isBigInt && schema.type === 'integer') {
    numberExpression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: numberExpression,
        name: compiler.identifier({ text: 'int' }),
      }),
    });
  }

  if (schema.exclusiveMinimum !== undefined) {
    numberExpression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: numberExpression,
        name: compiler.identifier({ text: 'gt' }),
      }),
      parameters: [
        numberParameter({ isBigInt, value: schema.exclusiveMinimum }),
      ],
    });
  } else if (schema.minimum !== undefined) {
    numberExpression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: numberExpression,
        name: compiler.identifier({ text: 'gte' }),
      }),
      parameters: [numberParameter({ isBigInt, value: schema.minimum })],
    });
  }

  if (schema.exclusiveMaximum !== undefined) {
    numberExpression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: numberExpression,
        name: compiler.identifier({ text: 'lt' }),
      }),
      parameters: [
        numberParameter({ isBigInt, value: schema.exclusiveMaximum }),
      ],
    });
  } else if (schema.maximum !== undefined) {
    numberExpression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: numberExpression,
        name: compiler.identifier({ text: 'lte' }),
      }),
      parameters: [numberParameter({ isBigInt, value: schema.maximum })],
    });
  }

  return numberExpression;
};

const objectTypeToZodSchema = ({
  context,
  plugin,
  result,
  schema,
}: {
  context: IR.Context;
  plugin: Plugin.Instance<Config>;
  result: Result;
  schema: SchemaWithType<'object'>;
}): {
  anyType: string;
  expression: ts.CallExpression;
} => {
  // TODO: parser - handle constants
  const properties: Array<ts.PropertyAssignment> = [];

  // let indexProperty: Property | undefined;
  // const schemaProperties: Array<Property> = [];
  // let indexPropertyItems: Array<IR.SchemaObject> = [];
  const required = schema.required ?? [];
  // let hasOptionalProperties = false;

  for (const name in schema.properties) {
    const property = schema.properties[name]!;
    const isRequired = required.includes(name);

    const propertyExpression = schemaToZodSchema({
      context,
      optional: !isRequired,
      plugin,
      result,
      schema: property,
    });

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
      compiler.propertyAssignment({
        initializer: propertyExpression,
        name: propertyName,
      }),
    );

    // indexPropertyItems.push(property);
    // if (!isRequired) {
    //   hasOptionalProperties = true;
    // }
  }

  // if (
  //   schema.additionalProperties &&
  //   (schema.additionalProperties.type !== 'never' || !indexPropertyItems.length)
  // ) {
  //   if (schema.additionalProperties.type === 'never') {
  //     indexPropertyItems = [schema.additionalProperties];
  //   } else {
  //     indexPropertyItems.unshift(schema.additionalProperties);
  //   }

  //   if (hasOptionalProperties) {
  //     indexPropertyItems.push({
  //       type: 'undefined',
  //     });
  //   }

  //   indexProperty = {
  //     isRequired: true,
  //     name: 'key',
  //     type: schemaToZodSchema({
  //       context,
  //       schema:
  //         indexPropertyItems.length === 1
  //           ? indexPropertyItems[0]
  //           : {
  //               items: indexPropertyItems,
  //               logicalOperator: 'or',
  //             },
  //     }),
  //   };
  // }

  // return compiler.typeInterfaceNode({
  //   indexProperty,
  //   properties: schemaProperties,
  //   useLegacyResolution: false,
  // });
  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: zIdentifier,
      name: objectIdentifier,
    }),
    parameters: [ts.factory.createObjectLiteralExpression(properties, true)],
  });
  return {
    anyType: 'AnyZodObject',
    expression,
  };
};

const stringTypeToZodSchema = ({
  schema,
}: {
  context: IR.Context;
  schema: SchemaWithType<'string'>;
}) => {
  if (typeof schema.const === 'string') {
    const expression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: zIdentifier,
        name: literalIdentifier,
      }),
      parameters: [compiler.ots.string(schema.const)],
    });
    return expression;
  }

  let stringExpression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: zIdentifier,
      name: compiler.identifier({ text: 'string' }),
    }),
  });

  if (schema.format) {
    switch (schema.format) {
      case 'date-time':
        stringExpression = compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: stringExpression,
            name: compiler.identifier({ text: 'datetime' }),
          }),
        });
        break;
      case 'ipv4':
      case 'ipv6':
        stringExpression = compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: stringExpression,
            name: compiler.identifier({ text: 'ip' }),
          }),
        });
        break;
      case 'uri':
        stringExpression = compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: stringExpression,
            name: compiler.identifier({ text: 'url' }),
          }),
        });
        break;
      case 'date':
      case 'email':
      case 'time':
      case 'uuid':
        stringExpression = compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: stringExpression,
            name: compiler.identifier({ text: schema.format }),
          }),
        });
        break;
    }
  }

  if (schema.minLength === schema.maxLength && schema.minLength !== undefined) {
    stringExpression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: stringExpression,
        name: lengthIdentifier,
      }),
      parameters: [compiler.valueToExpression({ value: schema.minLength })],
    });
  } else {
    if (schema.minLength !== undefined) {
      stringExpression = compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: stringExpression,
          name: minIdentifier,
        }),
        parameters: [compiler.valueToExpression({ value: schema.minLength })],
      });
    }

    if (schema.maxLength !== undefined) {
      stringExpression = compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: stringExpression,
          name: maxIdentifier,
        }),
        parameters: [compiler.valueToExpression({ value: schema.maxLength })],
      });
    }
  }

  if (schema.pattern) {
    stringExpression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: stringExpression,
        name: regexIdentifier,
      }),
      parameters: [compiler.regularExpressionLiteral({ text: schema.pattern })],
    });
  }

  return stringExpression;
};

const tupleTypeToZodSchema = ({
  context,
  schema,
}: {
  context: IR.Context;
  schema: SchemaWithType<'tuple'>;
}) => {
  if (schema.const && Array.isArray(schema.const)) {
    const tupleElements = schema.const.map((value) =>
      compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: zIdentifier,
          name: literalIdentifier,
        }),
        parameters: [compiler.valueToExpression({ value })],
      }),
    );
    const expression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: zIdentifier,
        name: compiler.identifier({ text: 'tuple' }),
      }),
      parameters: [
        compiler.arrayLiteralExpression({
          elements: tupleElements,
        }),
      ],
    });
    return expression;
  }

  // TODO: parser - handle tuple items
  // const itemTypes: Array<ts.TypeNode> = [];

  // for (const item of schema.items ?? []) {
  //   itemTypes.push(
  //     schemaToType({
  //       context,
  //       namespace,
  //       plugin,
  //       schema: item,
  //     }),
  //   );
  // }

  // return compiler.typeTupleNode({
  //   types: itemTypes,
  // });

  return unknownTypeToZodSchema({
    context,
    schema: {
      type: 'unknown',
    },
  });
};

const undefinedTypeToZodSchema = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  schema,
}: {
  context: IR.Context;
  schema: SchemaWithType<'undefined'>;
}) => {
  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: zIdentifier,
      name: compiler.identifier({ text: 'undefined' }),
    }),
  });
  return expression;
};

const unknownTypeToZodSchema = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  schema,
}: {
  context: IR.Context;
  schema: SchemaWithType<'unknown'>;
}) => {
  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: zIdentifier,
      name: compiler.identifier({ text: 'unknown' }),
    }),
  });
  return expression;
};

const voidTypeToZodSchema = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  schema,
}: {
  context: IR.Context;
  schema: SchemaWithType<'void'>;
}) => {
  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: zIdentifier,
      name: compiler.identifier({ text: 'void' }),
    }),
  });
  return expression;
};

const schemaTypeToZodSchema = ({
  context,
  plugin,
  result,
  schema,
}: {
  context: IR.Context;
  plugin: Plugin.Instance<Config>;
  result: Result;
  schema: IR.SchemaObject;
}): {
  anyType?: string;
  expression: ts.Expression;
} => {
  switch (schema.type as Required<IR.SchemaObject>['type']) {
    case 'array':
      return {
        expression: arrayTypeToZodSchema({
          context,
          plugin,
          result,
          schema: schema as SchemaWithType<'array'>,
        }),
      };
    case 'boolean':
      return {
        expression: booleanTypeToZodSchema({
          context,
          schema: schema as SchemaWithType<'boolean'>,
        }),
      };
    case 'enum':
      return {
        expression: enumTypeToZodSchema({
          context,
          schema: schema as SchemaWithType<'enum'>,
        }),
      };
    case 'integer':
    case 'number':
      return {
        expression: numberTypeToZodSchema({
          context,
          schema: schema as SchemaWithType<'integer' | 'number'>,
        }),
      };
    case 'never':
      return {
        expression: neverTypeToZodSchema({
          context,
          schema: schema as SchemaWithType<'never'>,
        }),
      };
    case 'null':
      return {
        expression: nullTypeToZodSchema({
          context,
          schema: schema as SchemaWithType<'null'>,
        }),
      };
    case 'object':
      return objectTypeToZodSchema({
        context,
        plugin,
        result,
        schema: schema as SchemaWithType<'object'>,
      });
    case 'string':
      return {
        expression: stringTypeToZodSchema({
          context,
          schema: schema as SchemaWithType<'string'>,
        }),
      };
    case 'tuple':
      return {
        expression: tupleTypeToZodSchema({
          context,
          schema: schema as SchemaWithType<'tuple'>,
        }),
      };
    case 'undefined':
      return {
        expression: undefinedTypeToZodSchema({
          context,
          schema: schema as SchemaWithType<'undefined'>,
        }),
      };
    case 'unknown':
      return {
        expression: unknownTypeToZodSchema({
          context,
          schema: schema as SchemaWithType<'unknown'>,
        }),
      };
    case 'void':
      return {
        expression: voidTypeToZodSchema({
          context,
          schema: schema as SchemaWithType<'void'>,
        }),
      };
  }
};

const operationToZodSchema = ({
  context,
  operation,
  plugin,
  result,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
  plugin: Plugin.Instance<Config>;
  result: Result;
}) => {
  if (operation.body) {
    schemaToZodSchema({
      $ref: operationIrRef({
        case: 'camelCase',
        config: context.config,
        id: operation.id,
        type: 'data',
      }),
      context,
      plugin,
      result,
      schema: operation.body.schema,
    });
  }

  if (operation.parameters) {
    for (const type in operation.parameters) {
      const group = operation.parameters[type as keyof IR.ParametersObject]!;
      for (const key in group) {
        const parameter = group[key]!;
        schemaToZodSchema({
          $ref: operationIrRef({
            case: 'camelCase',
            config: context.config,
            id: operation.id,
            parameterId: parameter.name,
            type: 'parameter',
          }),
          context,
          plugin,
          result,
          schema: parameter.schema,
        });
      }
    }
  }

  if (operation.responses) {
    const { response } = operationResponsesMap(operation);

    if (response) {
      schemaToZodSchema({
        $ref: operationIrRef({
          case: 'camelCase',
          config: context.config,
          id: operation.id,
          type: 'response',
        }),
        context,
        plugin,
        result,
        schema: response,
      });
    }
  }
};

const schemaToZodSchema = ({
  $ref,
  context,
  optional,
  plugin,
  result,
  schema,
}: {
  /**
   * When $ref is supplied, a node will be emitted to the file.
   */
  $ref?: string;
  context: IR.Context;
  /**
   * Accept `optional` to handle optional object properties. We can't handle
   * this inside the object function because `.optional()` must come before
   * `.default()` which is handled in this function.
   */
  optional?: boolean;
  plugin: Plugin.Instance<Config>;
  result: Result;
  schema: IR.SchemaObject;
}): ts.Expression => {
  const file = context.file({ id: zodId })!;

  let anyType: string | undefined;
  let expression: ts.Expression | undefined;
  let identifier: ReturnType<typeof file.identifier> | undefined;

  if ($ref) {
    result.circularReferenceTracker.add($ref);

    identifier = file.identifier({
      $ref,
      create: true,
      nameTransformer,
      namespace: 'value',
    });
  }

  if (schema.$ref) {
    const isCircularReference = result.circularReferenceTracker.has(
      schema.$ref,
    );

    // if $ref hasn't been processed yet, inline it to avoid the
    // "Block-scoped variable used before its declaration." error
    // this could be (maybe?) fixed by reshuffling the generation order
    let identifierRef = file.identifier({
      $ref: schema.$ref,
      nameTransformer,
      namespace: 'value',
    });

    if (!identifierRef.name) {
      const ref = context.resolveIrRef<IR.SchemaObject>(schema.$ref);
      expression = schemaToZodSchema({
        $ref: schema.$ref,
        context,
        plugin,
        result,
        schema: ref,
      });

      identifierRef = file.identifier({
        $ref: schema.$ref,
        nameTransformer,
        namespace: 'value',
      });
    }

    // if `identifierRef.name` is falsy, we already set expression above
    if (identifierRef.name) {
      const refIdentifier = compiler.identifier({ text: identifierRef.name });
      if (isCircularReference) {
        expression = compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: zIdentifier,
            name: lazyIdentifier,
          }),
          parameters: [
            compiler.arrowFunction({
              statements: [
                compiler.returnStatement({
                  expression: refIdentifier,
                }),
              ],
            }),
          ],
        });
        result.hasCircularReference = true;
      } else {
        expression = refIdentifier;
      }
    }
  } else if (schema.type) {
    const zodSchema = schemaTypeToZodSchema({
      context,
      plugin,
      result,
      schema,
    });
    anyType = zodSchema.anyType;
    expression = zodSchema.expression;
  } else if (schema.items) {
    schema = deduplicateSchema({ schema });

    if (schema.items) {
      const itemTypes = schema.items.map((item) =>
        schemaToZodSchema({
          context,
          plugin,
          result,
          schema: item,
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
          expression = compiler.callExpression({
            functionName: compiler.propertyAccessExpression({
              expression: zIdentifier,
              name: intersectionIdentifier,
            }),
            parameters: itemTypes,
          });
        } else {
          expression = itemTypes[0];
          itemTypes.slice(1).forEach((item) => {
            expression = compiler.callExpression({
              functionName: compiler.propertyAccessExpression({
                expression: expression!,
                name: andIdentifier,
              }),
              parameters: [item],
            });
          });
        }
      } else {
        expression = compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: zIdentifier,
            name: unionIdentifier,
          }),
          parameters: [
            compiler.arrayLiteralExpression({
              elements: itemTypes,
            }),
          ],
        });
      }
    } else {
      expression = schemaToZodSchema({
        context,
        plugin,
        result,
        schema,
      });
    }
  } else {
    // catch-all fallback for failed schemas
    const zodSchema = schemaTypeToZodSchema({
      context,
      plugin,
      result,
      schema: {
        type: 'unknown',
      },
    });
    anyType = zodSchema.anyType;
    expression = zodSchema.expression;
  }

  if ($ref) {
    result.circularReferenceTracker.delete($ref);
  }

  if (expression) {
    if (schema.accessScope === 'read') {
      expression = compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression,
          name: readonlyIdentifier,
        }),
      });
    }

    if (optional) {
      expression = compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression,
          name: optionalIdentifier,
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
        expression = compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression,
            name: defaultIdentifier,
          }),
          parameters: [callParameter],
        });
      }
    }
  }

  // emit nodes only if $ref points to a reusable component
  if (identifier && identifier.name && identifier.created) {
    const statement = compiler.constVariable({
      comment: plugin.comments ? createSchemaComment({ schema }) : undefined,
      exportConst: true,
      expression: expression!,
      name: identifier.name,
      typeName: result.hasCircularReference
        ? (compiler.propertyAccessExpression({
            expression: zIdentifier,
            name: anyType || 'ZodTypeAny',
          }) as unknown as ts.TypeNode)
        : undefined,
    });
    file.add(statement);
  }

  return expression!;
};

export const handler: Plugin.Handler<Config> = ({ context, plugin }) => {
  const file = context.createFile({
    exportFromIndex: plugin.exportFromIndex,
    id: zodId,
    identifierCase: 'camelCase',
    path: plugin.output,
  });

  file.import({
    module: 'zod',
    name: 'z',
  });

  context.subscribe('operation', ({ operation }) => {
    const result: Result = {
      circularReferenceTracker: new Set(),
      hasCircularReference: false,
    };

    operationToZodSchema({
      context,
      operation,
      plugin,
      result,
    });
  });

  context.subscribe('parameter', ({ $ref, parameter }) => {
    const result: Result = {
      circularReferenceTracker: new Set(),
      hasCircularReference: false,
    };

    schemaToZodSchema({
      $ref,
      context,
      plugin,
      result,
      schema: parameter.schema,
    });
  });

  context.subscribe('requestBody', ({ $ref, requestBody }) => {
    const result: Result = {
      circularReferenceTracker: new Set(),
      hasCircularReference: false,
    };

    schemaToZodSchema({
      $ref,
      context,
      plugin,
      result,
      schema: requestBody.schema,
    });
  });

  context.subscribe('schema', ({ $ref, schema }) => {
    const result: Result = {
      circularReferenceTracker: new Set(),
      hasCircularReference: false,
    };

    schemaToZodSchema({
      $ref,
      context,
      plugin,
      result,
      schema,
    });
  });
};

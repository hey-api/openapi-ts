import ts from 'typescript';

import { compiler } from '../../compiler';
import { operationResponsesMap } from '../../ir/operation';
import { deduplicateSchema } from '../../ir/schema';
import type { IR } from '../../ir/types';
import { numberRegExp } from '../../utils/regexp';
import { operationIrRef } from '../shared/utils/ref';
import { createSchemaComment } from '../shared/utils/schema';
import type { Plugin } from '../types';
import { identifiers, valibotId } from './constants';
import type { Config } from './types';

interface SchemaWithType<T extends Required<IR.SchemaObject>['type']>
  extends Omit<IR.SchemaObject, 'type'> {
  type: Extract<Required<IR.SchemaObject>['type'], T>;
}

interface Result {
  circularReferenceTracker: Set<string>;
  hasCircularReference: boolean;
}

const nameTransformer = (name: string) => `v-${name}`;

const pipesToExpression = (pipes: Array<ts.Expression>) => {
  if (pipes.length === 1) {
    return pipes[0]!;
  }

  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: identifiers.v,
      name: identifiers.methods.pipe,
    }),
    parameters: pipes,
  });
  return expression;
};

const arrayTypeToValibotSchema = ({
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
    expression: identifiers.v,
    name: identifiers.schemas.array,
  });

  let arrayExpression: ts.CallExpression | undefined;

  if (!schema.items) {
    arrayExpression = compiler.callExpression({
      functionName,
      parameters: [
        unknownTypeToValibotSchema({
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
    const itemExpressions = schema.items!.map((item) => {
      const schemaPipes = schemaToValibotSchema({
        context,
        plugin,
        result,
        schema: item,
      });
      return pipesToExpression(schemaPipes);
    });

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

      // TODO: parser - handle union
      // return compiler.typeArrayNode(compiler.typeUnionNode({ types: itemExpressions }));

      arrayExpression = compiler.callExpression({
        functionName,
        parameters: [
          unknownTypeToValibotSchema({
            context,
            schema: {
              type: 'unknown',
            },
          }),
        ],
      });
    }
  }

  if (schema.minItems === schema.maxItems && schema.minItems !== undefined) {
    arrayExpression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: arrayExpression,
        name: identifiers.actions.length,
      }),
      parameters: [compiler.valueToExpression({ value: schema.minItems })],
    });
  } else {
    if (schema.minItems !== undefined) {
      arrayExpression = compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: arrayExpression,
          name: compiler.identifier({ text: 'min' }),
        }),
        parameters: [compiler.valueToExpression({ value: schema.minItems })],
      });
    }

    if (schema.maxItems !== undefined) {
      arrayExpression = compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: arrayExpression,
          name: compiler.identifier({ text: 'max' }),
        }),
        parameters: [compiler.valueToExpression({ value: schema.maxItems })],
      });
    }
  }

  return arrayExpression;
};

const booleanTypeToValibotSchema = ({
  schema,
}: {
  context: IR.Context;
  schema: SchemaWithType<'boolean'>;
}) => {
  if (typeof schema.const === 'boolean') {
    const expression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.schemas.literal,
      }),
      parameters: [compiler.ots.boolean(schema.const)],
    });
    return expression;
  }

  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: identifiers.v,
      name: identifiers.schemas.boolean,
    }),
  });
  return expression;
};

const enumTypeToValibotSchema = ({
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
    return unknownTypeToValibotSchema({
      context,
      schema: {
        type: 'unknown',
      },
    });
  }

  let resultExpression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: identifiers.v,
      name: identifiers.schemas.picklist,
    }),
    parameters: [
      compiler.arrayLiteralExpression({
        elements: enumMembers,
        multiLine: false,
      }),
    ],
  });

  if (isNullable) {
    resultExpression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.schemas.nullable,
      }),
      parameters: [resultExpression],
    });
  }

  return resultExpression;
};

const neverTypeToValibotSchema = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  schema,
}: {
  context: IR.Context;
  schema: SchemaWithType<'never'>;
}) => {
  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: identifiers.v,
      name: identifiers.schemas.never,
    }),
  });
  return expression;
};

const nullTypeToValibotSchema = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  schema,
}: {
  context: IR.Context;
  schema: SchemaWithType<'null'>;
}) => {
  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: identifiers.v,
      name: identifiers.schemas.null,
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

const numberTypeToValibotSchema = ({
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
        expression: identifiers.v,
        name: identifiers.schemas.literal,
      }),
      parameters: [compiler.ots.number(schema.const)],
    });
    return expression;
  }

  const pipes: Array<ts.CallExpression> = [];

  // Zod uses coerce for bigint here, might be needed for Valibot too
  const expression = compiler.callExpression({
    functionName: isBigInt
      ? compiler.propertyAccessExpression({
          expression: identifiers.v,
          name: identifiers.schemas.bigInt,
        })
      : compiler.propertyAccessExpression({
          expression: identifiers.v,
          name: identifiers.schemas.number,
        }),
  });
  pipes.push(expression);

  if (!isBigInt && schema.type === 'integer') {
    const expression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.actions.integer,
      }),
    });
    pipes.push(expression);
  }

  if (schema.exclusiveMinimum !== undefined) {
    const expression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.actions.gtValue,
      }),
      parameters: [
        numberParameter({ isBigInt, value: schema.exclusiveMinimum }),
      ],
    });
    pipes.push(expression);
  } else if (schema.minimum !== undefined) {
    const expression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.actions.minValue,
      }),
      parameters: [numberParameter({ isBigInt, value: schema.minimum })],
    });
    pipes.push(expression);
  }

  if (schema.exclusiveMaximum !== undefined) {
    const expression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.actions.ltValue,
      }),
      parameters: [
        numberParameter({ isBigInt, value: schema.exclusiveMaximum }),
      ],
    });
    pipes.push(expression);
  } else if (schema.maximum !== undefined) {
    const expression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.actions.maxValue,
      }),
      parameters: [numberParameter({ isBigInt, value: schema.maximum })],
    });
    pipes.push(expression);
  }

  return pipesToExpression(pipes);
};

const objectTypeToValibotSchema = ({
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

    const schemaPipes = schemaToValibotSchema({
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
        initializer: pipesToExpression(schemaPipes),
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
  //     type: schemaToValibotSchema({
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
      expression: identifiers.v,
      name: identifiers.schemas.object,
    }),
    parameters: [ts.factory.createObjectLiteralExpression(properties, true)],
  });
  return {
    // Zod uses AnyZodObject here, maybe we want to be more specific too
    anyType: identifiers.types.GenericSchema.text,
    expression,
  };
};

const stringTypeToValibotSchema = ({
  schema,
}: {
  context: IR.Context;
  schema: SchemaWithType<'string'>;
}) => {
  if (typeof schema.const === 'string') {
    const expression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.schemas.literal,
      }),
      parameters: [compiler.ots.string(schema.const)],
    });
    return expression;
  }

  const pipes: Array<ts.CallExpression> = [];

  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: identifiers.v,
      name: identifiers.schemas.string,
    }),
  });
  pipes.push(expression);

  if (schema.format) {
    switch (schema.format) {
      case 'date':
        pipes.push(
          compiler.callExpression({
            functionName: compiler.propertyAccessExpression({
              expression: identifiers.v,
              name: identifiers.actions.isoDate,
            }),
          }),
        );
        break;
      case 'date-time':
        pipes.push(
          compiler.callExpression({
            functionName: compiler.propertyAccessExpression({
              expression: identifiers.v,
              name: identifiers.actions.isoDateTime,
            }),
          }),
        );
        break;
      case 'ipv4':
      case 'ipv6':
        pipes.push(
          compiler.callExpression({
            functionName: compiler.propertyAccessExpression({
              expression: identifiers.v,
              name: identifiers.actions.ip,
            }),
          }),
        );
        break;
      case 'uri':
        pipes.push(
          compiler.callExpression({
            functionName: compiler.propertyAccessExpression({
              expression: identifiers.v,
              name: identifiers.actions.url,
            }),
          }),
        );
        break;
      case 'email':
      case 'time':
      case 'uuid':
        pipes.push(
          compiler.callExpression({
            functionName: compiler.propertyAccessExpression({
              expression: identifiers.v,
              name: compiler.identifier({ text: schema.format }),
            }),
          }),
        );
        break;
    }
  }

  if (schema.minLength === schema.maxLength && schema.minLength !== undefined) {
    const expression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.actions.length,
      }),
      parameters: [compiler.valueToExpression({ value: schema.minLength })],
    });
    pipes.push(expression);
  } else {
    if (schema.minLength !== undefined) {
      const expression = compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: identifiers.v,
          name: identifiers.actions.minLength,
        }),
        parameters: [compiler.valueToExpression({ value: schema.minLength })],
      });
      pipes.push(expression);
    }

    if (schema.maxLength !== undefined) {
      const expression = compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: identifiers.v,
          name: identifiers.actions.maxLength,
        }),
        parameters: [compiler.valueToExpression({ value: schema.maxLength })],
      });
      pipes.push(expression);
    }
  }

  if (schema.pattern) {
    const expression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.actions.regex,
      }),
      parameters: [compiler.regularExpressionLiteral({ text: schema.pattern })],
    });
    pipes.push(expression);
  }

  return pipesToExpression(pipes);
};

const tupleTypeToValibotSchema = ({
  context,
  plugin,
  result,
  schema,
}: {
  context: IR.Context;
  plugin: Plugin.Instance<Config>;
  result: Result;
  schema: SchemaWithType<'tuple'>;
}) => {
  if (schema.const && Array.isArray(schema.const)) {
    const tupleElements = schema.const.map((value) =>
      compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: identifiers.v,
          name: identifiers.schemas.literal,
        }),
        parameters: [compiler.valueToExpression({ value })],
      }),
    );
    const expression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.schemas.tuple,
      }),
      parameters: [
        compiler.arrayLiteralExpression({
          elements: tupleElements,
        }),
      ],
    });
    return expression;
  }

  if (schema.items) {
    const tupleElements = schema.items.map((item) => {
      const schemaPipes = schemaToValibotSchema({
        context,
        plugin,
        result,
        schema: item,
      });
      return pipesToExpression(schemaPipes);
    });
    const expression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.schemas.tuple,
      }),
      parameters: [
        compiler.arrayLiteralExpression({
          elements: tupleElements,
        }),
      ],
    });
    return expression;
  }

  return unknownTypeToValibotSchema({
    context,
    schema: {
      type: 'unknown',
    },
  });
};

const undefinedTypeToValibotSchema = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  schema,
}: {
  context: IR.Context;
  schema: SchemaWithType<'undefined'>;
}) => {
  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: identifiers.v,
      name: identifiers.schemas.undefined,
    }),
  });
  return expression;
};

const unknownTypeToValibotSchema = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  schema,
}: {
  context: IR.Context;
  schema: SchemaWithType<'unknown'>;
}) => {
  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: identifiers.v,
      name: identifiers.schemas.unknown,
    }),
  });
  return expression;
};

const voidTypeToValibotSchema = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  schema,
}: {
  context: IR.Context;
  schema: SchemaWithType<'void'>;
}) => {
  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: identifiers.v,
      name: identifiers.schemas.void,
    }),
  });
  return expression;
};

const schemaTypeToValibotSchema = ({
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
        expression: arrayTypeToValibotSchema({
          context,
          plugin,
          result,
          schema: schema as SchemaWithType<'array'>,
        }),
      };
    case 'boolean':
      return {
        expression: booleanTypeToValibotSchema({
          context,
          schema: schema as SchemaWithType<'boolean'>,
        }),
      };
    case 'enum':
      return {
        expression: enumTypeToValibotSchema({
          context,
          schema: schema as SchemaWithType<'enum'>,
        }),
      };
    case 'integer':
    case 'number':
      return {
        expression: numberTypeToValibotSchema({
          context,
          schema: schema as SchemaWithType<'integer' | 'number'>,
        }),
      };
    case 'never':
      return {
        expression: neverTypeToValibotSchema({
          context,
          schema: schema as SchemaWithType<'never'>,
        }),
      };
    case 'null':
      return {
        expression: nullTypeToValibotSchema({
          context,
          schema: schema as SchemaWithType<'null'>,
        }),
      };
    case 'object':
      return objectTypeToValibotSchema({
        context,
        plugin,
        result,
        schema: schema as SchemaWithType<'object'>,
      });
    case 'string':
      return {
        expression: stringTypeToValibotSchema({
          context,
          schema: schema as SchemaWithType<'string'>,
        }),
      };
    case 'tuple':
      return {
        expression: tupleTypeToValibotSchema({
          context,
          plugin,
          result,
          schema: schema as SchemaWithType<'tuple'>,
        }),
      };
    case 'undefined':
      return {
        expression: undefinedTypeToValibotSchema({
          context,
          schema: schema as SchemaWithType<'undefined'>,
        }),
      };
    case 'unknown':
      return {
        expression: unknownTypeToValibotSchema({
          context,
          schema: schema as SchemaWithType<'unknown'>,
        }),
      };
    case 'void':
      return {
        expression: voidTypeToValibotSchema({
          context,
          schema: schema as SchemaWithType<'void'>,
        }),
      };
  }
};

const operationToValibotSchema = ({
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
    schemaToValibotSchema({
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
        schemaToValibotSchema({
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
      schemaToValibotSchema({
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

const schemaToValibotSchema = ({
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
}): Array<ts.Expression> => {
  const file = context.file({ id: valibotId })!;

  let anyType: string | undefined;
  let identifier: ReturnType<typeof file.identifier> | undefined;
  let pipes: Array<ts.Expression> = [];

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
      const schemaPipes = schemaToValibotSchema({
        $ref: schema.$ref,
        context,
        plugin,
        result,
        schema: ref,
      });
      pipes.push(...schemaPipes);

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
        const lazyExpression = compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: identifiers.v,
            name: identifiers.schemas.lazy,
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
        pipes.push(lazyExpression);
        result.hasCircularReference = true;
      } else {
        pipes.push(refIdentifier);
      }
    }
  } else if (schema.type) {
    const valibotSchema = schemaTypeToValibotSchema({
      context,
      plugin,
      result,
      schema,
    });
    anyType = valibotSchema.anyType;
    pipes.push(valibotSchema.expression);
  } else if (schema.items) {
    schema = deduplicateSchema({ schema });

    if (schema.items) {
      const itemTypes = schema.items.map((item) => {
        const schemaPipes = schemaToValibotSchema({
          context,
          plugin,
          result,
          schema: item,
        });
        return pipesToExpression(schemaPipes);
      });

      if (schema.logicalOperator === 'and') {
        const intersectExpression = compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: identifiers.v,
            name: identifiers.schemas.intersect,
          }),
          parameters: [
            compiler.arrayLiteralExpression({
              elements: itemTypes,
            }),
          ],
        });
        pipes.push(intersectExpression);
      } else {
        const unionExpression = compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: identifiers.v,
            name: identifiers.schemas.union,
          }),
          parameters: [
            compiler.arrayLiteralExpression({
              elements: itemTypes,
            }),
          ],
        });
        pipes.push(unionExpression);
      }
    } else {
      const schemaPipes = schemaToValibotSchema({
        context,
        plugin,
        result,
        schema,
      });
      pipes.push(...schemaPipes);
    }
  } else {
    // catch-all fallback for failed schemas
    const valibotSchema = schemaTypeToValibotSchema({
      context,
      plugin,
      result,
      schema: {
        type: 'unknown',
      },
    });
    anyType = valibotSchema.anyType;
    pipes.push(valibotSchema.expression);
  }

  if ($ref) {
    result.circularReferenceTracker.delete($ref);
  }

  if (pipes.length) {
    if (schema.accessScope === 'read') {
      const readonlyExpression = compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: identifiers.v,
          name: identifiers.actions.readonly,
        }),
      });
      pipes.push(readonlyExpression);
    }
  }

  if (pipes.length) {
    let callParameter: ts.Expression | undefined;

    if (schema.default !== undefined) {
      const isBigInt = schema.type === 'integer' && schema.format === 'int64';
      callParameter = numberParameter({ isBigInt, value: schema.default });
      if (callParameter) {
        pipes = [
          compiler.callExpression({
            functionName: compiler.propertyAccessExpression({
              expression: identifiers.v,
              name: identifiers.schemas.optional,
            }),
            parameters: [pipesToExpression(pipes), callParameter],
          }),
        ];
      }
    }

    if (optional && !callParameter) {
      pipes = [
        compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: identifiers.v,
            name: identifiers.schemas.optional,
          }),
          parameters: [pipesToExpression(pipes)],
        }),
      ];
    }
  }

  // emit nodes only if $ref points to a reusable component
  if (identifier && identifier.name && identifier.created) {
    const statement = compiler.constVariable({
      comment: plugin.config.comments
        ? createSchemaComment({ schema })
        : undefined,
      exportConst: true,
      expression: pipesToExpression(pipes),
      name: identifier.name,
      typeName: result.hasCircularReference
        ? (compiler.propertyAccessExpression({
            expression: identifiers.v,
            name: anyType || identifiers.types.GenericSchema.text,
          }) as unknown as ts.TypeNode)
        : undefined,
    });
    file.add(statement);

    return [];
  }

  return pipes;
};

export const handler: Plugin.Handler<Config> = ({ context, plugin }) => {
  const file = context.createFile({
    exportFromIndex: plugin.config.exportFromIndex,
    id: valibotId,
    identifierCase: 'camelCase',
    path: plugin.output,
  });

  file.import({
    alias: identifiers.v.text,
    module: 'valibot',
    name: '*',
  });

  context.subscribe('operation', ({ operation }) => {
    const result: Result = {
      circularReferenceTracker: new Set(),
      hasCircularReference: false,
    };

    operationToValibotSchema({
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

    schemaToValibotSchema({
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

    schemaToValibotSchema({
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

    schemaToValibotSchema({
      $ref,
      context,
      plugin,
      result,
      schema,
    });
  });
};

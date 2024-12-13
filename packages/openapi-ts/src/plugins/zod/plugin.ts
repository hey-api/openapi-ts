import ts from 'typescript';

import { compiler } from '../../compiler';
import type { IRContext } from '../../ir/context';
import type { IROperationObject, IRSchemaObject } from '../../ir/ir';
import { operationResponsesMap } from '../../ir/operation';
import { deduplicateSchema } from '../../ir/schema';
import { digitsRegExp } from '../../utils/regexp';
import { operationIrRef } from '../shared/utils/ref';
import type { Plugin } from '../types';
import type { Config } from './types';

interface SchemaWithType<T extends Required<IRSchemaObject>['type']>
  extends Omit<IRSchemaObject, 'type'> {
  type: Extract<Required<IRSchemaObject>['type'], T>;
}

interface Result {
  circularReferenceTracker: Set<string>;
  hasCircularReference: boolean;
}

export const zodId = 'zod';

// frequently used identifiers
const defaultIdentifier = compiler.identifier({ text: 'default' });
const intersectionIdentifier = compiler.identifier({ text: 'intersection' });
const lazyIdentifier = compiler.identifier({ text: 'lazy' });
const mergeIdentifier = compiler.identifier({ text: 'merge' });
const optionalIdentifier = compiler.identifier({ text: 'optional' });
const readonlyIdentifier = compiler.identifier({ text: 'readonly' });
const unionIdentifier = compiler.identifier({ text: 'union' });
const zIdentifier = compiler.identifier({ text: 'z' });

const nameTransformer = (name: string) => `z-${name}`;

const arrayTypeToZodSchema = ({
  context,
  result,
  schema,
}: {
  context: IRContext;
  result: Result;
  schema: SchemaWithType<'array'>;
}): ts.CallExpression => {
  const functionName = compiler.propertyAccessExpression({
    expression: zIdentifier,
    name: compiler.identifier({ text: schema.type }),
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

      // TODO: parser - handle union
      // return compiler.typeArrayNode(compiler.typeUnionNode({ types: itemExpressions }));

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
    }
  }

  if (schema.minItems === schema.maxItems && schema.minItems !== undefined) {
    arrayExpression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: arrayExpression,
        name: compiler.identifier({ text: 'length' }),
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

const booleanTypeToZodSchema = ({
  schema,
}: {
  context: IRContext;
  schema: SchemaWithType<'boolean'>;
}) => {
  if (schema.const !== undefined) {
    // TODO: parser - add constant
    // return compiler.literalTypeNode({
    //   literal: compiler.ots.boolean(schema.const as boolean),
    // });
  }

  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: zIdentifier,
      name: compiler.identifier({ text: schema.type }),
    }),
  });
  return expression;
};

const enumTypeToZodSchema = ({
  context,
  schema,
}: {
  context: IRContext;
  schema: SchemaWithType<'enum'>;
}): ts.CallExpression => {
  const enumMembers: Array<ts.LiteralExpression> = [];

  for (const item of schema.items ?? []) {
    // Zod supports only string enums
    if (item.type === 'string' && typeof item.const === 'string') {
      enumMembers.push(
        compiler.stringLiteral({
          text: item.const,
        }),
      );
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

  const enumExpression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: zIdentifier,
      name: compiler.identifier({ text: schema.type }),
    }),
    parameters: [
      compiler.arrayLiteralExpression({
        elements: enumMembers,
        multiLine: false,
      }),
    ],
  });

  return enumExpression;
};

const neverTypeToZodSchema = ({
  schema,
}: {
  context: IRContext;
  schema: SchemaWithType<'never'>;
}) => {
  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: zIdentifier,
      name: compiler.identifier({ text: schema.type }),
    }),
  });
  return expression;
};

const nullTypeToZodSchema = ({
  schema,
}: {
  context: IRContext;
  schema: SchemaWithType<'null'>;
}) => {
  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: zIdentifier,
      name: compiler.identifier({ text: schema.type }),
    }),
  });
  return expression;
};

const numberTypeToZodSchema = ({
  schema,
}: {
  context: IRContext;
  schema: SchemaWithType<'number'>;
}) => {
  let numberExpression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: zIdentifier,
      name: compiler.identifier({ text: schema.type }),
    }),
  });

  if (schema.const !== undefined) {
    // TODO: parser - add constant
    // return compiler.literalTypeNode({
    //   literal: compiler.ots.number(schema.const as number),
    // });
  }

  if (schema.exclusiveMinimum !== undefined) {
    numberExpression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: numberExpression,
        name: compiler.identifier({ text: 'gt' }),
      }),
      parameters: [
        compiler.valueToExpression({ value: schema.exclusiveMinimum }),
      ],
    });
  } else if (schema.minimum !== undefined) {
    numberExpression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: numberExpression,
        name: compiler.identifier({ text: 'gte' }),
      }),
      parameters: [compiler.valueToExpression({ value: schema.minimum })],
    });
  }

  if (schema.exclusiveMaximum !== undefined) {
    numberExpression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: numberExpression,
        name: compiler.identifier({ text: 'lt' }),
      }),
      parameters: [
        compiler.valueToExpression({ value: schema.exclusiveMaximum }),
      ],
    });
  } else if (schema.maximum !== undefined) {
    numberExpression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: numberExpression,
        name: compiler.identifier({ text: 'lte' }),
      }),
      parameters: [compiler.valueToExpression({ value: schema.maximum })],
    });
  }

  return numberExpression;
};

const objectTypeToZodSchema = ({
  context,
  result,
  schema,
}: {
  context: IRContext;
  result: Result;
  schema: SchemaWithType<'object'>;
}) => {
  const properties: Array<ts.PropertyAssignment> = [];

  // let indexProperty: Property | undefined;
  // const schemaProperties: Array<Property> = [];
  // let indexPropertyItems: Array<IRSchemaObject> = [];
  const required = schema.required ?? [];
  // let hasOptionalProperties = false;

  for (const name in schema.properties) {
    const property = schema.properties[name];
    const isRequired = required.includes(name);

    let propertyExpression = schemaToZodSchema({
      context,
      result,
      schema: property,
    });

    if (property.accessScope === 'read') {
      propertyExpression = compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: propertyExpression,
          name: readonlyIdentifier,
        }),
      });
    }

    if (!isRequired) {
      propertyExpression = compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: propertyExpression,
          name: optionalIdentifier,
        }),
      });
    }

    if (property.default !== undefined) {
      const callParameter = compiler.valueToExpression({
        value: property.default,
      });
      if (callParameter) {
        propertyExpression = compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: propertyExpression,
            name: defaultIdentifier,
          }),
          parameters: [callParameter],
        });
      }
    }

    digitsRegExp.lastIndex = 0;
    let propertyName = digitsRegExp.test(name)
      ? ts.factory.createNumericLiteral(name)
      : name;
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
      name: compiler.identifier({ text: schema.type }),
    }),
    parameters: [ts.factory.createObjectLiteralExpression(properties, true)],
  });
  return expression;
};

const stringTypeToZodSchema = ({
  schema,
}: {
  context: IRContext;
  schema: SchemaWithType<'string'>;
}) => {
  let stringExpression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: zIdentifier,
      name: compiler.identifier({ text: schema.type }),
    }),
  });

  if (schema.const !== undefined) {
    // TODO: parser - add constant
    // return compiler.literalTypeNode({
    //   literal: compiler.stringLiteral({ text: schema.const as string }),
    // });
  }

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
        name: compiler.identifier({ text: 'length' }),
      }),
      parameters: [compiler.valueToExpression({ value: schema.minLength })],
    });
  } else {
    if (schema.minLength !== undefined) {
      stringExpression = compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: stringExpression,
          name: compiler.identifier({ text: 'min' }),
        }),
        parameters: [compiler.valueToExpression({ value: schema.minLength })],
      });
    }

    if (schema.maxLength !== undefined) {
      stringExpression = compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: stringExpression,
          name: compiler.identifier({ text: 'max' }),
        }),
        parameters: [compiler.valueToExpression({ value: schema.maxLength })],
      });
    }
  }

  return stringExpression;
};

const undefinedTypeToZodSchema = ({
  schema,
}: {
  context: IRContext;
  schema: SchemaWithType<'undefined'>;
}) => {
  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: zIdentifier,
      name: compiler.identifier({ text: schema.type }),
    }),
  });
  return expression;
};

const unknownTypeToZodSchema = ({
  schema,
}: {
  context: IRContext;
  schema: SchemaWithType<'unknown'>;
}) => {
  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: zIdentifier,
      name: compiler.identifier({ text: schema.type }),
    }),
  });
  return expression;
};

const voidTypeToZodSchema = ({
  schema,
}: {
  context: IRContext;
  schema: SchemaWithType<'void'>;
}) => {
  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: zIdentifier,
      name: compiler.identifier({ text: schema.type }),
    }),
  });
  return expression;
};

const schemaTypeToZodSchema = ({
  context,
  result,
  schema,
}: {
  context: IRContext;
  result: Result;
  schema: IRSchemaObject;
}): ts.Expression => {
  switch (schema.type as Required<IRSchemaObject>['type']) {
    case 'array':
      return arrayTypeToZodSchema({
        context,
        result,
        schema: schema as SchemaWithType<'array'>,
      });
    case 'boolean':
      return booleanTypeToZodSchema({
        context,
        schema: schema as SchemaWithType<'boolean'>,
      });
    case 'enum':
      return enumTypeToZodSchema({
        context,
        schema: schema as SchemaWithType<'enum'>,
      });
    case 'never':
      return neverTypeToZodSchema({
        context,
        schema: schema as SchemaWithType<'never'>,
      });
    case 'null':
      return nullTypeToZodSchema({
        context,
        schema: schema as SchemaWithType<'null'>,
      });
    case 'number':
      return numberTypeToZodSchema({
        context,
        schema: schema as SchemaWithType<'number'>,
      });
    case 'object':
      return objectTypeToZodSchema({
        context,
        result,
        schema: schema as SchemaWithType<'object'>,
      });
    case 'string':
      return stringTypeToZodSchema({
        context,
        schema: schema as SchemaWithType<'string'>,
      });
    case 'tuple':
      // TODO: parser - temporary unknown while not handled
      return unknownTypeToZodSchema({
        context,
        schema: {
          type: 'unknown',
        },
      });
    // TODO: parser - handle tuple
    // return tupleTypeToIdentifier({
    //   context,
    //   schema: schema as SchemaWithType<'tuple'>,
    // });
    case 'undefined':
      return undefinedTypeToZodSchema({
        context,
        schema: schema as SchemaWithType<'undefined'>,
      });
    case 'unknown':
      return unknownTypeToZodSchema({
        context,
        schema: schema as SchemaWithType<'unknown'>,
      });
    case 'void':
      return voidTypeToZodSchema({
        context,
        schema: schema as SchemaWithType<'void'>,
      });
  }
};

const operationToZodSchema = ({
  context,
  operation,
  result,
}: {
  context: IRContext;
  operation: IROperationObject;
  result: Result;
}) => {
  if (operation.responses) {
    const { response } = operationResponsesMap(operation);

    if (response) {
      schemaToZodSchema({
        $ref: operationIrRef({
          case: 'camelCase',
          id: operation.id,
          type: 'response',
        }),
        context,
        result,
        schema: response,
      });
    }
  }
};

const schemaToZodSchema = ({
  $ref,
  context,
  result,
  schema,
}: {
  /**
   * When $ref is supplied, a node will be emitted to the file.
   */
  $ref?: string;
  context: IRContext;
  result: Result;
  schema: IRSchemaObject;
}): ts.Expression => {
  const file = context.file({ id: zodId })!;

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
      const ref = context.resolveIrRef<IRSchemaObject>(schema.$ref);
      expression = schemaToZodSchema({
        context,
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
    expression = schemaTypeToZodSchema({
      context,
      result,
      schema,
    });
  } else if (schema.items) {
    schema = deduplicateSchema({ schema });

    if (schema.items) {
      const itemTypes = schema.items.map((item) =>
        schemaToZodSchema({
          context,
          result,
          schema: item,
        }),
      );

      if (schema.logicalOperator === 'and') {
        const firstSchema = schema.items[0];
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
                name: mergeIdentifier,
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
        result,
        schema,
      });
    }
  } else {
    // catch-all fallback for failed schemas
    expression = schemaTypeToZodSchema({
      context,
      result,
      schema: {
        type: 'unknown',
      },
    });
  }

  if ($ref) {
    result.circularReferenceTracker.delete($ref);
  }

  // emit nodes only if $ref points to a reusable component
  if (identifier?.name) {
    const statement = compiler.constVariable({
      exportConst: true,
      expression: expression!,
      name: identifier.name,
      typeName: result.hasCircularReference
        ? (compiler.propertyAccessExpression({
            expression: zIdentifier,
            name: 'ZodTypeAny',
          }) as unknown as ts.TypeNode)
        : undefined,
    });
    file.add(statement);
  }

  return expression!;
};

export const handler: Plugin.Handler<Config> = ({ context, plugin }) => {
  const file = context.createFile({
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
      result,
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
      result,
      schema,
    });
  });
};

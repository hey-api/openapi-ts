import ts from 'typescript';

import { compiler } from '../../compiler';
import { operationResponsesMap } from '../../ir/operation';
import { deduplicateSchema } from '../../ir/schema';
import type { IR } from '../../ir/types';
import { numberRegExp } from '../../utils/regexp';
import { operationIrRef } from '../shared/utils/ref';
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
const coerceIdentifier = compiler.identifier({ text: 'coerce' });
const defaultIdentifier = compiler.identifier({ text: 'default' });
const intersectionIdentifier = compiler.identifier({ text: 'intersection' });
const lazyIdentifier = compiler.identifier({ text: 'lazy' });
const lengthIdentifier = compiler.identifier({ text: 'length' });
const literalIdentifier = compiler.identifier({ text: 'literal' });
const maxIdentifier = compiler.identifier({ text: 'max' });
const mergeIdentifier = compiler.identifier({ text: 'merge' });
const minIdentifier = compiler.identifier({ text: 'min' });
const optionalIdentifier = compiler.identifier({ text: 'optional' });
const readonlyIdentifier = compiler.identifier({ text: 'readonly' });
const regexIdentifier = compiler.identifier({ text: 'regex' });
const unionIdentifier = compiler.identifier({ text: 'union' });
const zIdentifier = compiler.identifier({ text: 'z' });

const nameTransformer = (name: string) => `z-${name}`;

const arrayTypeToZodSchema = ({
  context,
  result,
  schema,
}: {
  context: IR.Context;
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
      name: compiler.identifier({ text: schema.type }),
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
  context: IR.Context;
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
  context: IR.Context;
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
  context: IR.Context;
  result: Result;
  schema: SchemaWithType<'object'>;
}) => {
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
      result,
      schema: property,
    });

    numberRegExp.lastIndex = 0;
    let propertyName = numberRegExp.test(name)
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
      name: compiler.identifier({ text: schema.type }),
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
    const text = schema.pattern
      .replace(/\\/g, '\\\\') // backslashes
      .replace(/\n/g, '\\n') // newlines
      .replace(/\r/g, '\\r') // carriage returns
      .replace(/\t/g, '\\t') // tabs
      .replace(/\f/g, '\\f') // form feeds
      .replace(/\v/g, '\\v') // vertical tabs
      .replace(/'/g, "\\'") // single quotes
      .replace(/"/g, '\\"'); // double quotes
    stringExpression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: stringExpression,
        name: regexIdentifier,
      }),
      parameters: [compiler.regularExpressionLiteral({ text })],
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
  schema,
}: {
  context: IR.Context;
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
  context: IR.Context;
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
  context: IR.Context;
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
  context: IR.Context;
  result: Result;
  schema: IR.SchemaObject;
}): ts.Expression => {
  switch (schema.type as Required<IR.SchemaObject>['type']) {
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
    case 'integer':
    case 'number':
      return numberTypeToZodSchema({
        context,
        schema: schema as SchemaWithType<'integer' | 'number'>,
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
      return tupleTypeToZodSchema({
        context,
        schema: schema as SchemaWithType<'tuple'>,
      });
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
  context: IR.Context;
  operation: IR.OperationObject;
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
  optional,
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
  result: Result;
  schema: IR.SchemaObject;
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
      const ref = context.resolveIrRef<IR.SchemaObject>(schema.$ref);
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
      const callParameter = compiler.valueToExpression({
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

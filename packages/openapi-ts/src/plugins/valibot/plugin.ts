import ts from 'typescript';

import type { Identifier } from '../../generate/file/types';
import { deduplicateSchema } from '../../ir/schema';
import type { IR } from '../../ir/types';
import { tsc } from '../../tsc';
import type { StringCase, StringName } from '../../types/case';
import { numberRegExp } from '../../utils/regexp';
import { createSchemaComment } from '../shared/utils/schema';
import { identifiers, valibotId } from './constants';
import {
  INTEGER_FORMATS,
  isIntegerFormat,
  needsBigIntForFormat,
  numberParameter,
} from './number-helpers';
import { operationToValibotSchema } from './operation';
import type { ValibotPlugin } from './types';
import { webhookToValibotSchema } from './webhook';

interface SchemaWithType<T extends Required<IR.SchemaObject>['type']>
  extends Omit<IR.SchemaObject, 'type'> {
  type: Extract<Required<IR.SchemaObject>['type'], T>;
}

export interface State {
  circularReferenceTracker: Set<string>;
  hasCircularReference: boolean;
  nameCase: StringCase;
  nameTransformer: StringName;
}

const pipesToExpression = (pipes: Array<ts.Expression>) => {
  if (pipes.length === 1) {
    return pipes[0]!;
  }

  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: identifiers.v,
      name: identifiers.methods.pipe,
    }),
    parameters: pipes,
  });
  return expression;
};

const arrayTypeToValibotSchema = ({
  plugin,
  schema,
  state,
}: {
  plugin: ValibotPlugin['Instance'];
  schema: SchemaWithType<'array'>;
  state: State;
}): ts.Expression => {
  const functionName = tsc.propertyAccessExpression({
    expression: identifiers.v,
    name: identifiers.schemas.array,
  });

  const pipes: Array<ts.CallExpression> = [];

  if (!schema.items) {
    const expression = tsc.callExpression({
      functionName,
      parameters: [
        unknownTypeToValibotSchema({
          schema: {
            type: 'unknown',
          },
        }),
      ],
    });
    pipes.push(expression);
  } else {
    schema = deduplicateSchema({ schema });

    // at least one item is guaranteed
    const itemExpressions = schema.items!.map((item) => {
      const schemaPipes = schemaToValibotSchema({
        plugin,
        schema: item,
        state,
      });
      return pipesToExpression(schemaPipes);
    });

    if (itemExpressions.length === 1) {
      const expression = tsc.callExpression({
        functionName,
        parameters: itemExpressions,
      });
      pipes.push(expression);
    } else {
      if (schema.logicalOperator === 'and') {
        // TODO: parser - handle intersection
        // return tsc.typeArrayNode(
        //   tsc.typeIntersectionNode({ types: itemExpressions }),
        // );
      }

      // TODO: parser - handle union
      // return tsc.typeArrayNode(tsc.typeUnionNode({ types: itemExpressions }));

      const expression = tsc.callExpression({
        functionName,
        parameters: [
          unknownTypeToValibotSchema({
            schema: {
              type: 'unknown',
            },
          }),
        ],
      });
      pipes.push(expression);
    }
  }

  if (schema.minItems === schema.maxItems && schema.minItems !== undefined) {
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.actions.length,
      }),
      parameters: [tsc.valueToExpression({ value: schema.minItems })],
    });
    pipes.push(expression);
  } else {
    if (schema.minItems !== undefined) {
      const expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: identifiers.v,
          name: identifiers.actions.minLength,
        }),
        parameters: [tsc.valueToExpression({ value: schema.minItems })],
      });
      pipes.push(expression);
    }

    if (schema.maxItems !== undefined) {
      const expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: identifiers.v,
          name: identifiers.actions.maxLength,
        }),
        parameters: [tsc.valueToExpression({ value: schema.maxItems })],
      });
      pipes.push(expression);
    }
  }

  return pipesToExpression(pipes);
};

const booleanTypeToValibotSchema = ({
  schema,
}: {
  schema: SchemaWithType<'boolean'>;
}) => {
  if (typeof schema.const === 'boolean') {
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.schemas.literal,
      }),
      parameters: [tsc.ots.boolean(schema.const)],
    });
    return expression;
  }

  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: identifiers.v,
      name: identifiers.schemas.boolean,
    }),
  });
  return expression;
};

const enumTypeToValibotSchema = ({
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
    return unknownTypeToValibotSchema({
      schema: {
        type: 'unknown',
      },
    });
  }

  let resultExpression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: identifiers.v,
      name: identifiers.schemas.picklist,
    }),
    parameters: [
      tsc.arrayLiteralExpression({
        elements: enumMembers,
        multiLine: false,
      }),
    ],
  });

  if (isNullable) {
    resultExpression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.schemas.nullable,
      }),
      parameters: [resultExpression],
    });
  }

  return resultExpression;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const neverTypeToValibotSchema = (_props: {
  schema: SchemaWithType<'never'>;
}) => {
  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: identifiers.v,
      name: identifiers.schemas.never,
    }),
  });
  return expression;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const nullTypeToValibotSchema = (_props: {
  schema: SchemaWithType<'null'>;
}) => {
  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: identifiers.v,
      name: identifiers.schemas.null,
    }),
  });
  return expression;
};

const numberTypeToValibotSchema = ({
  schema,
}: {
  schema: SchemaWithType<'integer' | 'number'>;
}) => {
  const format = schema.format;
  const isInteger = schema.type === 'integer';
  const isBigInt = needsBigIntForFormat(format);
  const formatInfo = isIntegerFormat(format) ? INTEGER_FORMATS[format] : null;

  // Return early if const is defined since we can create a literal type directly without additional validation
  if (schema.const !== undefined && schema.const !== null) {
    const constValue = schema.const;
    let literalValue;

    // Case 1: Number with no format -> generate literal with the number
    if (typeof constValue === 'number' && !format) {
      literalValue = tsc.ots.number(constValue);
    }
    // Case 2: Number with format -> check if format needs BigInt, generate appropriate literal
    else if (typeof constValue === 'number' && format) {
      if (isBigInt) {
        // Format requires BigInt, convert number to BigInt
        literalValue = tsc.callExpression({
          functionName: 'BigInt',
          parameters: [tsc.ots.string(constValue.toString())],
        });
      } else {
        // Regular format, use number as-is
        literalValue = tsc.ots.number(constValue);
      }
    }
    // Case 3: Format that allows string -> generate BigInt literal (for int64/uint64 formats)
    else if (typeof constValue === 'string' && isBigInt) {
      // Remove 'n' suffix if present in string
      const cleanString = constValue.endsWith('n')
        ? constValue.slice(0, -1)
        : constValue;
      literalValue = tsc.callExpression({
        functionName: 'BigInt',
        parameters: [tsc.ots.string(cleanString)],
      });
    }
    // Case 4: Const is typeof bigint (literal) -> transform from literal to BigInt()
    else if (typeof constValue === 'bigint') {
      // Convert BigInt to string and remove 'n' suffix that toString() adds
      const bigintString = constValue.toString();
      const cleanString = bigintString.endsWith('n')
        ? bigintString.slice(0, -1)
        : bigintString;
      literalValue = tsc.callExpression({
        functionName: 'BigInt',
        parameters: [tsc.ots.string(cleanString)],
      });
    }
    // Default case: use value as-is for other types
    else {
      literalValue = tsc.valueToExpression({ value: constValue });
    }

    return tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.schemas.literal,
      }),
      parameters: [literalValue],
    });
  }

  const pipes: Array<ts.CallExpression> = [];

  // For bigint formats (int64, uint64), create union of number, string, and bigint with transform
  if (isBigInt) {
    const unionExpression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.schemas.union,
      }),
      parameters: [
        tsc.arrayLiteralExpression({
          elements: [
            tsc.callExpression({
              functionName: tsc.propertyAccessExpression({
                expression: identifiers.v,
                name: identifiers.schemas.number,
              }),
            }),
            tsc.callExpression({
              functionName: tsc.propertyAccessExpression({
                expression: identifiers.v,
                name: identifiers.schemas.string,
              }),
            }),
            tsc.callExpression({
              functionName: tsc.propertyAccessExpression({
                expression: identifiers.v,
                name: identifiers.schemas.bigInt,
              }),
            }),
          ],
          multiLine: false,
        }),
      ],
    });
    pipes.push(unionExpression);

    // Add transform to convert to BigInt
    const transformExpression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.actions.transform,
      }),
      parameters: [
        tsc.arrowFunction({
          parameters: [{ name: 'x' }],
          statements: tsc.callExpression({
            functionName: 'BigInt',
            parameters: [tsc.identifier({ text: 'x' })],
          }),
        }),
      ],
    });
    pipes.push(transformExpression);
  } else {
    // For regular number formats, use number schema
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.schemas.number,
      }),
    });
    pipes.push(expression);
  }

  // Add integer validation for integer types (except when using bigint union)
  if (!isBigInt && isInteger) {
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.actions.integer,
      }),
    });
    pipes.push(expression);
  }

  // Add format-specific range validations
  if (formatInfo) {
    const minValue = formatInfo.min;
    const maxValue = formatInfo.max;
    const minErrorMessage = formatInfo.minError;
    const maxErrorMessage = formatInfo.maxError;

    // Add minimum value validation
    const minExpression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.actions.minValue,
      }),
      parameters: [
        isBigInt
          ? tsc.callExpression({
              functionName: 'BigInt',
              parameters: [tsc.ots.string(minValue.toString())],
            })
          : tsc.ots.number(minValue as number),
        tsc.ots.string(minErrorMessage),
      ],
    });
    pipes.push(minExpression);

    // Add maximum value validation
    const maxExpression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.actions.maxValue,
      }),
      parameters: [
        isBigInt
          ? tsc.callExpression({
              functionName: 'BigInt',
              parameters: [tsc.ots.string(maxValue.toString())],
            })
          : tsc.ots.number(maxValue as number),
        tsc.ots.string(maxErrorMessage),
      ],
    });
    pipes.push(maxExpression);
  }

  if (schema.exclusiveMinimum !== undefined) {
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.actions.gtValue,
      }),
      parameters: [
        numberParameter({ isBigInt, value: schema.exclusiveMinimum }),
      ],
    });
    pipes.push(expression);
  } else if (schema.minimum !== undefined) {
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.actions.minValue,
      }),
      parameters: [numberParameter({ isBigInt, value: schema.minimum })],
    });
    pipes.push(expression);
  }

  if (schema.exclusiveMaximum !== undefined) {
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.actions.ltValue,
      }),
      parameters: [
        numberParameter({ isBigInt, value: schema.exclusiveMaximum }),
      ],
    });
    pipes.push(expression);
  } else if (schema.maximum !== undefined) {
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
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
  plugin,
  schema,
  state,
}: {
  plugin: ValibotPlugin['Instance'];
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

    const schemaPipes = schemaToValibotSchema({
      optional: !isRequired,
      plugin,
      schema: property,
      state,
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
      tsc.propertyAssignment({
        initializer: pipesToExpression(schemaPipes),
        name: propertyName,
      }),
    );
  }

  if (
    schema.additionalProperties &&
    schema.additionalProperties.type === 'object' &&
    !Object.keys(properties).length
  ) {
    const pipes = schemaToValibotSchema({
      plugin,
      schema: schema.additionalProperties,
      state,
    });
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.schemas.record,
      }),
      parameters: [
        tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: identifiers.v,
            name: identifiers.schemas.string,
          }),
          parameters: [],
        }),
        pipesToExpression(pipes),
      ],
    });
    return {
      anyType: 'AnyZodObject',
      expression,
    };
  }

  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
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
  schema: SchemaWithType<'string'>;
}) => {
  if (typeof schema.const === 'string') {
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.schemas.literal,
      }),
      parameters: [tsc.ots.string(schema.const)],
    });
    return expression;
  }

  const pipes: Array<ts.CallExpression> = [];

  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: identifiers.v,
      name: identifiers.schemas.string,
    }),
  });
  pipes.push(expression);

  if (schema.format) {
    switch (schema.format) {
      case 'date':
        pipes.push(
          tsc.callExpression({
            functionName: tsc.propertyAccessExpression({
              expression: identifiers.v,
              name: identifiers.actions.isoDate,
            }),
          }),
        );
        break;
      case 'date-time':
        pipes.push(
          tsc.callExpression({
            functionName: tsc.propertyAccessExpression({
              expression: identifiers.v,
              name: identifiers.actions.isoTimestamp,
            }),
          }),
        );
        break;
      case 'ipv4':
      case 'ipv6':
        pipes.push(
          tsc.callExpression({
            functionName: tsc.propertyAccessExpression({
              expression: identifiers.v,
              name: identifiers.actions.ip,
            }),
          }),
        );
        break;
      case 'uri':
        pipes.push(
          tsc.callExpression({
            functionName: tsc.propertyAccessExpression({
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
          tsc.callExpression({
            functionName: tsc.propertyAccessExpression({
              expression: identifiers.v,
              name: tsc.identifier({ text: schema.format }),
            }),
          }),
        );
        break;
    }
  }

  if (schema.minLength === schema.maxLength && schema.minLength !== undefined) {
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.actions.length,
      }),
      parameters: [tsc.valueToExpression({ value: schema.minLength })],
    });
    pipes.push(expression);
  } else {
    if (schema.minLength !== undefined) {
      const expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: identifiers.v,
          name: identifiers.actions.minLength,
        }),
        parameters: [tsc.valueToExpression({ value: schema.minLength })],
      });
      pipes.push(expression);
    }

    if (schema.maxLength !== undefined) {
      const expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: identifiers.v,
          name: identifiers.actions.maxLength,
        }),
        parameters: [tsc.valueToExpression({ value: schema.maxLength })],
      });
      pipes.push(expression);
    }
  }

  if (schema.pattern) {
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.actions.regex,
      }),
      parameters: [tsc.regularExpressionLiteral({ text: schema.pattern })],
    });
    pipes.push(expression);
  }

  return pipesToExpression(pipes);
};

const tupleTypeToValibotSchema = ({
  plugin,
  schema,
  state,
}: {
  plugin: ValibotPlugin['Instance'];
  schema: SchemaWithType<'tuple'>;
  state: State;
}) => {
  if (schema.const && Array.isArray(schema.const)) {
    const tupleElements = schema.const.map((value) =>
      tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: identifiers.v,
          name: identifiers.schemas.literal,
        }),
        parameters: [tsc.valueToExpression({ value })],
      }),
    );
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.schemas.tuple,
      }),
      parameters: [
        tsc.arrayLiteralExpression({
          elements: tupleElements,
        }),
      ],
    });
    return expression;
  }

  if (schema.items) {
    const tupleElements = schema.items.map((item) => {
      const schemaPipes = schemaToValibotSchema({
        plugin,
        schema: item,
        state,
      });
      return pipesToExpression(schemaPipes);
    });
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: identifiers.v,
        name: identifiers.schemas.tuple,
      }),
      parameters: [
        tsc.arrayLiteralExpression({
          elements: tupleElements,
        }),
      ],
    });
    return expression;
  }

  return unknownTypeToValibotSchema({
    schema: {
      type: 'unknown',
    },
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const undefinedTypeToValibotSchema = (_props: {
  schema: SchemaWithType<'undefined'>;
}) => {
  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: identifiers.v,
      name: identifiers.schemas.undefined,
    }),
  });
  return expression;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const unknownTypeToValibotSchema = (_props: {
  schema: SchemaWithType<'unknown'>;
}) => {
  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: identifiers.v,
      name: identifiers.schemas.unknown,
    }),
  });
  return expression;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const voidTypeToValibotSchema = (_props: {
  schema: SchemaWithType<'void'>;
}) => {
  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: identifiers.v,
      name: identifiers.schemas.void,
    }),
  });
  return expression;
};

const schemaTypeToValibotSchema = ({
  plugin,
  schema,
  state,
}: {
  plugin: ValibotPlugin['Instance'];
  schema: IR.SchemaObject;
  state: State;
}): {
  anyType?: string;
  expression: ts.Expression;
} => {
  switch (schema.type as Required<IR.SchemaObject>['type']) {
    case 'array':
      return {
        expression: arrayTypeToValibotSchema({
          plugin,
          schema: schema as SchemaWithType<'array'>,
          state,
        }),
      };
    case 'boolean':
      return {
        expression: booleanTypeToValibotSchema({
          schema: schema as SchemaWithType<'boolean'>,
        }),
      };
    case 'enum':
      return {
        expression: enumTypeToValibotSchema({
          schema: schema as SchemaWithType<'enum'>,
        }),
      };
    case 'integer':
    case 'number':
      return {
        expression: numberTypeToValibotSchema({
          schema: schema as SchemaWithType<'integer' | 'number'>,
        }),
      };
    case 'never':
      return {
        expression: neverTypeToValibotSchema({
          schema: schema as SchemaWithType<'never'>,
        }),
      };
    case 'null':
      return {
        expression: nullTypeToValibotSchema({
          schema: schema as SchemaWithType<'null'>,
        }),
      };
    case 'object':
      return objectTypeToValibotSchema({
        plugin,
        schema: schema as SchemaWithType<'object'>,
        state,
      });
    case 'string':
      // For string schemas with int64/uint64 formats, use number handler to generate union with transform
      if (schema.format === 'int64' || schema.format === 'uint64') {
        return {
          expression: numberTypeToValibotSchema({
            schema: schema as SchemaWithType<'integer' | 'number'>,
          }),
        };
      }
      return {
        expression: stringTypeToValibotSchema({
          schema: schema as SchemaWithType<'string'>,
        }),
      };
    case 'tuple':
      return {
        expression: tupleTypeToValibotSchema({
          plugin,
          schema: schema as SchemaWithType<'tuple'>,
          state,
        }),
      };
    case 'undefined':
      return {
        expression: undefinedTypeToValibotSchema({
          schema: schema as SchemaWithType<'undefined'>,
        }),
      };
    case 'unknown':
      return {
        expression: unknownTypeToValibotSchema({
          schema: schema as SchemaWithType<'unknown'>,
        }),
      };
    case 'void':
      return {
        expression: voidTypeToValibotSchema({
          schema: schema as SchemaWithType<'void'>,
        }),
      };
  }
};

export const schemaToValibotSchema = ({
  $ref,
  identifier: _identifier,
  optional,
  plugin,
  schema,
  state,
}: {
  /**
   * When $ref is supplied, a node will be emitted to the file.
   */
  $ref?: string;
  identifier?: Identifier;
  /**
   * Accept `optional` to handle optional object properties. We can't handle
   * this inside the object function because `.optional()` must come before
   * `.default()` which is handled in this function.
   */
  optional?: boolean;
  plugin: ValibotPlugin['Instance'];
  schema: IR.SchemaObject;
  state: State;
}): Array<ts.Expression> => {
  const file = plugin.context.file({ id: valibotId })!;

  let anyType: string | undefined;
  let identifier: ReturnType<typeof file.identifier> | undefined = _identifier;
  let pipes: Array<ts.Expression> = [];

  if ($ref) {
    state.circularReferenceTracker.add($ref);

    if (!identifier) {
      identifier = file.identifier({
        $ref,
        case: state.nameCase,
        create: true,
        nameTransformer: state.nameTransformer,
        namespace: 'value',
      });
    }
  }

  if (schema.$ref) {
    const isCircularReference = state.circularReferenceTracker.has(schema.$ref);

    // if $ref hasn't been processed yet, inline it to avoid the
    // "Block-scoped variable used before its declaration." error
    // this could be (maybe?) fixed by reshuffling the generation order
    let identifierRef = file.identifier({
      $ref: schema.$ref,
      case: state.nameCase,
      nameTransformer: state.nameTransformer,
      namespace: 'value',
    });

    if (!identifierRef.name) {
      const ref = plugin.context.resolveIrRef<IR.SchemaObject>(schema.$ref);
      const schemaPipes = schemaToValibotSchema({
        $ref: schema.$ref,
        plugin,
        schema: ref,
        state,
      });
      pipes.push(...schemaPipes);

      identifierRef = file.identifier({
        $ref: schema.$ref,
        case: state.nameCase,
        nameTransformer: state.nameTransformer,
        namespace: 'value',
      });
    }

    // if `identifierRef.name` is falsy, we already set expression above
    if (identifierRef.name) {
      const refIdentifier = tsc.identifier({ text: identifierRef.name });
      if (isCircularReference) {
        const lazyExpression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: identifiers.v,
            name: identifiers.schemas.lazy,
          }),
          parameters: [
            tsc.arrowFunction({
              statements: [
                tsc.returnStatement({
                  expression: refIdentifier,
                }),
              ],
            }),
          ],
        });
        pipes.push(lazyExpression);
        state.hasCircularReference = true;
      } else {
        pipes.push(refIdentifier);
      }
    }
  } else if (schema.type) {
    const valibotSchema = schemaTypeToValibotSchema({ plugin, schema, state });
    anyType = valibotSchema.anyType;
    pipes.push(valibotSchema.expression);

    if (plugin.config.metadata && schema.description) {
      const expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: identifiers.v,
          name: identifiers.actions.metadata,
        }),
        parameters: [
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
      pipes.push(expression);
    }
  } else if (schema.items) {
    schema = deduplicateSchema({ schema });

    if (schema.items) {
      const itemTypes = schema.items.map((item) => {
        const schemaPipes = schemaToValibotSchema({
          plugin,
          schema: item,
          state,
        });
        return pipesToExpression(schemaPipes);
      });

      if (schema.logicalOperator === 'and') {
        const intersectExpression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: identifiers.v,
            name: identifiers.schemas.intersect,
          }),
          parameters: [
            tsc.arrayLiteralExpression({
              elements: itemTypes,
            }),
          ],
        });
        pipes.push(intersectExpression);
      } else {
        const unionExpression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: identifiers.v,
            name: identifiers.schemas.union,
          }),
          parameters: [
            tsc.arrayLiteralExpression({
              elements: itemTypes,
            }),
          ],
        });
        pipes.push(unionExpression);
      }
    } else {
      const schemaPipes = schemaToValibotSchema({
        plugin,
        schema,
        state,
      });
      pipes.push(...schemaPipes);
    }
  } else {
    // catch-all fallback for failed schemas
    const valibotSchema = schemaTypeToValibotSchema({
      plugin,
      schema: {
        type: 'unknown',
      },
      state,
    });
    anyType = valibotSchema.anyType;
    pipes.push(valibotSchema.expression);
  }

  if ($ref) {
    state.circularReferenceTracker.delete($ref);
  }

  if (pipes.length) {
    if (schema.accessScope === 'read') {
      const readonlyExpression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
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
          tsc.callExpression({
            functionName: tsc.propertyAccessExpression({
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
        tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
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
    const statement = tsc.constVariable({
      comment: plugin.config.comments
        ? createSchemaComment({ schema })
        : undefined,
      exportConst: true,
      expression: pipesToExpression(pipes),
      name: identifier.name,
      typeName: state.hasCircularReference
        ? (tsc.propertyAccessExpression({
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

export const handler: ValibotPlugin['Handler'] = ({ plugin }) => {
  const file = plugin.createFile({
    case: plugin.config.case,
    id: valibotId,
    path: plugin.output,
  });

  file.import({
    alias: identifiers.v.text,
    module: 'valibot',
    name: '*',
  });

  plugin.forEach(
    'operation',
    'parameter',
    'requestBody',
    'schema',
    'webhook',
    (event) => {
      const state: State = {
        circularReferenceTracker: new Set(),
        hasCircularReference: false,
        nameCase: plugin.config.definitions.case,
        nameTransformer: plugin.config.definitions.name,
      };

      if (event.type === 'operation') {
        operationToValibotSchema({
          operation: event.operation,
          plugin,
          state,
        });
      } else if (event.type === 'parameter') {
        schemaToValibotSchema({
          $ref: event.$ref,
          plugin,
          schema: event.parameter.schema,
          state,
        });
      } else if (event.type === 'requestBody') {
        schemaToValibotSchema({
          $ref: event.$ref,
          plugin,
          schema: event.requestBody.schema,
          state,
        });
      } else if (event.type === 'schema') {
        schemaToValibotSchema({
          $ref: event.$ref,
          plugin,
          schema: event.schema,
          state,
        });
      } else if (event.type === 'webhook') {
        webhookToValibotSchema({
          operation: event.operation,
          plugin,
          state,
        });
      }
    },
  );
};

import type ts from 'typescript';

import { compiler } from '../../compiler';
import type { IRContext } from '../../ir/context';
import type { IRSchemaObject } from '../../ir/ir';
import { deduplicateSchema } from '../../ir/schema';
import { isRefOpenApiComponent } from '../../utils/ref';
import type { PluginHandler } from '../types';
import type { Config } from './types';

interface SchemaWithType<T extends Required<IRSchemaObject>['type']>
  extends Omit<IRSchemaObject, 'type'> {
  type: Extract<Required<IRSchemaObject>['type'], T>;
}

const zodId = 'zod';

const arrayTypeToZodSchema = ({
  context,
  namespace,
  schema,
}: {
  context: IRContext;
  namespace: Array<ts.Statement>;
  schema: SchemaWithType<'array'>;
}) => {
  if (!schema.items) {
    const expression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: 'z',
        name: 'array',
      }),
      parameters: [
        unknownTypeToZodSchema({
          context,
          namespace,
          schema: {
            type: 'unknown',
          },
        }),
      ],
    });
    return expression;
  }

  schema = deduplicateSchema({ schema });

  // at least one item is guaranteed
  const itemExpressions = schema.items!.map((item) =>
    schemaToZodSchema({
      context,
      namespace,
      schema: item,
    }),
  );

  if (itemExpressions.length === 1) {
    const expression = compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: 'z',
        name: 'array',
      }),
      parameters: itemExpressions,
    });
    return expression;
  }

  if (schema.logicalOperator === 'and') {
    // TODO: parser - handle intersection
    // return compiler.typeArrayNode(
    //   compiler.typeIntersectionNode({ types: itemExpressions }),
    // );
  }

  // TODO: parser - handle union
  // return compiler.typeArrayNode(compiler.typeUnionNode({ types: itemExpressions }));

  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: 'z',
      name: 'array',
    }),
    parameters: [
      unknownTypeToZodSchema({
        context,
        namespace,
        schema: {
          type: 'unknown',
        },
      }),
    ],
  });
  return expression;
};

const booleanTypeToZodSchema = ({
  schema,
}: {
  context: IRContext;
  namespace: Array<ts.Statement>;
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
      expression: 'z',
      name: 'boolean',
    }),
  });
  return expression;
};

const neverTypeToZodSchema = ({
  schema,
}: {
  context: IRContext;
  namespace: Array<ts.Statement>;
  schema: SchemaWithType<'never'>;
}) => {
  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: 'z',
      name: schema.type,
    }),
  });
  return expression;
};

const nullTypeToZodSchema = ({
  schema,
}: {
  context: IRContext;
  namespace: Array<ts.Statement>;
  schema: SchemaWithType<'null'>;
}) => {
  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: 'z',
      name: schema.type,
    }),
  });
  return expression;
};

const numberTypeToZodSchema = ({
  schema,
}: {
  context: IRContext;
  namespace: Array<ts.Statement>;
  schema: SchemaWithType<'number'>;
}) => {
  // TODO: parser - handle min/max length

  if (schema.const !== undefined) {
    // TODO: parser - add constant
    // return compiler.literalTypeNode({
    //   literal: compiler.ots.number(schema.const as number),
    // });
  }

  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: 'z',
      name: 'number',
    }),
  });
  return expression;
};

const objectTypeToZodSchema = ({
  // context,
  // namespace,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  schema,
}: {
  context: IRContext;
  namespace: Array<ts.Statement>;
  schema: SchemaWithType<'object'>;
}) => {
  // let indexProperty: Property | undefined;
  // const schemaProperties: Array<Property> = [];
  // let indexPropertyItems: Array<IRSchemaObject> = [];
  // const required = schema.required ?? [];
  // let hasOptionalProperties = false;

  // for (const name in schema.properties) {
  // const property = schema.properties[name];
  // const isRequired = required.includes(name);
  // digitsRegExp.lastIndex = 0;
  // schemaProperties.push({
  //   comment: parseSchemaJsDoc({ schema: property }),
  //   isReadOnly: property.accessScope === 'read',
  //   isRequired,
  //   name: digitsRegExp.test(name)
  //     ? ts.factory.createNumericLiteral(name)
  //     : name,
  //   type: schemaToZodSchema({
  //     $ref: `${irRef}${name}`,
  //     context,
  //     namespace,
  //     schema: property,
  //   }),
  // });
  // // indexPropertyItems.push(property);
  // if (!isRequired) {
  //   hasOptionalProperties = true;
  // }
  // }

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
  //       namespace,
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
      expression: 'z',
      name: 'object',
    }),
    parameters: [
      // TODO: parser - handle parameters
      compiler.objectExpression({
        multiLine: true,
        obj: [],
      }),
    ],
  });
  return expression;
};

const stringTypeToZodSchema = ({
  schema,
}: {
  context: IRContext;
  namespace: Array<ts.Statement>;
  schema: SchemaWithType<'string'>;
}) => {
  if (schema.const !== undefined) {
    // TODO: parser - add constant
    // return compiler.literalTypeNode({
    //   literal: compiler.stringLiteral({ text: schema.const as string }),
    // });
  }

  if (schema.format) {
    // TODO: parser - add format
    // if (schema.format === 'binary') {
    //   return compiler.typeUnionNode({
    //     types: [
    //       compiler.typeReferenceNode({
    //         typeName: 'Blob',
    //       }),
    //       compiler.typeReferenceNode({
    //         typeName: 'File',
    //       }),
    //     ],
    //   });
    // }
    // if (schema.format === 'date-time' || schema.format === 'date') {
    //   // TODO: parser - add ability to skip type transformers
    //   if (context.config.plugins['@hey-api/transformers']?.dates) {
    //     return compiler.typeReferenceNode({ typeName: 'Date' });
    //   }
    // }
  }

  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: 'z',
      name: 'string',
    }),
  });
  return expression;
};

const undefinedTypeToZodSchema = ({
  schema,
}: {
  context: IRContext;
  namespace: Array<ts.Statement>;
  schema: SchemaWithType<'undefined'>;
}) => {
  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: 'z',
      name: schema.type,
    }),
  });
  return expression;
};

const unknownTypeToZodSchema = ({
  schema,
}: {
  context: IRContext;
  namespace: Array<ts.Statement>;
  schema: SchemaWithType<'unknown'>;
}) => {
  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: 'z',
      name: schema.type,
    }),
  });
  return expression;
};

const voidTypeToZodSchema = ({
  schema,
}: {
  context: IRContext;
  namespace: Array<ts.Statement>;
  schema: SchemaWithType<'void'>;
}) => {
  const expression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: 'z',
      name: schema.type,
    }),
  });
  return expression;
};

const schemaTypeToZodSchema = ({
  // $ref,
  context,
  namespace,
  schema,
}: {
  $ref?: string;
  context: IRContext;
  namespace: Array<ts.Statement>;
  schema: IRSchemaObject;
  // @ts-expect-error
}): ts.Expression => {
  switch (schema.type as Required<IRSchemaObject>['type']) {
    case 'array':
      return arrayTypeToZodSchema({
        context,
        namespace,
        schema: schema as SchemaWithType<'array'>,
      });
    case 'boolean':
      return booleanTypeToZodSchema({
        context,
        namespace,
        schema: schema as SchemaWithType<'boolean'>,
      });
    case 'enum':
      // TODO: parser - handle enum
      // return enumTypeToIdentifier({
      //   $ref,
      //   context,
      //   namespace,
      //   schema: schema as SchemaWithType<'enum'>,
      // });
      break;
    case 'never':
      return neverTypeToZodSchema({
        context,
        namespace,
        schema: schema as SchemaWithType<'never'>,
      });
    case 'null':
      return nullTypeToZodSchema({
        context,
        namespace,
        schema: schema as SchemaWithType<'null'>,
      });
    case 'number':
      return numberTypeToZodSchema({
        context,
        namespace,
        schema: schema as SchemaWithType<'number'>,
      });
    case 'object':
      return objectTypeToZodSchema({
        context,
        namespace,
        schema: schema as SchemaWithType<'object'>,
      });
    case 'string':
      return stringTypeToZodSchema({
        context,
        namespace,
        schema: schema as SchemaWithType<'string'>,
      });
    case 'tuple':
      // TODO: parser - handle tuple
      // return tupleTypeToIdentifier({
      //   context,
      //   namespace,
      //   schema: schema as SchemaWithType<'tuple'>,
      // });
      break;
    case 'undefined':
      return undefinedTypeToZodSchema({
        context,
        namespace,
        schema: schema as SchemaWithType<'undefined'>,
      });
    case 'unknown':
      return unknownTypeToZodSchema({
        context,
        namespace,
        schema: schema as SchemaWithType<'unknown'>,
      });
    case 'void':
      return voidTypeToZodSchema({
        context,
        namespace,
        schema: schema as SchemaWithType<'void'>,
      });
  }
};

const schemaToZodSchema = ({
  $ref,
  context,
  // TODO: parser - remove namespace, it's a type plugin construct
  namespace = [],
  schema,
}: {
  $ref?: string;
  context: IRContext;
  namespace?: Array<ts.Statement>;
  schema: IRSchemaObject;
}): ts.Expression => {
  const file = context.file({ id: zodId })!;

  let expression: ts.Expression | undefined;

  if (schema.$ref) {
    // if $ref hasn't been processed yet, inline it to avoid the
    // "Block-scoped variable used before its declaration." error
    // this could be (maybe?) fixed by reshuffling the generation order
    const identifier = file.identifier({
      $ref: schema.$ref,
      namespace: 'value',
    });
    if (identifier.name) {
      expression = compiler.identifier({ text: identifier.name || '' });
    } else {
      const ref = context.resolveIrRef<IRSchemaObject>(schema.$ref);
      expression = schemaToZodSchema({
        context,
        schema: ref,
      });
    }
  } else if (schema.type) {
    expression = schemaTypeToZodSchema({
      $ref,
      context,
      namespace,
      schema,
    });
  } else if (schema.items) {
    // TODO: parser - handle items
    // schema = deduplicateSchema({ schema });
    // if (schema.items) {
    //   const itemTypes = schema.items.map((item) =>
    //     schemaToZodSchema({
    //       context,
    //       namespace,
    //       schema: item,
    //     }),
    //   );
    //   expression =
    //     schema.logicalOperator === 'and'
    //       ? compiler.typeIntersectionNode({ types: itemTypes })
    //       : compiler.typeUnionNode({ types: itemTypes });
    // } else {
    //   expression = schemaToZodSchema({
    //     context,
    //     namespace,
    //     schema,
    //   });
    // }
  } else {
    // catch-all fallback for failed schemas
    expression = schemaTypeToZodSchema({
      context,
      namespace,
      schema: {
        type: 'unknown',
      },
    });
  }

  // emit nodes only if $ref points to a reusable component
  if ($ref && isRefOpenApiComponent($ref) && expression) {
    // enum handler emits its own artifacts
    if (schema.type !== 'enum') {
      const identifier = file.identifier({
        $ref,
        create: true,
        namespace: 'value',
      });
      const statement = compiler.constVariable({
        exportConst: true,
        expression,
        name: identifier.name || '',
      });
      file.add(statement);
    }
  }

  // @ts-expect-error
  return expression;
};

export const handler: PluginHandler<Config> = ({ context, plugin }) => {
  const file = context.createFile({
    id: zodId,
    path: plugin.output,
  });

  file.import({
    module: 'zod',
    name: 'z',
  });

  context.subscribe('schema', ({ $ref, schema }) => {
    schemaToZodSchema({
      $ref,
      context,
      schema,
    });
  });
};

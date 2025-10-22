import { deduplicateSchema } from '../../../ir/schema';
import type { IR } from '../../../ir/types';
import { buildName } from '../../../openApi/shared/utils/name';
import { tsc } from '../../../tsc';
import { refToName } from '../../../utils/ref';
import type { SchemaWithType } from '../../shared/types/schema';
import { pathToSymbolResourceType } from '../../shared/utils/meta';
import { toRefs } from '../../shared/utils/refs';
import { exportAst } from '../shared/export';
import type { Ast, IrSchemaToAstOptions } from '../shared/types';
import type { ArktypePlugin } from '../types';
import { irSchemaWithTypeToAst } from './toAst';

export const irSchemaToAst = ({
  // optional,
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  /**
   * Accept `optional` to handle optional object properties. We can't handle
   * this inside the object function because `.optional()` must come before
   * `.default()` which is handled in this function.
   */
  optional?: boolean;
  schema: IR.SchemaObject;
}): Ast => {
  let ast: Partial<Ast> = {};

  // const z = plugin.referenceSymbol(plugin.api.selector('external', 'zod.z'));

  if (schema.$ref) {
    const selector = plugin.api.selector('ref', schema.$ref);
    const refSymbol = plugin.referenceSymbol(selector);
    if (plugin.isSymbolRegistered(selector)) {
      const ref = tsc.identifier({ text: refSymbol.placeholder });
      ast.expression = ref;
    } else {
      const lazyExpression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          // expression: z.placeholder,
          expression: 'TODO',
          name: 'TODO',
          // name: identifiers.lazy,
        }),
        parameters: [
          tsc.arrowFunction({
            returnType: tsc.keywordTypeNode({ keyword: 'any' }),
            statements: [
              tsc.returnStatement({
                expression: tsc.identifier({ text: refSymbol.placeholder }),
              }),
            ],
          }),
        ],
      });
      ast.expression = lazyExpression;
      ast.hasLazyExpression = true;
      state.hasLazyExpression.value = true;
    }
  } else if (schema.type) {
    const typeAst = irSchemaWithTypeToAst({
      plugin,
      schema: schema as SchemaWithType,
      state,
    });
    ast.def = typeAst.def;
    ast.expression = typeAst.expression;
    ast.hasLazyExpression = typeAst.hasLazyExpression;

    if (plugin.config.metadata && schema.description) {
      // TODO: add description
      // ast.expression = tsc.callExpression({
      //   functionName: tsc.propertyAccessExpression({
      //     expression: ast.expression,
      //     name: identifiers.register,
      //   }),
      //   parameters: [
      //     tsc.propertyAccessExpression({
      //       expression: z.placeholder,
      //       name: identifiers.globalRegistry,
      //     }),
      //     tsc.objectExpression({
      //       obj: [
      //         {
      //           key: 'description',
      //           value: tsc.stringLiteral({ text: schema.description }),
      //         },
      //       ],
      //     }),
      //   ],
      // });
    }
  } else if (schema.items) {
    schema = deduplicateSchema({ schema });

    if (schema.items) {
      //     const itemSchemas = schema.items.map((item, index) =>
      //       irSchemaToAst({
      //         plugin,
      //         schema: item,
      //         state: {
      //           ...state,
      //           _path: [...state._path, 'items', index],
      //         },
      //       }),
      //     );
      //     if (schema.logicalOperator === 'and') {
      //       const firstSchema = schema.items[0]!;
      //       // we want to add an intersection, but not every schema can use the same API.
      //       // if the first item contains another array or not an object, we cannot use
      //       // `.merge()` as that does not exist on `.union()` and non-object schemas.
      //       if (
      //         firstSchema.logicalOperator === 'or' ||
      //         (firstSchema.type && firstSchema.type !== 'object')
      //       ) {
      //         ast.expression = tsc.callExpression({
      //           functionName: tsc.propertyAccessExpression({
      //             expression: z.placeholder,
      //             name: identifiers.intersection,
      //           }),
      //           parameters: itemSchemas.map((schema) => schema.expression),
      //         });
      //       } else {
      //         ast.expression = itemSchemas[0]!.expression;
      //         itemSchemas.slice(1).forEach((schema) => {
      //           ast.expression = tsc.callExpression({
      //             functionName: tsc.propertyAccessExpression({
      //               expression: ast.expression!,
      //               name: identifiers.and,
      //             }),
      //             parameters: [
      //               schema.hasCircularReference
      //                 ? tsc.callExpression({
      //                     functionName: tsc.propertyAccessExpression({
      //                       expression: z.placeholder,
      //                       name: identifiers.lazy,
      //                     }),
      //                     parameters: [
      //                       tsc.arrowFunction({
      //                         statements: [
      //                           tsc.returnStatement({
      //                             expression: schema.expression,
      //                           }),
      //                         ],
      //                       }),
      //                     ],
      //                   })
      //                 : schema.expression,
      //             ],
      //           });
      //         });
      //       }
      //     } else {
      //       ast.expression = tsc.callExpression({
      //         functionName: tsc.propertyAccessExpression({
      //           expression: z.placeholder,
      //           name: identifiers.union,
      //         }),
      //         parameters: [
      //           tsc.arrayLiteralExpression({
      //             elements: itemSchemas.map((schema) => schema.expression),
      //           }),
      //         ],
      //       });
      //     }
    } else {
      ast = irSchemaToAst({ plugin, schema, state });
    }
  } else {
    // catch-all fallback for failed schemas
    const typeAst = irSchemaWithTypeToAst({
      plugin,
      schema: {
        type: 'unknown',
      },
      state,
    });
    ast.def = typeAst.def;
    ast.expression = typeAst.expression;
  }

  // TODO: remove later
  if (!ast.expression) {
    const typeAst = irSchemaWithTypeToAst({
      plugin,
      schema: {
        type: 'unknown',
      },
      state,
    });
    ast.expression = typeAst.expression;
  }
  // END TODO: remove later

  // if (ast.expression) {
  //   if (schema.accessScope === 'read') {
  //     ast.expression = tsc.callExpression({
  //       functionName: tsc.propertyAccessExpression({
  //         expression: ast.expression,
  //         name: identifiers.readonly,
  //       }),
  //     });
  //   }

  //   if (optional) {
  //     ast.expression = tsc.callExpression({
  //       functionName: tsc.propertyAccessExpression({
  //         expression: z.placeholder,
  //         name: identifiers.optional,
  //       }),
  //       parameters: [ast.expression],
  //     });
  //     ast.typeName = identifiers.ZodOptional;
  //   }

  //   if (schema.default !== undefined) {
  //     const isBigInt = schema.type === 'integer' && schema.format === 'int64';
  //     const callParameter = numberParameter({
  //       isBigInt,
  //       value: schema.default,
  //     });
  //     if (callParameter) {
  //       ast.expression = tsc.callExpression({
  //         functionName: tsc.propertyAccessExpression({
  //           expression: ast.expression,
  //           name: identifiers.default,
  //         }),
  //         parameters: [callParameter],
  //       });
  //     }
  //   }
  // }

  return ast as Ast;
};

const handleComponent = ({
  $ref,
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  $ref: string;
  schema: IR.SchemaObject;
}): void => {
  const ast = irSchemaToAst({ plugin, schema, state });
  const baseName = refToName($ref);
  const resourceType = pathToSymbolResourceType(state._path.value);
  const symbol = plugin.registerSymbol({
    exported: true,
    meta: {
      resourceType,
    },
    name: buildName({
      config: plugin.config.definitions,
      name: baseName,
    }),
    selector: plugin.api.selector('ref', $ref),
  });
  const typeInferSymbol = plugin.config.definitions.types.infer.enabled
    ? plugin.registerSymbol({
        exported: true,
        meta: {
          kind: 'type',
          resourceType,
        },
        name: buildName({
          config: plugin.config.definitions.types.infer,
          name: baseName,
        }),
        selector: plugin.api.selector('type-infer-ref', $ref),
      })
    : undefined;
  exportAst({
    ast,
    plugin,
    schema,
    symbol,
    typeInferSymbol,
  });
};

export const handlerV2: ArktypePlugin['Handler'] = ({ plugin }) => {
  plugin.registerSymbol({
    external: 'arktype',
    name: 'type',
    selector: plugin.api.selector('external', 'arktype.type'),
  });

  plugin.forEach(
    'operation',
    'parameter',
    'requestBody',
    'schema',
    'webhook',
    (event) => {
      switch (event.type) {
        //   case 'operation':
        //     operationToZodSchema({
        //       getZodSchema: (schema) => {
        //         const state: State = {
        //           circularReferenceTracker: [],
        //           currentReferenceTracker: [],
        //           hasCircularReference: false,
        //         };
        //         return schemaToZodSchema({ plugin, schema, state });
        //       },
        //       operation: event.operation,
        //       plugin,
        //     });
        //     break;
        case 'parameter':
          handleComponent({
            $ref: event.$ref,
            plugin,
            schema: event.parameter.schema,
            state: toRefs({
              _path: event._path,
              hasLazyExpression: false,
            }),
          });
          break;
        case 'requestBody':
          handleComponent({
            $ref: event.$ref,
            plugin,
            schema: event.requestBody.schema,
            state: toRefs({
              _path: event._path,
              hasLazyExpression: false,
            }),
          });
          break;
        case 'schema':
          handleComponent({
            $ref: event.$ref,
            plugin,
            schema: event.schema,
            state: toRefs({
              _path: event._path,
              hasLazyExpression: false,
            }),
          });
          break;
        //   case 'webhook':
        //     webhookToZodSchema({
        //       getZodSchema: (schema) => {
        //         const state: State = {
        //           circularReferenceTracker: [],
        //           currentReferenceTracker: [],
        //           hasCircularReference: false,
        //         };
        //         return schemaToZodSchema({ plugin, schema, state });
        //       },
        //       operation: event.operation,
        //       plugin,
        //     });
        //     break;
      }
    },
  );
};

import type { SymbolMeta } from '@hey-api/codegen-core';
import { fromRef, refs } from '@hey-api/codegen-core';
import type { IR, SchemaWithType } from '@hey-api/shared';
import { applyNaming, deduplicateSchema, pathToJsonPointer, refToName } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import { exportAst } from '../shared/export';
import type { Ast, IrSchemaToAstOptions, PluginState } from '../shared/types';
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

  // const z = plugin.referenceSymbol({
  //   category: 'external',
  //   resource: 'arktype.type',
  // });

  if (schema.$ref) {
    const query: SymbolMeta = {
      category: 'schema',
      resource: 'definition',
      resourceId: schema.$ref,
      tool: 'arktype',
    };
    const refSymbol = plugin.referenceSymbol(query);
    if (plugin.isSymbolRegistered(query)) {
      const ref = $(refSymbol);
      ast.expression = ref;
    } else {
      // expression: z,
      // name: identifiers.lazy,
      const lazyExpression = $('TODO')
        .attr('TODO')
        .call($.func().returns('any').do($.return(refSymbol)));
      ast.expression = lazyExpression;
      ast.hasLazyExpression = true;
      state.hasLazyExpression['~ref'] = true;
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
      //       expression: z,
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
      //             expression: z,
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
      //                       expression: z,
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
      //           expression: z,
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
  //         expression: z,
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
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: IR.SchemaObject;
}): void => {
  const $ref = pathToJsonPointer(fromRef(state.path));
  const ast = irSchemaToAst({ plugin, schema, state });
  const baseName = refToName($ref);
  const symbol = plugin.symbol(applyNaming(baseName, plugin.config.definitions), {
    meta: {
      category: 'schema',
      path: fromRef(state.path),
      resource: 'definition',
      resourceId: $ref,
      tags: fromRef(state.tags),
      tool: 'arktype',
    },
  });
  const typeInferSymbol = plugin.config.definitions.types.infer.enabled
    ? plugin.symbol(applyNaming(baseName, plugin.config.definitions.types.infer), {
        meta: {
          category: 'type',
          path: fromRef(state.path),
          resource: 'definition',
          resourceId: $ref,
          tool: 'arktype',
          variant: 'infer',
        },
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
  plugin.symbol('type', {
    external: 'arktype',
    meta: {
      category: 'external',
      resource: 'arktype.type',
    },
  });

  plugin.forEach('operation', 'parameter', 'requestBody', 'schema', 'webhook', (event) => {
    const state = refs<PluginState>({
      hasLazyExpression: false,
      path: event._path,
      tags: event.tags,
    });
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
          plugin,
          schema: event.parameter.schema,
          state,
        });
        break;
      case 'requestBody':
        handleComponent({
          plugin,
          schema: event.requestBody.schema,
          state,
        });
        break;
      case 'schema':
        handleComponent({
          plugin,
          schema: event.schema,
          state,
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
  });
};

import { deduplicateSchema } from '../../../ir/schema';
import type { IR } from '../../../ir/types';
import { buildName } from '../../../openApi/shared/utils/name';
import { tsc } from '../../../tsc';
import { jsonPointerToPath, refToName } from '../../../utils/ref';
import type { SchemaWithType } from '../../shared/types/schema';
import { pathToSymbolResourceType } from '../../shared/utils/meta';
import { identifiers } from '../constants';
import { exportAst } from '../shared/export';
import { getZodModule } from '../shared/module';
import { numberParameter } from '../shared/numbers';
import { irOperationToAst } from '../shared/operation';
import type { Ast, IrSchemaToAstOptions } from '../shared/types';
import { irWebhookToAst } from '../shared/webhook';
import type { ZodPlugin } from '../types';
import { irSchemaWithTypeToAst } from './toAst';

export const irSchemaToAst = ({
  optional,
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

  const z = plugin.referenceSymbol(plugin.api.selector('external', 'zod.z'));

  if (schema.$ref) {
    const isCircularReference = state.circularReferenceTracker.includes(
      schema.$ref,
    );
    const isSelfReference = state.currentReferenceTracker.includes(schema.$ref);
    state.circularReferenceTracker.push(schema.$ref);
    state.currentReferenceTracker.push(schema.$ref);

    const selector = plugin.api.selector('ref', schema.$ref);
    let symbol = plugin.getSymbol(selector);

    if (isCircularReference) {
      if (!symbol) {
        symbol = plugin.referenceSymbol(selector);
      }

      if (isSelfReference) {
        ast.expression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: z.placeholder,
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
        ast.expression = tsc.identifier({ text: symbol.placeholder });
      }
      ast.hasCircularReference = schema.circular;
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
          state: {
            ...state,
            _path: jsonPointerToPath(schema.$ref),
          },
        });
      } else {
        ast.hasCircularReference = schema.circular;
      }

      const refSymbol = plugin.referenceSymbol(selector);
      ast.expression = tsc.identifier({ text: refSymbol.placeholder });
    }

    state.circularReferenceTracker.pop();
    state.currentReferenceTracker.pop();
  } else if (schema.type) {
    const typeAst = irSchemaWithTypeToAst({
      plugin,
      schema: schema as SchemaWithType,
      state,
    });
    ast.expression = typeAst.expression;
    ast.hasCircularReference = typeAst.hasCircularReference;

    if (plugin.config.metadata && schema.description) {
      ast.expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: ast.expression,
          name: identifiers.register,
        }),
        parameters: [
          tsc.propertyAccessExpression({
            expression: z.placeholder,
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
      const itemSchemas = schema.items.map((item, index) =>
        irSchemaToAst({
          plugin,
          schema: item,
          state: {
            ...state,
            _path: [...state._path, 'items', index],
          },
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
          ast.expression = tsc.callExpression({
            functionName: tsc.propertyAccessExpression({
              expression: z.placeholder,
              name: identifiers.intersection,
            }),
            parameters: itemSchemas.map((schema) => schema.expression),
          });
        } else {
          ast.expression = itemSchemas[0]!.expression;
          itemSchemas.slice(1).forEach((schema) => {
            ast.expression = tsc.callExpression({
              functionName: tsc.propertyAccessExpression({
                expression: z.placeholder,
                name: identifiers.intersection,
              }),
              parameters: [
                ast.expression,
                schema.hasCircularReference
                  ? tsc.callExpression({
                      functionName: tsc.propertyAccessExpression({
                        expression: z.placeholder,
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
        ast.expression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: z.placeholder,
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
    ast.expression = typeAst.expression;
  }

  if (ast.expression) {
    if (schema.accessScope === 'read') {
      ast.expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: z.placeholder,
          name: identifiers.readonly,
        }),
        parameters: [ast.expression],
      });
    }

    if (optional) {
      ast.expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: z.placeholder,
          name: identifiers.optional,
        }),
        parameters: [ast.expression],
      });
      ast.typeName = identifiers.ZodMiniOptional;
    }

    if (schema.default !== undefined) {
      const isBigInt = schema.type === 'integer' && schema.format === 'int64';
      const callParameter = numberParameter({
        isBigInt,
        value: schema.default,
      });
      if (callParameter) {
        ast.expression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: z.placeholder,
            name: identifiers._default,
          }),
          parameters: [ast.expression, callParameter],
        });
      }
    }
  }

  return ast as Ast;
};

const handleComponent = ({
  id,
  plugin,
  schema,
  state: _state,
}: Omit<IrSchemaToAstOptions, 'state'> & {
  id: string;
  schema: IR.SchemaObject;
  state?: Partial<IrSchemaToAstOptions['state']>;
}): void => {
  const state: IrSchemaToAstOptions['state'] = {
    _path: _state?._path ?? [],
    circularReferenceTracker: _state?.circularReferenceTracker ?? [id],
    currentReferenceTracker: _state?.currentReferenceTracker ?? [id],
    hasCircularReference: _state?.hasCircularReference ?? false,
  };

  const selector = plugin.api.selector('ref', id);
  let symbol = plugin.getSymbol(selector);
  if (symbol && !plugin.getSymbolValue(symbol)) return;

  const ast = irSchemaToAst({ plugin, schema, state });
  const baseName = refToName(id);
  const resourceType = pathToSymbolResourceType(state._path);
  symbol = plugin.registerSymbol({
    exported: true,
    meta: {
      resourceType,
    },
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
          resourceType,
        },
        name: buildName({
          config: plugin.config.definitions.types.infer,
          name: baseName,
        }),
        selector: plugin.api.selector('type-infer-ref', id),
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

export const handlerMini: ZodPlugin['Handler'] = ({ plugin }) => {
  plugin.registerSymbol({
    external: getZodModule({ plugin }),
    meta: { importKind: 'namespace' },
    name: 'z',
    selector: plugin.api.selector('external', 'zod.z'),
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
          irOperationToAst({
            getAst: (schema, path) => {
              const state: IrSchemaToAstOptions['state'] = {
                _path: path,
                circularReferenceTracker: [],
                currentReferenceTracker: [],
                hasCircularReference: false,
              };
              return irSchemaToAst({ plugin, schema, state });
            },
            operation: event.operation,
            plugin,
            state: {
              _path: event._path,
            },
          });
          break;
        case 'parameter':
          handleComponent({
            id: event.$ref,
            plugin,
            schema: event.parameter.schema,
            state: {
              _path: event._path,
            },
          });
          break;
        case 'requestBody':
          handleComponent({
            id: event.$ref,
            plugin,
            schema: event.requestBody.schema,
            state: {
              _path: event._path,
            },
          });
          break;
        case 'schema':
          handleComponent({
            id: event.$ref,
            plugin,
            schema: event.schema,
            state: {
              _path: event._path,
            },
          });
          break;
        case 'webhook':
          irWebhookToAst({
            getAst: (schema, path) => {
              const state: IrSchemaToAstOptions['state'] = {
                _path: path,
                circularReferenceTracker: [],
                currentReferenceTracker: [],
                hasCircularReference: false,
              };
              return irSchemaToAst({ plugin, schema, state });
            },
            operation: event.operation,
            plugin,
            state: {
              _path: event._path,
            },
          });
          break;
      }
    },
  );
};

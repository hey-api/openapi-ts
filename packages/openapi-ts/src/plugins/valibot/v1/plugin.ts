import type { Symbol } from '@hey-api/codegen-core';
import type ts from 'typescript';

import { deduplicateSchema } from '~/ir/schema';
import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import type { SchemaWithType } from '~/plugins/shared/types/schema';
import { toRef, toRefs } from '~/plugins/shared/utils/refs';
import { createSchemaComment } from '~/plugins/shared/utils/schema';
import { tsc } from '~/tsc';
import { refToName } from '~/utils/ref';

import { numberParameter } from '../shared/numbers';
import type { IrSchemaToAstOptions, PluginState } from '../shared/types';
import type { ValibotPlugin } from '../types';
import { identifiers } from './constants';
import { irOperationToAst } from './operation';
import { pipesToAst } from './pipesToAst';
import { irSchemaWithTypeToAst } from './toAst';
import { irWebhookToAst } from './webhook';

export const irSchemaToAst = ({
  $ref,
  optional,
  plugin,
  schema,
  state,
  symbol,
}: IrSchemaToAstOptions & {
  /**
   * When $ref is supplied, a node will be emitted to the file.
   */
  $ref?: string;
  /**
   * Accept `optional` to handle optional object properties. We can't handle
   * this inside the object function because `.optional()` must come before
   * `.default()` which is handled in this function.
   */
  optional?: boolean;
  schema: IR.SchemaObject;
  /**
   * When symbol is supplied, the AST node will be set as its value.
   */
  symbol?: Symbol;
}): Array<ts.Expression> => {
  if ($ref && !symbol) {
    const selector = plugin.api.selector('ref', $ref);
    symbol = plugin.getSymbol(selector) || plugin.referenceSymbol(selector);
  }

  const v = plugin.referenceSymbol(
    plugin.api.selector('external', 'valibot.v'),
  );
  let anyType: string | undefined;
  let pipes: Array<ts.Expression> = [];

  if (schema.$ref) {
    const selector = plugin.api.selector('ref', schema.$ref);
    const refSymbol = plugin.referenceSymbol(selector);
    if (plugin.isSymbolRegistered(selector)) {
      const ref = tsc.identifier({ text: refSymbol.placeholder });
      pipes.push(ref);
    } else {
      const lazyExpression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: v.placeholder,
          name: identifiers.schemas.lazy,
        }),
        parameters: [
          tsc.arrowFunction({
            statements: [
              tsc.returnStatement({
                expression: tsc.identifier({ text: refSymbol.placeholder }),
              }),
            ],
          }),
        ],
      });
      pipes.push(lazyExpression);
      state.hasLazyExpression.value = true;
    }
  } else if (schema.type) {
    const ast = irSchemaWithTypeToAst({
      plugin,
      schema: schema as SchemaWithType,
      state,
    });
    anyType = ast.anyType;
    pipes.push(ast.expression);

    if (plugin.config.metadata && schema.description) {
      const expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: v.placeholder,
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
      const itemsAst = schema.items.map((item, index) => {
        const itemAst = irSchemaToAst({
          plugin,
          schema: item,
          state: {
            ...state,
            path: toRef([...state.path.value, 'items', index]),
          },
        });
        return pipesToAst({ pipes: itemAst, plugin });
      });

      if (schema.logicalOperator === 'and') {
        const intersectExpression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: v.placeholder,
            name: identifiers.schemas.intersect,
          }),
          parameters: [
            tsc.arrayLiteralExpression({
              elements: itemsAst,
            }),
          ],
        });
        pipes.push(intersectExpression);
      } else {
        const unionExpression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: v.placeholder,
            name: identifiers.schemas.union,
          }),
          parameters: [
            tsc.arrayLiteralExpression({
              elements: itemsAst,
            }),
          ],
        });
        pipes.push(unionExpression);
      }
    } else {
      const schemaPipes = irSchemaToAst({ plugin, schema, state });
      pipes.push(...schemaPipes);
    }
  } else {
    // catch-all fallback for failed schemas
    const ast = irSchemaWithTypeToAst({
      plugin,
      schema: {
        type: 'unknown',
      },
      state,
    });
    anyType = ast.anyType;
    pipes.push(ast.expression);
  }

  if (pipes.length) {
    if (schema.accessScope === 'read') {
      const readonlyExpression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: v.placeholder,
          name: identifiers.actions.readonly,
        }),
      });
      pipes.push(readonlyExpression);
    }

    let callParameter: ts.Expression | undefined;

    if (schema.default !== undefined) {
      const isBigInt = schema.type === 'integer' && schema.format === 'int64';
      callParameter = numberParameter({ isBigInt, value: schema.default });
      if (callParameter) {
        pipes = [
          tsc.callExpression({
            functionName: tsc.propertyAccessExpression({
              expression: v.placeholder,
              name: identifiers.schemas.optional,
            }),
            parameters: [pipesToAst({ pipes, plugin }), callParameter],
          }),
        ];
      }
    }

    if (optional && !callParameter) {
      pipes = [
        tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: v.placeholder,
            name: identifiers.schemas.optional,
          }),
          parameters: [pipesToAst({ pipes, plugin })],
        }),
      ];
    }
  }

  if (symbol) {
    if ($ref) {
      symbol = plugin.registerSymbol({
        exported: true,
        meta: {
          path: state.path.value,
        },
        name: buildName({
          config: {
            case: state.nameCase.value,
            name: state.nameTransformer.value,
          },
          name: refToName($ref),
        }),
        selector: plugin.api.selector('ref', $ref),
      });
    }
    const statement = tsc.constVariable({
      comment: plugin.config.comments
        ? createSchemaComment({ schema })
        : undefined,
      exportConst: symbol.exported,
      expression: pipesToAst({ pipes, plugin }),
      name: symbol.placeholder,
      typeName: state.hasLazyExpression.value
        ? (tsc.propertyAccessExpression({
            expression: v.placeholder,
            name: anyType || identifiers.types.GenericSchema.text,
          }) as unknown as ts.TypeNode)
        : undefined,
    });
    plugin.setSymbolValue(symbol, statement);
    return [];
  }

  return pipes;
};

export const handlerV1: ValibotPlugin['Handler'] = ({ plugin }) => {
  plugin.registerSymbol({
    external: 'valibot',
    meta: { importKind: 'namespace' },
    name: 'v',
    selector: plugin.api.selector('external', 'valibot.v'),
  });

  plugin.forEach(
    'operation',
    'parameter',
    'requestBody',
    'schema',
    'webhook',
    (event) => {
      const state = toRefs<PluginState>({
        hasLazyExpression: false,
        nameCase: plugin.config.definitions.case,
        nameTransformer: plugin.config.definitions.name,
        path: event._path,
      });

      switch (event.type) {
        case 'operation':
          irOperationToAst({
            operation: event.operation,
            plugin,
            state,
          });
          break;
        case 'parameter':
          irSchemaToAst({
            $ref: event.$ref,
            plugin,
            schema: event.parameter.schema,
            state,
          });
          break;
        case 'requestBody':
          irSchemaToAst({
            $ref: event.$ref,
            plugin,
            schema: event.requestBody.schema,
            state,
          });
          break;
        case 'schema':
          irSchemaToAst({
            $ref: event.$ref,
            plugin,
            schema: event.schema,
            state,
          });
          break;
        case 'webhook':
          irWebhookToAst({
            operation: event.operation,
            plugin,
            state,
          });
          break;
      }
    },
  );
};

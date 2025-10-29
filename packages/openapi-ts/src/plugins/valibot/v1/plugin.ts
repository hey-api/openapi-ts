import type { SymbolMeta } from '@hey-api/codegen-core';
import type ts from 'typescript';

import { deduplicateSchema } from '~/ir/schema';
import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import type { SchemaWithType } from '~/plugins';
import { toRef, toRefs } from '~/plugins/shared/utils/refs';
import { tsc } from '~/tsc';
import { pathToJsonPointer, refToName } from '~/utils/ref';

import { exportAst } from '../shared/export';
import { numberParameter } from '../shared/numbers';
import { irOperationToAst } from '../shared/operation';
import { pipesToAst } from '../shared/pipesToAst';
import type { Ast, IrSchemaToAstOptions, PluginState } from '../shared/types';
import { irWebhookToAst } from '../shared/webhook';
import type { ValibotPlugin } from '../types';
import { identifiers } from './constants';
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
  const ast: Ast = {
    pipes: [],
  };

  const v = plugin.referenceSymbol({
    category: 'external',
    resource: 'valibot.v',
  });

  if (schema.$ref) {
    const query: SymbolMeta = {
      category: 'schema',
      resource: 'definition',
      resourceId: schema.$ref,
      tool: 'valibot',
    };
    const refSymbol = plugin.referenceSymbol(query);
    if (plugin.isSymbolRegistered(query)) {
      const ref = tsc.identifier({ text: refSymbol.placeholder });
      ast.pipes.push(ref);
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
      ast.pipes.push(lazyExpression);
      state.hasLazyExpression.value = true;
    }
  } else if (schema.type) {
    const typeAst = irSchemaWithTypeToAst({
      plugin,
      schema: schema as SchemaWithType,
      state,
    });
    ast.typeName = typeAst.anyType;
    ast.pipes.push(typeAst.expression);

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
      ast.pipes.push(expression);
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
        return pipesToAst({ pipes: itemAst.pipes, plugin });
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
        ast.pipes.push(intersectExpression);
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
        ast.pipes.push(unionExpression);
      }
    } else {
      const schemaPipes = irSchemaToAst({ plugin, schema, state });
      ast.pipes.push(...schemaPipes.pipes);
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
    ast.typeName = typeAst.anyType;
    ast.pipes.push(typeAst.expression);
  }

  if (ast.pipes.length) {
    if (schema.accessScope === 'read') {
      const readonlyExpression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: v.placeholder,
          name: identifiers.actions.readonly,
        }),
      });
      ast.pipes.push(readonlyExpression);
    }

    let callParameter: ts.Expression | undefined;

    if (schema.default !== undefined) {
      const isBigInt = schema.type === 'integer' && schema.format === 'int64';
      callParameter = numberParameter({ isBigInt, value: schema.default });
      if (callParameter) {
        ast.pipes = [
          tsc.callExpression({
            functionName: tsc.propertyAccessExpression({
              expression: v.placeholder,
              name: identifiers.schemas.optional,
            }),
            parameters: [
              pipesToAst({ pipes: ast.pipes, plugin }),
              callParameter,
            ],
          }),
        ];
      }
    }

    if (optional && !callParameter) {
      ast.pipes = [
        tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: v.placeholder,
            name: identifiers.schemas.optional,
          }),
          parameters: [pipesToAst({ pipes: ast.pipes, plugin })],
        }),
      ];
    }
  }

  return ast as Ast;
};

const handleComponent = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: IR.SchemaObject;
}): void => {
  const $ref = pathToJsonPointer(state.path.value);
  const ast = irSchemaToAst({ plugin, schema, state });
  const baseName = refToName($ref);
  const symbol = plugin.registerSymbol({
    exported: true,
    meta: {
      category: 'schema',
      path: state.path.value,
      resource: 'definition',
      resourceId: $ref,
      tags: state.tags?.value,
      tool: 'valibot',
    },
    name: buildName({
      config: plugin.config.definitions,
      name: baseName,
    }),
  });
  exportAst({
    ast,
    plugin,
    schema,
    state,
    symbol,
  });
};

export const handlerV1: ValibotPlugin['Handler'] = ({ plugin }) => {
  plugin.registerSymbol({
    external: 'valibot',
    importKind: 'namespace',
    meta: {
      category: 'external',
      resource: 'valibot.v',
    },
    name: 'v',
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
        path: event._path,
        tags: event.tags,
      });
      switch (event.type) {
        case 'operation':
          irOperationToAst({
            getAst: (schema, path) => {
              const state = toRefs<PluginState>({
                hasLazyExpression: false,
                path,
                tags: event.tags,
              });
              return irSchemaToAst({ plugin, schema, state });
            },
            operation: event.operation,
            plugin,
            state,
          });
          break;
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
        case 'webhook':
          irWebhookToAst({
            getAst: (schema, path) => {
              const state = toRefs<PluginState>({
                hasLazyExpression: false,
                path,
                tags: event.tags,
              });
              return irSchemaToAst({ plugin, schema, state });
            },
            operation: event.operation,
            plugin,
            state,
          });
          break;
      }
    },
  );
};

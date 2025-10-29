import { deduplicateSchema } from '~/ir/schema';
import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import type { SchemaWithType } from '~/plugins';
import { toRef, toRefs } from '~/plugins/shared/utils/refs';
import { tsc } from '~/tsc';
import { pathToJsonPointer, refToName } from '~/utils/ref';

import { identifiers } from '../constants';
import { exportAst } from '../shared/export';
import { getZodModule } from '../shared/module';
import { numberParameter } from '../shared/numbers';
import { irOperationToAst } from '../shared/operation';
import type { Ast, IrSchemaToAstOptions, PluginState } from '../shared/types';
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
    const selector = plugin.api.selector('ref', schema.$ref);
    const refSymbol = plugin.referenceSymbol(selector);
    if (plugin.isSymbolRegistered(selector)) {
      const ref = tsc.identifier({ text: refSymbol.placeholder });
      ast.expression = ref;
    } else {
      const lazyExpression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: z.placeholder,
          name: identifiers.lazy,
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
    ast.expression = typeAst.expression;
    ast.typeName = typeAst.anyType;

    if (plugin.config.metadata && schema.description) {
      ast.expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: ast.expression,
          name: identifiers.describe,
        }),
        parameters: [tsc.stringLiteral({ text: schema.description })],
      });
    }
  } else if (schema.items) {
    schema = deduplicateSchema({ schema });

    if (schema.items) {
      const itemTypes = schema.items.map((item, index) => {
        const typeAst = irSchemaToAst({
          plugin,
          schema: item,
          state: {
            ...state,
            path: toRef([...state.path.value, 'items', index]),
          },
        });
        return typeAst.expression;
      });

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
            parameters: itemTypes,
          });
        } else {
          ast.expression = itemTypes[0];
          itemTypes.slice(1).forEach((item) => {
            ast.expression = tsc.callExpression({
              functionName: tsc.propertyAccessExpression({
                expression: ast.expression!,
                name: identifiers.and,
              }),
              parameters: [item],
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
              elements: itemTypes,
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
    ast.typeName = typeAst.anyType;
  }

  if (ast.expression) {
    if (schema.accessScope === 'read') {
      ast.expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: ast.expression,
          name: identifiers.readonly,
        }),
      });
    }

    if (optional) {
      ast.expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: ast.expression,
          name: identifiers.optional,
        }),
      });
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
            expression: ast.expression,
            name: identifiers.default,
          }),
          parameters: [callParameter],
        });
      }
    }
  }

  if (state.hasLazyExpression.value) {
    if (!ast.typeName) {
      ast.typeName = 'ZodTypeAny';
    }
  } else if (ast.typeName) {
    ast.typeName = undefined;
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
      path: state.path.value,
      tags: state.tags?.value,
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
        kind: 'type',
        meta: {
          path: state.path.value,
          tags: state.tags?.value,
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

export const handlerV3: ZodPlugin['Handler'] = ({ plugin }) => {
  plugin.registerSymbol({
    external: getZodModule({ plugin }),
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

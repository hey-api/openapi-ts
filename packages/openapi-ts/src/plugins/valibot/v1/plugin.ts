import type { Symbol } from '@hey-api/codegen-core';
import type ts from 'typescript';

import { deduplicateSchema } from '../../../ir/schema';
import type { IR } from '../../../ir/types';
import { buildName } from '../../../openApi/shared/utils/name';
import { tsc } from '../../../tsc';
import { jsonPointerToPath, refToName } from '../../../utils/ref';
import type { SchemaWithType } from '../../shared/types/schema';
import { pathToSymbolResourceType } from '../../shared/utils/meta';
import { createSchemaComment } from '../../shared/utils/schema';
import { numberParameter } from '../shared/numbers';
import type { IrSchemaToAstOptions } from '../shared/types';
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
  symbol?: Symbol;
}): Array<ts.Expression> => {
  let anyType: string | undefined;
  let pipes: Array<ts.Expression> = [];

  if ($ref) {
    state.circularReferenceTracker.add($ref);

    if (!symbol) {
      const selector = plugin.api.getSelector('ref', $ref);
      if (!plugin.getSymbol(selector)) {
        symbol = plugin.referenceSymbol(selector);
      }
    }
  }

  const v = plugin.referenceSymbol(
    plugin.api.getSelector('external', 'valibot.v'),
  );

  if (schema.$ref) {
    const isCircularReference = state.circularReferenceTracker.has(schema.$ref);

    // if $ref hasn't been processed yet, inline it to avoid the
    // "Block-scoped variable used before its declaration." error
    // this could be (maybe?) fixed by reshuffling the generation order
    const selector = plugin.api.getSelector('ref', schema.$ref);
    let refSymbol = plugin.getSymbol(selector);
    if (!refSymbol) {
      const ref = plugin.context.resolveIrRef<IR.SchemaObject>(schema.$ref);
      const schemaPipes = irSchemaToAst({
        $ref: schema.$ref,
        plugin,
        schema: ref,
        state: {
          ...state,
          _path: jsonPointerToPath(schema.$ref),
        },
      });
      pipes.push(...schemaPipes);

      refSymbol = plugin.getSymbol(selector);
    }

    if (refSymbol) {
      const refIdentifier = tsc.identifier({ text: refSymbol.placeholder });
      if (isCircularReference) {
        const lazyExpression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: v.placeholder,
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
    const valibotSchema = irSchemaWithTypeToAst({
      plugin,
      schema: schema as SchemaWithType,
      state,
    });
    anyType = valibotSchema.anyType;
    pipes.push(valibotSchema.expression);

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
      const itemTypes = schema.items.map((item, index) => {
        const schemaPipes = irSchemaToAst({
          plugin,
          schema: item,
          state: {
            ...state,
            _path: [...state._path, 'items', index],
          },
        });
        return pipesToAst({ pipes: schemaPipes, plugin });
      });

      if (schema.logicalOperator === 'and') {
        const intersectExpression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: v.placeholder,
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
            expression: v.placeholder,
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
      const schemaPipes = irSchemaToAst({
        plugin,
        schema,
        state,
      });
      pipes.push(...schemaPipes);
    }
  } else {
    // catch-all fallback for failed schemas
    const valibotSchema = irSchemaWithTypeToAst({
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
          resourceType: pathToSymbolResourceType(state._path),
        },
        name: buildName({
          config: {
            case: state.nameCase,
            name: state.nameTransformer,
          },
          name: refToName($ref),
        }),
        selector: plugin.api.getSelector('ref', $ref),
      });
    }
    const statement = tsc.constVariable({
      comment: plugin.config.comments
        ? createSchemaComment({ schema })
        : undefined,
      exportConst: symbol.exported,
      expression: pipesToAst({ pipes, plugin }),
      name: symbol.placeholder,
      typeName: state.hasCircularReference
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
    selector: plugin.api.getSelector('external', 'valibot.v'),
  });

  plugin.forEach(
    'operation',
    'parameter',
    'requestBody',
    'schema',
    'webhook',
    (event) => {
      const state: Omit<IrSchemaToAstOptions['state'], '_path'> = {
        circularReferenceTracker: new Set(),
        hasCircularReference: false,
        nameCase: plugin.config.definitions.case,
        nameTransformer: plugin.config.definitions.name,
      };

      switch (event.type) {
        case 'operation':
          irOperationToAst({
            operation: event.operation,
            plugin,
            state: {
              ...state,
              _path: event._path,
            },
          });
          break;
        case 'parameter':
          irSchemaToAst({
            $ref: event.$ref,
            plugin,
            schema: event.parameter.schema,
            state: {
              ...state,
              _path: event._path,
            },
          });
          break;
        case 'requestBody':
          irSchemaToAst({
            $ref: event.$ref,
            plugin,
            schema: event.requestBody.schema,
            state: {
              ...state,
              _path: event._path,
            },
          });
          break;
        case 'schema':
          irSchemaToAst({
            $ref: event.$ref,
            plugin,
            schema: event.schema,
            state: {
              ...state,
              _path: event._path,
            },
          });
          break;
        case 'webhook':
          irWebhookToAst({
            operation: event.operation,
            plugin,
            state: {
              ...state,
              _path: event._path,
            },
          });
          break;
      }
    },
  );
};

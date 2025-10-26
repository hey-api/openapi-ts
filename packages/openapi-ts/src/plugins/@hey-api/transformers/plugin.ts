import ts from 'typescript';

import { createOperationKey, operationResponsesMap } from '~/ir/operation';
import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import { tsc } from '~/tsc';
import { refToName } from '~/utils/ref';

import type { HeyApiTransformersPlugin } from './types';

const dataVariableName = 'data';

const ensureStatements = (
  nodes: Array<ts.Expression | ts.Statement>,
): Array<ts.Statement> =>
  nodes.map((node) =>
    ts.isStatement(node)
      ? node
      : tsc.expressionToStatement({ expression: node }),
  );

const isNodeReturnStatement = ({
  node,
}: {
  node: ts.Expression | ts.Statement;
}) => node.kind === ts.SyntaxKind.ReturnStatement;

const schemaResponseTransformerNodes = ({
  plugin,
  schema,
}: {
  plugin: HeyApiTransformersPlugin['Instance'];
  schema: IR.SchemaObject;
}): Array<ts.Expression | ts.Statement> => {
  const identifierData = tsc.identifier({ text: dataVariableName });
  const nodes = processSchemaType({
    dataExpression: identifierData,
    plugin,
    schema,
  });
  // append return statement if one does not already exist
  if (
    nodes.length &&
    !isNodeReturnStatement({ node: nodes[nodes.length - 1]! })
  ) {
    nodes.push(tsc.returnStatement({ expression: identifierData }));
  }
  return nodes;
};

const processSchemaType = ({
  dataExpression,
  plugin,
  schema,
}: {
  dataExpression?: ts.Expression | string;
  plugin: HeyApiTransformersPlugin['Instance'];
  schema: IR.SchemaObject;
}): Array<ts.Expression | ts.Statement> => {
  if (schema.$ref) {
    const selector = plugin.api.selector('response-ref', schema.$ref);

    if (!plugin.getSymbol(selector)) {
      // TODO: remove
      // create each schema response transformer only once
      const refSchema = plugin.context.resolveIrRef<IR.SchemaObject>(
        schema.$ref,
      );
      const nodes = schemaResponseTransformerNodes({
        plugin,
        schema: refSchema,
      });
      if (nodes.length) {
        const symbol = plugin.registerSymbol({
          name: buildName({
            config: {
              case: 'camelCase',
              name: '{{name}}SchemaResponseTransformer',
            },
            name: refToName(schema.$ref),
          }),
          selector,
        });
        const node = tsc.constVariable({
          expression: tsc.arrowFunction({
            async: false,
            multiLine: true,
            parameters: [
              {
                name: dataVariableName,
                // TODO: parser - add types, generate types without transforms
                type: tsc.keywordTypeNode({ keyword: 'any' }),
              },
            ],
            statements: ensureStatements(nodes),
          }),
          name: symbol.placeholder,
        });
        plugin.setSymbolValue(symbol, node);
      }
    }

    if (plugin.isSymbolRegistered(selector)) {
      const ref = plugin.referenceSymbol(selector);
      const callExpression = tsc.callExpression({
        functionName: ref.placeholder,
        parameters: [dataExpression],
      });

      if (dataExpression) {
        // In a map callback, the item needs to be returned, not just the transformation result
        if (typeof dataExpression === 'string' && dataExpression === 'item') {
          return [
            tsc.returnStatement({
              expression: callExpression,
            }),
          ];
        }

        return [
          typeof dataExpression === 'string'
            ? callExpression
            : tsc.assignment({
                left: dataExpression,
                right: callExpression,
              }),
        ];
      }
    }

    return [];
  }

  if (schema.type === 'array') {
    if (!dataExpression || typeof dataExpression === 'string') {
      return [];
    }

    // TODO: parser - handle tuples and complex arrays
    const nodes = !schema.items
      ? []
      : processSchemaType({
          dataExpression: 'item',
          plugin,
          schema: schema.items?.[0]
            ? schema.items[0]
            : {
                ...schema,
                type: undefined,
              },
        });

    if (!nodes.length) {
      return [];
    }

    // Ensure the map callback has a return statement for the item
    const mapCallbackStatements = ensureStatements(nodes);
    const hasReturnStatement = mapCallbackStatements.some((stmt) =>
      isNodeReturnStatement({ node: stmt }),
    );

    if (!hasReturnStatement) {
      mapCallbackStatements.push(
        tsc.returnStatement({
          expression: tsc.identifier({ text: 'item' }),
        }),
      );
    }

    return [
      tsc.assignment({
        left: dataExpression,
        right: tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: dataExpression,
            name: 'map',
          }),
          parameters: [
            tsc.arrowFunction({
              multiLine: true,
              parameters: [
                {
                  name: 'item',
                  type: 'any',
                },
              ],
              statements: mapCallbackStatements,
            }),
          ],
        }),
      }),
    ];
  }

  if (schema.type === 'object') {
    let nodes: Array<ts.Expression | ts.Statement> = [];
    const required = schema.required ?? [];

    for (const name in schema.properties) {
      const property = schema.properties[name]!;
      const propertyAccessExpression = tsc.propertyAccessExpression({
        expression: dataExpression || dataVariableName,
        name,
      });
      const propertyNodes = processSchemaType({
        dataExpression: propertyAccessExpression,
        plugin,
        schema: property,
      });
      if (!propertyNodes.length) {
        continue;
      }
      const noNullableTypesInSchema = !property.items?.find(
        (x) => x.type === 'null',
      );
      const requiredField = required.includes(name);
      // Cannot fully rely on required fields
      // Such value has to be present, but it doesn't guarantee that this value is not nullish
      if (requiredField && noNullableTypesInSchema) {
        nodes = nodes.concat(propertyNodes);
      } else {
        nodes.push(
          // todo: Probably, it would make more sense to go with if(x !== undefined && x !== null) instead of if(x)
          // this place influences all underlying transformers, while it's not exactly transformer itself
          // Keep in mind that !!0 === false, so it already makes output for Bigint undesirable
          tsc.ifStatement({
            expression: propertyAccessExpression,
            thenStatement: tsc.block({
              statements: ensureStatements(propertyNodes),
            }),
          }),
        );
      }
    }

    return nodes;
  }

  if (schema.items) {
    if (schema.items.length === 1) {
      return processSchemaType({
        dataExpression: 'item',
        plugin,
        schema: schema.items[0]!,
      });
    }

    let arrayNodes: Array<ts.Expression | ts.Statement> = [];
    // process 2 items if one of them is null
    if (
      schema.logicalOperator === 'and' ||
      (schema.items.length === 2 &&
        schema.items.find(
          (item) => item.type === 'null' || item.type === 'void',
        ))
    ) {
      for (const item of schema.items) {
        const nodes = processSchemaType({
          dataExpression: dataExpression || 'item',
          plugin,
          schema: item,
        });
        if (nodes.length) {
          if (dataExpression) {
            arrayNodes = arrayNodes.concat(nodes);
          } else {
            const identifierItem = tsc.identifier({ text: 'item' });
            // processed means the item was transformed
            arrayNodes.push(
              tsc.ifStatement({
                expression: identifierItem,
                thenStatement: tsc.block({
                  statements: ensureStatements(nodes),
                }),
              }),
              tsc.returnStatement({ expression: identifierItem }),
            );
          }
        }
      }
      return arrayNodes;
    }

    // assume enums do not contain transformable values
    if (schema.type !== 'enum') {
      if (
        !(schema.items ?? []).every((item) =>
          (
            ['boolean', 'integer', 'null', 'number', 'string'] as ReadonlyArray<
              typeof item.type
            >
          ).includes(item.type),
        )
      ) {
        console.warn(
          `❗️ Transformers warning: schema ${JSON.stringify(schema)} is too complex and won't be currently processed. This will likely produce an incomplete transformer which is not what you want. Please open an issue if you'd like this improved https://github.com/hey-api/openapi-ts/issues`,
        );
      }
    }
  }

  for (const transformer of plugin.config.transformers) {
    const t = transformer({
      config: plugin.config,
      dataExpression,
      schema,
    });
    if (t) {
      return t;
    }
  }

  return [];
};

// handles only response transformers for now
export const handler: HeyApiTransformersPlugin['Handler'] = ({ plugin }) => {
  plugin.forEach(
    'operation',
    ({ operation }) => {
      const { response } = operationResponsesMap(operation);
      if (!response) return;

      if (response.items && response.items.length > 1) {
        if (plugin.context.config.logs.level === 'debug') {
          console.warn(
            `❗️ Transformers warning: route ${createOperationKey(operation)} has ${response.items.length} non-void success responses. This is currently not handled and we will not generate a response transformer. Please open an issue if you'd like this feature https://github.com/hey-api/openapi-ts/issues`,
          );
        }
        return;
      }

      const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');
      const symbolResponse = plugin.getSymbol(
        pluginTypeScript.api.selector('response', operation.id),
      );
      if (!symbolResponse) return;

      // TODO: parser - consider handling simple string response which is also a date
      const nodes = schemaResponseTransformerNodes({
        plugin,
        schema: response,
      });
      if (!nodes.length) return;
      const symbol = plugin.registerSymbol({
        exported: true,
        name: buildName({
          config: {
            case: 'camelCase',
            name: '{{name}}ResponseTransformer',
          },
          name: operation.id,
        }),
        selector: plugin.api.selector('response', operation.id),
      });
      const value = tsc.constVariable({
        exportConst: symbol.exported,
        expression: tsc.arrowFunction({
          async: true,
          multiLine: true,
          parameters: [
            {
              name: dataVariableName,
              // TODO: parser - add types, generate types without transforms
              type: tsc.keywordTypeNode({ keyword: 'any' }),
            },
          ],
          returnType: tsc.typeReferenceNode({
            typeArguments: [
              tsc.typeReferenceNode({ typeName: symbolResponse.placeholder }),
            ],
            typeName: 'Promise',
          }),
          statements: ensureStatements(nodes),
        }),
        name: symbol.placeholder,
      });
      plugin.setSymbolValue(symbol, value);
    },
    {
      order: 'declarations',
    },
  );
};

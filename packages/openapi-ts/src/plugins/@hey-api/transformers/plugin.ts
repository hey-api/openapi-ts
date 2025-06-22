import ts from 'typescript';

import { compiler } from '../../../compiler';
import {
  createOperationKey,
  operationResponsesMap,
} from '../../../ir/operation';
import type { IR } from '../../../ir/types';
import { irRef } from '../../../utils/ref';
import { stringCase } from '../../../utils/stringCase';
import { operationIrRef } from '../../shared/utils/ref';
import type { Plugin } from '../../types';
import { typesId } from '../typescript/ref';
import type { HeyApiTransformersPlugin } from './types';

interface OperationIRRef {
  /**
   * Operation ID
   */
  id: string;
}

const bigIntExpressions = ({
  dataExpression,
}: {
  dataExpression?: ts.Expression | string;
}): Array<ts.Expression> => {
  const bigIntCallExpression =
    dataExpression !== undefined
      ? compiler.callExpression({
          functionName: 'BigInt',
          parameters: [
            compiler.callExpression({
              functionName: compiler.propertyAccessExpression({
                expression: dataExpression,
                name: 'toString',
              }),
            }),
          ],
        })
      : undefined;

  if (bigIntCallExpression) {
    if (typeof dataExpression === 'string') {
      return [bigIntCallExpression];
    }

    if (dataExpression) {
      return [
        compiler.assignment({
          left: dataExpression,
          right: bigIntCallExpression,
        }),
      ];
    }
  }

  return [];
};

const dateExpressions = ({
  dataExpression,
}: {
  dataExpression?: ts.Expression | string;
}): Array<ts.Expression> => {
  const identifierDate = compiler.identifier({ text: 'Date' });

  if (typeof dataExpression === 'string') {
    return [
      compiler.newExpression({
        argumentsArray: [compiler.identifier({ text: dataExpression })],
        expression: identifierDate,
      }),
    ];
  }

  if (dataExpression) {
    return [
      compiler.assignment({
        left: dataExpression,
        right: compiler.newExpression({
          argumentsArray: [dataExpression],
          expression: identifierDate,
        }),
      }),
    ];
  }

  return [];
};

export const operationTransformerIrRef = ({
  id,
  type,
}: OperationIRRef & {
  type: 'data' | 'error' | 'response';
}): string => {
  let affix = '';
  switch (type) {
    case 'data':
      affix = 'DataResponseTransformer';
      break;
    case 'error':
      affix = 'ErrorResponseTransformer';
      break;
    case 'response':
      affix = 'ResponseTransformer';
      break;
  }
  return `${irRef}${stringCase({
    // TODO: parser - do not pascalcase for functions, only for types
    case: 'camelCase',
    value: id,
  })}${affix}`;
};

const schemaIrRef = ({
  $ref,
  type,
}: {
  $ref: string;
  type: 'response';
}): string => {
  let affix = '';
  switch (type) {
    case 'response':
      affix = 'SchemaResponseTransformer';
      break;
  }
  const parts = $ref.split('/');
  return `${parts.slice(0, parts.length - 1).join('/')}/${stringCase({
    case: 'camelCase',
    value: parts[parts.length - 1]!,
  })}${affix}`;
};

export const schemaResponseTransformerRef = ({
  $ref,
}: {
  $ref: string;
}): string => schemaIrRef({ $ref, type: 'response' });

export const transformersId = 'transformers';
const dataVariableName = 'data';

const ensureStatements = (
  nodes: Array<ts.Expression | ts.Statement>,
): Array<ts.Statement> =>
  nodes.map((node) =>
    ts.isStatement(node)
      ? node
      : compiler.expressionToStatement({ expression: node }),
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
  plugin: Plugin.Instance<HeyApiTransformersPlugin>;
  schema: IR.SchemaObject;
}): Array<ts.Expression | ts.Statement> => {
  const identifierData = compiler.identifier({ text: dataVariableName });
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
    nodes.push(compiler.returnStatement({ expression: identifierData }));
  }
  return nodes;
};

const processSchemaType = ({
  dataExpression,
  plugin,
  schema,
}: {
  dataExpression?: ts.Expression | string;
  plugin: Plugin.Instance<HeyApiTransformersPlugin>;
  schema: IR.SchemaObject;
}): Array<ts.Expression | ts.Statement> => {
  const file = plugin.context.file({ id: transformersId })!;

  if (schema.$ref) {
    let identifier = file.identifier({
      $ref: schemaResponseTransformerRef({ $ref: schema.$ref }),
      create: true,
      namespace: 'value',
    });

    if (identifier.created && identifier.name) {
      // create each schema response transformer only once
      const refSchema = plugin.context.resolveIrRef<IR.SchemaObject>(
        schema.$ref,
      );
      const nodes = schemaResponseTransformerNodes({
        plugin,
        schema: refSchema,
      });
      if (nodes.length) {
        const node = compiler.constVariable({
          expression: compiler.arrowFunction({
            async: false,
            multiLine: true,
            parameters: [
              {
                name: dataVariableName,
                // TODO: parser - add types, generate types without transforms
                type: compiler.keywordTypeNode({ keyword: 'any' }),
              },
            ],
            statements: ensureStatements(nodes),
          }),
          name: identifier.name,
        });
        file.add(node);
      } else {
        // the created schema response transformer was empty, do not generate
        // it and prevent any future attempts
        identifier = file.blockIdentifier({
          $ref: schemaResponseTransformerRef({ $ref: schema.$ref }),
          namespace: 'value',
        });
      }
    }

    if (identifier.name) {
      const callExpression = compiler.callExpression({
        functionName: identifier.name,
        parameters: [dataExpression],
      });

      if (dataExpression) {
        // In a map callback, the item needs to be returned, not just the transformation result
        if (typeof dataExpression === 'string' && dataExpression === 'item') {
          return [
            compiler.returnStatement({
              expression: callExpression,
            }),
          ];
        }

        return [
          typeof dataExpression === 'string'
            ? callExpression
            : compiler.assignment({
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
        compiler.returnStatement({
          expression: compiler.identifier({ text: 'item' }),
        }),
      );
    }

    return [
      compiler.assignment({
        left: dataExpression,
        right: compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression: dataExpression,
            name: 'map',
          }),
          parameters: [
            compiler.arrowFunction({
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
      const propertyAccessExpression = compiler.propertyAccessExpression({
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
          compiler.ifStatement({
            expression: propertyAccessExpression,
            thenStatement: compiler.block({
              statements: ensureStatements(propertyNodes),
            }),
          }),
        );
      }
    }

    return nodes;
  }

  if (
    plugin.config.dates &&
    schema.type === 'string' &&
    (schema.format === 'date' || schema.format === 'date-time')
  ) {
    return dateExpressions({ dataExpression });
  }

  if (
    plugin.config.bigInt &&
    schema.type === 'integer' &&
    schema.format === 'int64'
  ) {
    return bigIntExpressions({ dataExpression });
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
            const identifierItem = compiler.identifier({ text: 'item' });
            // processed means the item was transformed
            arrayNodes.push(
              compiler.ifStatement({
                expression: identifierItem,
                thenStatement: compiler.block({
                  statements: ensureStatements(nodes),
                }),
              }),
              compiler.returnStatement({ expression: identifierItem }),
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

  return [];
};

// handles only response transformers for now
export const handler: Plugin.Handler<HeyApiTransformersPlugin> = ({
  plugin,
}) => {
  const file = plugin.createFile({
    id: transformersId,
    path: plugin.output,
  });

  plugin.forEach('operation', ({ operation }) => {
    const { response } = operationResponsesMap(operation);

    if (!response) {
      return;
    }

    if (response.items && response.items.length > 1) {
      if (plugin.context.config.logs.level === 'debug') {
        console.warn(
          `❗️ Transformers warning: route ${createOperationKey(operation)} has ${response.items.length} non-void success responses. This is currently not handled and we will not generate a response transformer. Please open an issue if you'd like this feature https://github.com/hey-api/openapi-ts/issues`,
        );
      }
      return;
    }

    const identifierResponse = plugin.context
      .file({ id: typesId })!
      .identifier({
        $ref: operationIrRef({
          config: plugin.context.config,
          id: operation.id,
          type: 'response',
        }),
        namespace: 'type',
      });
    if (!identifierResponse.name) {
      return;
    }

    let identifierResponseTransformer = file.identifier({
      $ref: operationTransformerIrRef({ id: operation.id, type: 'response' }),
      create: true,
      namespace: 'value',
    });
    if (!identifierResponseTransformer.name) {
      return;
    }

    // TODO: parser - consider handling simple string response which is also a date
    const nodes = schemaResponseTransformerNodes({ plugin, schema: response });
    if (nodes.length) {
      file.import({
        asType: true,
        module: file.relativePathToFile({
          context: plugin.context,
          id: typesId,
        }),
        name: identifierResponse.name,
      });
      const responseTransformerNode = compiler.constVariable({
        exportConst: true,
        expression: compiler.arrowFunction({
          async: true,
          multiLine: true,
          parameters: [
            {
              name: dataVariableName,
              // TODO: parser - add types, generate types without transforms
              type: compiler.keywordTypeNode({ keyword: 'any' }),
            },
          ],
          returnType: compiler.typeReferenceNode({
            typeArguments: [
              compiler.typeReferenceNode({
                typeName: identifierResponse.name,
              }),
            ],
            typeName: 'Promise',
          }),
          statements: ensureStatements(nodes),
        }),
        name: identifierResponseTransformer.name,
      });
      file.add(responseTransformerNode);
    } else {
      // the created schema response transformer was empty, do not generate
      // it and prevent any future attempts
      identifierResponseTransformer = file.blockIdentifier({
        $ref: operationTransformerIrRef({
          id: operation.id,
          type: 'response',
        }),
        namespace: 'value',
      });
    }
  });
};

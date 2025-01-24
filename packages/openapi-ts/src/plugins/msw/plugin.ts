import type ts from 'typescript';

import { compiler } from '../../compiler';
import type { Identifier } from '../../generate/files';
import type { IR } from '../../ir/types';
import { irRef } from '../../utils/ref';
import { stringCase } from '../../utils/stringCase';
import {
  importIdentifierData,
  importIdentifierResponse,
} from '../@hey-api/typescript/ref';
import type { Plugin } from '../types';
import {
  createPathParamsType,
  createResponseBodyTypeType,
  createTransformObjectType,
  neverReference,
  pathParamsTypeName,
  responseBodyTypeTypeName,
  undefinedReference,
} from './interfaces';
import { getSuccessResponse, responseOptions } from './response';
import { schemaToExpression } from './schema';
import type { Config } from './types';

export const mswId = 'msw';

const nameTransformer = (name: string) => `${name}-handler`;

const resolverStatements = ({
  context,
  identifierResponse,
  operation,
}: {
  context: IR.Context;
  identifierResponse: Identifier;
  operation: IR.OperationObject;
}) => {
  const statements: Array<ts.Statement> = [];

  const successResponse = getSuccessResponse(operation)

  const response = compiler.constVariable({
    expression: compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: 'HttpResponse',
        name: compiler.identifier({ text: 'json' }),
      }),
      parameters: [
        identifierResponse.name && successResponse?.schema ? schemaToExpression({
          context,
          schema: successResponse.schema,
        }) : compiler.identifier({ text: 'undefined' }),
        responseOptions({
          responseSchema: successResponse,
        }),
      ],
      types: [
        identifierResponse.name ? compiler.typeReferenceNode({
          typeArguments: [
            compiler.typeReferenceNode({
              typeName: identifierResponse.name,
            }),
          ],
          typeName: responseBodyTypeTypeName,
        }) : undefinedReference,
      ],
    }),
    name: 'response',
  });
  statements.push(response);

  statements.push(
    compiler.returnStatement({
      expression: compiler.identifier({ text: 'response' }),
    }),
  );

  return statements;
};

const operationToMswHandler = ({
  context,
  operation,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
}) => {
  const file = context.file({ id: mswId })!;

  const identifier = file.identifier({
    $ref: `${irRef}${stringCase({
      case: 'camelCase',
      value: operation.id,
    })}`,
    create: true,
    nameTransformer,
    namespace: 'value',
  });

  if (!identifier.name) {
    return;
  }

  const identifierData = importIdentifierData({ context, file, operation });
  const identifierResponse = importIdentifierResponse({
    context,
    file,
    operation,
  });

  // TODO: add support for baseUrl/servers
  // replace our curly brackets with colon
  const handlerPath = `*${operation.path.replace(/\{(.+?)\}/g, ':$1')}`;

  const statement = compiler.constVariable({
    exportConst: true,
    expression: compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: compiler.identifier({ text: 'http' }),
        name: operation.method,
      }),
      parameters: [
        compiler.ots.string(handlerPath),
        compiler.arrowFunction({
          async: true,
          parameters: [
            // TODO: use cookies, params, request, requestId
          ],
          statements: resolverStatements({
            context,
            identifierResponse,
            operation,
          }),
        }),
      ],
      types: [
        identifierData.name
          ? compiler.typeReferenceNode({
              typeArguments: [
                compiler.typeReferenceNode({ typeName: identifierData.name }),
              ],
              typeName: pathParamsTypeName,
            })
          : neverReference,
        identifierData.name
          ? compiler.indexedAccessTypeNode({
              indexType: compiler.literalTypeNode({
                literal: compiler.stringLiteral({ text: 'body' }),
              }),
              objectType: compiler.typeReferenceNode({
                typeName: identifierData.name,
              }),
            })
          : neverReference,
        identifierResponse.name
          ? compiler.typeReferenceNode({
              typeArguments: [
                compiler.typeReferenceNode({
                  typeName: identifierResponse.name,
                }),
              ],
              typeName: responseBodyTypeTypeName,
            })
          : undefinedReference,
      ],
    }),
    name: identifier.name,
  });
  file.add(statement);
};

export const handler: Plugin.Handler<Config> = ({ context, plugin }) => {
  const file = context.createFile({
    exportFromIndex: plugin.exportFromIndex,
    id: mswId,
    identifierCase: 'camelCase',
    path: plugin.output,
  });

  file.import({
    module: 'msw',
    name: 'http',
  });
  file.import({
    module: 'msw',
    name: 'HttpResponse',
  });

  file.add(createTransformObjectType());
  file.add(createPathParamsType());
  file.add(createResponseBodyTypeType());

  context.subscribe('operation', ({ operation }) => {
    operationToMswHandler({
      context,
      operation,
    });
  });
};

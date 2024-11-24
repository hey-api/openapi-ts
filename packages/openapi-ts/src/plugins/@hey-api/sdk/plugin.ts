import type ts from 'typescript';

import { compiler } from '../../../compiler';
import type { ObjectValue } from '../../../compiler/types';
import {
  clientModulePath,
  clientOptionsTypeName,
} from '../../../generate/client';
import type { IRContext } from '../../../ir/context';
import type { IROperationObject } from '../../../ir/ir';
import { hasOperationDataRequired } from '../../../ir/operation';
import { camelCase } from '../../../utils/camelCase';
import { escapeComment } from '../../../utils/escape';
import { getServiceName } from '../../../utils/postprocess';
import { irRef } from '../../../utils/ref';
import { transformServiceName } from '../../../utils/transform';
import type { PluginHandler } from '../../types';
import { operationTransformerIrRef } from '../transformers/plugin';
import {
  operationOptionsType,
  serviceFunctionIdentifier,
} from './plugin-legacy';
import type { Config } from './types';

interface OperationIRRef {
  /**
   * Operation ID
   */
  id: string;
}

export const operationIrRef = ({
  id,
  type,
}: OperationIRRef & {
  type: 'data' | 'error' | 'errors' | 'response' | 'responses';
}): string => {
  let affix = '';
  switch (type) {
    case 'data':
      affix = 'Data';
      break;
    case 'error':
      // error union
      affix = 'Error';
      break;
    case 'errors':
      // errors map
      affix = 'Errors';
      break;
    case 'response':
      // response union
      affix = 'Response';
      break;
    case 'responses':
      // responses map
      affix = 'Responses';
      break;
  }
  return `${irRef}${camelCase({
    input: id,
    pascalCase: true,
  })}${affix}`;
};

const sdkId = 'sdk';

const requestOptions = ({
  context,
  operation,
  path,
}: {
  context: IRContext;
  operation: IROperationObject;
  path: string;
}) => {
  const file = context.file({ id: sdkId })!;
  const sdkOutput = file.nameWithoutExtension();

  const obj: ObjectValue[] = [{ spread: 'options' }];

  if (operation.body) {
    switch (operation.body.type) {
      case 'form-data':
        obj.push({ spread: 'formDataBodySerializer' });
        file.import({
          module: clientModulePath({
            config: context.config,
            sourceOutput: sdkOutput,
          }),
          name: 'formDataBodySerializer',
        });
        break;
      case 'json':
        break;
      case 'url-search-params':
        obj.push({ spread: 'urlSearchParamsBodySerializer' });
        file.import({
          module: clientModulePath({
            config: context.config,
            sourceOutput: sdkOutput,
          }),
          name: 'urlSearchParamsBodySerializer',
        });
        break;
    }

    obj.push({
      key: 'headers',
      value: [
        {
          key: 'Content-Type',
          // form-data does not need Content-Type header, browser will set it automatically
          value:
            operation.body.type === 'form-data'
              ? null
              : operation.body.mediaType,
        },
        {
          spread: 'options?.headers',
        },
      ],
    });
  }

  // TODO: parser - set parseAs to skip inference if every response has the same
  // content type. currently impossible because successes do not contain
  // header information

  obj.push({
    key: 'url',
    value: path,
  });

  const fileTransformers = context.file({ id: 'transformers' });
  if (fileTransformers) {
    const identifier = fileTransformers.identifier({
      $ref: operationTransformerIrRef({ id: operation.id, type: 'response' }),
      namespace: 'value',
    });
    if (identifier.name) {
      file.import({
        module: file.relativePathToFile({ context, id: 'transformers' }),
        name: identifier.name,
      });
      obj.push({
        key: 'responseTransformer',
        value: identifier.name,
      });
    }
  }

  for (const name in operation.parameters?.query) {
    const parameter = operation.parameters.query[name];
    if (
      (parameter.schema.type === 'array' ||
        parameter.schema.type === 'tuple') &&
      (parameter.style !== 'form' || !parameter.explode)
    ) {
      // override the default settings for `querySerializer`
      if (context.config.client.name === '@hey-api/client-fetch') {
        obj.push({
          key: 'querySerializer',
          value: [
            {
              key: 'array',
              value: [
                {
                  key: 'explode',
                  value: false,
                },
                {
                  key: 'style',
                  value: 'form',
                },
              ],
            },
          ],
        });
      }
      break;
    }
  }

  return compiler.objectExpression({
    identifiers: ['responseTransformer'],
    obj,
  });
};

const generateClassSdk = ({ context }: { context: IRContext }) => {
  const file = context.file({ id: sdkId })!;
  const typesModule = file.relativePathToFile({ context, id: 'types' });

  const sdks = new Map<string, Array<ts.MethodDeclaration>>();

  context.subscribe('operation', ({ method, operation, path }) => {
    const identifierData = context.file({ id: 'types' })!.identifier({
      $ref: operationIrRef({ id: operation.id, type: 'data' }),
      namespace: 'type',
    });
    if (identifierData.name) {
      file.import({
        asType: true,
        module: typesModule,
        name: identifierData.name,
      });
    }

    const identifierError = context.file({ id: 'types' })!.identifier({
      $ref: operationIrRef({ id: operation.id, type: 'error' }),
      namespace: 'type',
    });
    if (identifierError.name) {
      file.import({
        asType: true,
        module: typesModule,
        name: identifierError.name,
      });
    }

    const identifierResponse = context.file({ id: 'types' })!.identifier({
      $ref: operationIrRef({ id: operation.id, type: 'response' }),
      namespace: 'type',
    });
    if (identifierResponse.name) {
      file.import({
        asType: true,
        module: typesModule,
        name: identifierResponse.name,
      });
    }

    const node = compiler.methodDeclaration({
      accessLevel: 'public',
      comment: [
        operation.deprecated && '@deprecated',
        operation.summary && escapeComment(operation.summary),
        operation.description && escapeComment(operation.description),
      ],
      isStatic: true,
      name: serviceFunctionIdentifier({
        config: context.config,
        handleIllegal: false,
        id: operation.id,
        operation,
      }),
      parameters: [
        {
          isRequired: hasOperationDataRequired(operation),
          name: 'options',
          type: operationOptionsType({
            importedType: identifierData.name,
            throwOnError: 'ThrowOnError',
          }),
        },
      ],
      returnType: undefined,
      statements: [
        compiler.returnFunctionCall({
          args: [
            requestOptions({
              context,
              operation,
              path,
            }),
          ],
          name: `(options?.client ?? client).${method}`,
          types: [
            identifierResponse.name || 'unknown',
            identifierError.name || 'unknown',
            'ThrowOnError',
          ],
        }),
      ],
      types: [
        {
          default: false,
          extends: 'boolean',
          name: 'ThrowOnError',
        },
      ],
    });

    const uniqueTags = Array.from(new Set(operation.tags));
    if (!uniqueTags.length) {
      uniqueTags.push('default');
    }

    for (const tag of uniqueTags) {
      const name = getServiceName(tag);
      const nodes = sdks.get(name) ?? [];
      nodes.push(node);
      sdks.set(name, nodes);
    }
  });

  context.subscribe('after', () => {
    for (const [name, nodes] of sdks) {
      const node = compiler.classDeclaration({
        decorator: undefined,
        members: nodes,
        name: transformServiceName({
          config: context.config,
          name,
        }),
      });
      file.add(node);
    }
  });
};

const generateFlatSdk = ({ context }: { context: IRContext }) => {
  const file = context.file({ id: sdkId })!;
  const typesModule = file.relativePathToFile({ context, id: 'types' });

  context.subscribe('operation', ({ method, operation, path }) => {
    const identifierData = context.file({ id: 'types' })!.identifier({
      $ref: operationIrRef({ id: operation.id, type: 'data' }),
      namespace: 'type',
    });
    if (identifierData.name) {
      file.import({
        asType: true,
        module: typesModule,
        name: identifierData.name,
      });
    }

    const identifierError = context.file({ id: 'types' })!.identifier({
      $ref: operationIrRef({ id: operation.id, type: 'error' }),
      namespace: 'type',
    });
    if (identifierError.name) {
      file.import({
        asType: true,
        module: typesModule,
        name: identifierError.name,
      });
    }

    const identifierResponse = context.file({ id: 'types' })!.identifier({
      $ref: operationIrRef({ id: operation.id, type: 'response' }),
      namespace: 'type',
    });
    if (identifierResponse.name) {
      file.import({
        asType: true,
        module: typesModule,
        name: identifierResponse.name,
      });
    }

    const node = compiler.constVariable({
      comment: [
        operation.deprecated && '@deprecated',
        operation.summary && escapeComment(operation.summary),
        operation.description && escapeComment(operation.description),
      ],
      exportConst: true,
      expression: compiler.arrowFunction({
        parameters: [
          {
            isRequired: hasOperationDataRequired(operation),
            name: 'options',
            type: operationOptionsType({
              importedType: identifierData.name,
              throwOnError: 'ThrowOnError',
            }),
          },
        ],
        returnType: undefined,
        statements: [
          compiler.returnFunctionCall({
            args: [
              requestOptions({
                context,
                operation,
                path,
              }),
            ],
            name: `(options?.client ?? client).${method}`,
            types: [
              identifierResponse.name || 'unknown',
              identifierError.name || 'unknown',
              'ThrowOnError',
            ],
          }),
        ],
        types: [
          {
            default: false,
            extends: 'boolean',
            name: 'ThrowOnError',
          },
        ],
      }),
      name: serviceFunctionIdentifier({
        config: context.config,
        handleIllegal: true,
        id: operation.id,
        operation,
      }),
    });
    file.add(node);
  });
};

export const handler: PluginHandler<Config> = ({ context, plugin }) => {
  if (!context.config.client.name) {
    throw new Error(
      '🚫 client needs to be set to generate SDKs - which HTTP client do you want to use?',
    );
  }

  const file = context.createFile({
    id: sdkId,
    path: plugin.output,
  });
  const sdkOutput = file.nameWithoutExtension();

  // import required packages and core files
  file.import({
    module: clientModulePath({
      config: context.config,
      sourceOutput: sdkOutput,
    }),
    name: 'createClient',
  });
  file.import({
    module: clientModulePath({
      config: context.config,
      sourceOutput: sdkOutput,
    }),
    name: 'createConfig',
  });
  file.import({
    asType: true,
    module: clientModulePath({
      config: context.config,
      sourceOutput: sdkOutput,
    }),
    name: clientOptionsTypeName(),
  });

  // define client first
  const statement = compiler.constVariable({
    exportConst: true,
    expression: compiler.callExpression({
      functionName: 'createClient',
      parameters: [
        compiler.callExpression({
          functionName: 'createConfig',
        }),
      ],
    }),
    name: 'client',
  });
  file.add(statement);

  if (plugin.asClass) {
    generateClassSdk({ context });
  } else {
    generateFlatSdk({ context });
  }
};

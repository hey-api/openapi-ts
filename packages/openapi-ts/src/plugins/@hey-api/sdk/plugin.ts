import type ts from 'typescript';

import { compiler } from '../../../compiler';
import type { ObjectValue } from '../../../compiler/types';
import { clientApi, clientModulePath } from '../../../generate/client';
import type { TypeScriptFile } from '../../../generate/files';
import {
  hasOperationDataRequired,
  statusCodeToGroup,
} from '../../../ir/operation';
import type { IR } from '../../../ir/types';
import { escapeComment } from '../../../utils/escape';
import { getServiceName } from '../../../utils/postprocess';
import { transformServiceName } from '../../../utils/transform';
import { operationIrRef } from '../../shared/utils/ref';
import type { Plugin } from '../../types';
import { zodId } from '../../zod/plugin';
import {
  operationTransformerIrRef,
  transformersId,
} from '../transformers/plugin';
import {
  importIdentifierData,
  importIdentifierError,
  importIdentifierResponse,
} from '../typescript/ref';
import { serviceFunctionIdentifier } from './plugin-legacy';
import type { Config } from './types';

// type copied from client packages
interface Auth {
  in?: 'header' | 'query';
  name?: string;
  scheme?: 'basic' | 'bearer';
  type: 'apiKey' | 'http';
}

export const operationOptionsType = ({
  context,
  file,
  operation,
  throwOnError,
}: {
  context: IR.Context;
  file: TypeScriptFile;
  operation: IR.OperationObject;
  throwOnError?: string;
}) => {
  const identifierData = importIdentifierData({ context, file, operation });

  const optionsName = clientApi.Options.name;

  // if (context.config.client.name === '@hey-api/client-nuxt') {
  //   const identifierError = importIdentifierError({ context, file, operation });
  //   return `${optionsName}<${identifierData?.name || 'unknown'}, ${identifierError?.name || 'unknown'}, TComposable>`;
  // }

  // TODO: refactor this to be more generic, works for now
  if (throwOnError) {
    return `${optionsName}<${identifierData?.name || 'unknown'}, ${throwOnError}>`;
  }
  return identifierData
    ? `${optionsName}<${identifierData.name}>`
    : optionsName;
};

const sdkId = 'sdk';

/**
 * Infers `responseType` value from provided response content type. This is
 * an adapted version of `getParseAs()` from the Fetch API client.
 *
 * From Axios documentation:
 * `responseType` indicates the type of data that the server will respond with
 * options are: 'arraybuffer', 'document', 'json', 'text', 'stream'
 * browser only: 'blob'
 */
export const getResponseType = (
  contentType: string | null | undefined,
):
  | 'arraybuffer'
  | 'blob'
  | 'document'
  | 'json'
  | 'stream'
  | 'text'
  | undefined => {
  if (!contentType) {
    return;
  }

  const cleanContent = contentType.split(';')[0]?.trim();

  if (!cleanContent) {
    return;
  }

  if (
    cleanContent.startsWith('application/json') ||
    cleanContent.endsWith('+json')
  ) {
    return 'json';
  }

  // Axios does not handle form data out of the box
  // if (cleanContent === 'multipart/form-data') {
  //   return 'formData';
  // }

  if (
    ['application/', 'audio/', 'image/', 'video/'].some((type) =>
      cleanContent.startsWith(type),
    )
  ) {
    return 'blob';
  }

  if (cleanContent.startsWith('text/')) {
    return 'text';
  }
};

// TODO: parser - handle more security types
const securitySchemeObjectToAuthObject = ({
  securitySchemeObject,
}: {
  securitySchemeObject: IR.SecurityObject;
}): Auth | undefined => {
  if (securitySchemeObject.type === 'oauth2') {
    // TODO: parser - handle more/multiple oauth2 flows
    if (securitySchemeObject.flows.password) {
      return {
        scheme: 'bearer',
        type: 'http',
      };
    }

    return;
  }

  if (securitySchemeObject.type === 'apiKey') {
    if (securitySchemeObject.in === 'header') {
      return {
        name: securitySchemeObject.name,
        type: 'apiKey',
      };
    }

    // TODO: parser - support cookies auth
    if (securitySchemeObject.in === 'query') {
      return {
        in: securitySchemeObject.in,
        name: securitySchemeObject.name,
        type: 'apiKey',
      };
    }

    return;
  }

  if (securitySchemeObject.type === 'http') {
    if (
      securitySchemeObject.scheme === 'bearer' ||
      securitySchemeObject.scheme === 'basic'
    ) {
      return {
        scheme: securitySchemeObject.scheme,
        type: 'http',
      };
    }

    return;
  }
};

const operationAuth = ({
  operation,
  plugin,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
  plugin: Plugin.Instance<Config>;
}): Array<Auth> => {
  if (!operation.security || !plugin.auth) {
    return [];
  }

  const auth: Array<Auth> = [];

  for (const securitySchemeObject of operation.security) {
    const authObject = securitySchemeObjectToAuthObject({
      securitySchemeObject,
    });
    if (authObject) {
      auth.push(authObject);
    } else {
      console.warn(
        `❗️ SDK warning: unsupported security scheme. Please open an issue if you'd like it added https://github.com/hey-api/openapi-ts/issues\n${JSON.stringify(securitySchemeObject, null, 2)}`,
      );
    }
  }

  return auth;
};

const operationStatements = ({
  context,
  operation,
  plugin,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
  plugin: Plugin.Instance<Config>;
}): Array<ts.Statement> => {
  const file = context.file({ id: sdkId })!;
  const sdkOutput = file.nameWithoutExtension();

  const identifierError = importIdentifierError({ context, file, operation });
  const identifierResponse = importIdentifierResponse({
    context,
    file,
    operation,
  });

  // TODO: transform parameters
  // const query = {
  //   BarBaz: options.query.bar_baz,
  //   qux_quux: options.query.qux_quux,
  //   fooBar: options.query.foo_bar,
  // };

  // if (operation.parameters) {
  //   for (const name in operation.parameters.query) {
  //     const parameter = operation.parameters.query[name]
  //     if (parameter.name !== fieldName({ context, name: parameter.name })) {
  //       console.warn(parameter.name)
  //     }
  //   }
  // }

  const requestOptions: ObjectValue[] = [];

  if (operation.body) {
    switch (operation.body.type) {
      case 'form-data':
        requestOptions.push({ spread: 'formDataBodySerializer' });
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
        requestOptions.push({ spread: 'urlSearchParamsBodySerializer' });
        file.import({
          module: clientModulePath({
            config: context.config,
            sourceOutput: sdkOutput,
          }),
          name: 'urlSearchParamsBodySerializer',
        });
        break;
    }
  }

  if (context.config.client.name === '@hey-api/client-axios') {
    // try to infer `responseType` option for Axios. We don't need this in
    // Fetch API client because it automatically detects the correct response
    // during runtime.
    for (const statusCode in operation.responses) {
      // this doesn't handle default status code for now
      if (statusCodeToGroup({ statusCode }) === '2XX') {
        const response = operation.responses[statusCode];
        const responseType = getResponseType(response?.mediaType);
        // json is the default, skip it
        if (responseType && responseType !== 'json') {
          requestOptions.push({
            key: 'responseType',
            value: responseType,
          });
        }
      }
    }
  }

  // TODO: parser - set parseAs to skip inference if every response has the same
  // content type. currently impossible because successes do not contain
  // header information

  const auth = operationAuth({ context, operation, plugin });
  if (auth.length) {
    requestOptions.push({
      key: 'security',
      value: compiler.arrayLiteralExpression({ elements: auth }),
    });
  }

  for (const name in operation.parameters?.query) {
    const parameter = operation.parameters.query[name]!;
    if (
      (parameter.schema.type === 'array' ||
        parameter.schema.type === 'tuple') &&
      (parameter.style !== 'form' || !parameter.explode)
    ) {
      // override the default settings for `querySerializer`
      requestOptions.push({
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
      break;
    }
  }

  if (plugin.transformer === '@hey-api/transformers') {
    const identifierTransformer = context
      .file({ id: transformersId })!
      .identifier({
        $ref: operationTransformerIrRef({ id: operation.id, type: 'response' }),
        namespace: 'value',
      });

    if (identifierTransformer.name) {
      file.import({
        module: file.relativePathToFile({
          context,
          id: transformersId,
        }),
        name: identifierTransformer.name,
      });

      requestOptions.push({
        key: 'responseTransformer',
        value: identifierTransformer.name,
      });
    }
  }

  if (plugin.validator === 'zod') {
    const identifierSchema = context.file({ id: zodId })!.identifier({
      $ref: operationIrRef({
        case: 'camelCase',
        id: operation.id,
        type: 'response',
      }),
      namespace: 'value',
    });

    if (identifierSchema.name) {
      file.import({
        module: file.relativePathToFile({
          context,
          id: zodId,
        }),
        name: identifierSchema.name,
      });

      requestOptions.push({
        key: 'responseValidator',
        value: compiler.arrowFunction({
          async: true,
          parameters: [
            {
              name: 'data',
            },
          ],
          statements: [
            compiler.returnStatement({
              expression: compiler.awaitExpression({
                expression: compiler.callExpression({
                  functionName: compiler.propertyAccessExpression({
                    expression: compiler.identifier({
                      text: identifierSchema.name,
                    }),
                    name: compiler.identifier({ text: 'parseAsync' }),
                  }),
                  parameters: [compiler.identifier({ text: 'data' })],
                }),
              }),
            }),
          ],
        }),
      });
    }
  }

  requestOptions.push({
    key: 'url',
    value: operation.path,
  });

  // options must go last to allow overriding parameters above
  requestOptions.push({ spread: 'options' });
  if (operation.body) {
    requestOptions.push({
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

  return [
    compiler.returnFunctionCall({
      args: [
        compiler.objectExpression({
          identifiers: ['responseTransformer'],
          obj: requestOptions,
        }),
      ],
      name: `(options?.client ?? client).${operation.method}`,
      types: [
        identifierResponse.name || 'unknown',
        identifierError.name || 'unknown',
        'ThrowOnError',
      ],
    }),
  ];
};

const generateClassSdk = ({
  context,
  plugin,
}: {
  context: IR.Context;
  plugin: Plugin.Instance<Config>;
}) => {
  const file = context.file({ id: sdkId })!;
  const sdks = new Map<string, Array<ts.MethodDeclaration>>();

  context.subscribe('operation', ({ operation }) => {
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
            context,
            file,
            operation,
            throwOnError: 'ThrowOnError',
          }),
        },
      ],
      returnType: undefined,
      statements: operationStatements({
        context,
        operation,
        plugin,
      }),
      types: [
        {
          default: plugin.throwOnError,
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

const generateFlatSdk = ({
  context,
  plugin,
}: {
  context: IR.Context;
  plugin: Plugin.Instance<Config>;
}) => {
  const file = context.file({ id: sdkId })!;

  context.subscribe('operation', ({ operation }) => {
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
              context,
              file,
              operation,
              throwOnError: 'ThrowOnError',
            }),
          },
        ],
        returnType: undefined,
        statements: operationStatements({
          context,
          operation,
          plugin,
        }),
        types: [
          {
            default: plugin.throwOnError,
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

export const handler: Plugin.Handler<Config> = ({ context, plugin }) => {
  if (!context.config.client.name) {
    throw new Error(
      '🚫 client needs to be set to generate SDKs - which HTTP client do you want to use?',
    );
  }

  const file = context.createFile({
    exportFromIndex: plugin.exportFromIndex,
    id: sdkId,
    path: plugin.output,
  });
  const sdkOutput = file.nameWithoutExtension();

  // import required packages and core files
  const clientModule = clientModulePath({
    config: context.config,
    sourceOutput: sdkOutput,
  });
  file.import({
    module: clientModule,
    name: 'createClient',
  });
  file.import({
    module: clientModule,
    name: 'createConfig',
  });
  file.import({
    ...clientApi.Options,
    module: clientModule,
  });

  // define client first
  const statement = compiler.constVariable({
    exportConst: true,
    expression: compiler.callExpression({
      functionName: 'createClient',
      parameters: [
        compiler.callExpression({
          functionName: 'createConfig',
          parameters: [
            plugin.throwOnError
              ? compiler.objectExpression({
                  obj: [
                    {
                      key: 'throwOnError',
                      value: plugin.throwOnError,
                    },
                  ],
                })
              : undefined,
          ],
        }),
      ],
    }),
    name: 'client',
  });
  file.add(statement);

  if (plugin.asClass) {
    generateClassSdk({ context, plugin });
  } else {
    generateFlatSdk({ context, plugin });
  }
};

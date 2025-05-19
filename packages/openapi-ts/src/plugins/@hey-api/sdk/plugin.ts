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
import { getServiceName } from '../../../utils/postprocess';
import { transformServiceName } from '../../../utils/transform';
import { createOperationComment } from '../../shared/utils/operation';
import type { Plugin } from '../../types';
import { clientId, getClientPlugin } from '../client-core/utils';
import {
  operationTransformerIrRef,
  transformersId,
} from '../transformers/plugin';
import {
  importIdentifierData,
  importIdentifierError,
  importIdentifierResponse,
} from '../typescript/ref';
import { nuxtTypeComposable, nuxtTypeDefault } from './constants';
import { serviceFunctionIdentifier } from './plugin-legacy';
import { createTypeOptions } from './typeOptions';
import type { Config } from './types';
import { createResponseValidator } from './validator';

// copy-pasted from @hey-api/client-core
export interface Auth {
  /**
   * Which part of the request do we use to send the auth?
   *
   * @default 'header'
   */
  in?: 'header' | 'query' | 'cookie';
  /**
   * Header or query parameter name.
   *
   * @default 'Authorization'
   */
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
  const identifierResponse = importIdentifierResponse({
    context,
    file,
    operation,
  });

  const optionsName = clientApi.Options.name;

  const client = getClientPlugin(context.config);
  if (client.name === '@hey-api/client-nuxt') {
    return `${optionsName}<${nuxtTypeComposable}, ${identifierData.name || 'unknown'}, ${identifierResponse.name || 'unknown'}, ${nuxtTypeDefault}>`;
  }

  // TODO: refactor this to be more generic, works for now
  if (throwOnError) {
    return `${optionsName}<${identifierData.name || 'unknown'}, ${throwOnError}>`;
  }
  return identifierData.name
    ? `${optionsName}<${identifierData.name}>`
    : optionsName;
};

export const sdkId = 'sdk';

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
  if (securitySchemeObject.type === 'openIdConnect') {
    return {
      scheme: 'bearer',
      type: 'http',
    };
  }

  if (securitySchemeObject.type === 'oauth2') {
    if (
      securitySchemeObject.flows.password ||
      securitySchemeObject.flows.authorizationCode ||
      securitySchemeObject.flows.clientCredentials ||
      securitySchemeObject.flows.implicit
    ) {
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

    if (
      securitySchemeObject.in === 'query' ||
      securitySchemeObject.in == 'cookie'
    ) {
      return {
        in: securitySchemeObject.in,
        name: securitySchemeObject.name,
        type: 'apiKey',
      };
    }

    return;
  }

  if (securitySchemeObject.type === 'http') {
    const scheme = securitySchemeObject.scheme.toLowerCase();
    if (scheme === 'bearer' || scheme === 'basic') {
      return {
        scheme: scheme as 'bearer' | 'basic',
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
  isRequiredOptions,
  operation,
  plugin,
}: {
  context: IR.Context;
  isRequiredOptions: boolean;
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
        // jsonBodySerializer is the default, no need to specify
        break;
      case 'text':
      case 'octet-stream':
        // ensure we don't use any serializer by default
        requestOptions.push({
          key: 'bodySerializer',
          value: null,
        });
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

  const client = getClientPlugin(context.config);
  if (client.name === '@hey-api/client-axios') {
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

  const responseValidator = createResponseValidator({
    context,
    operation,
    plugin,
  });
  if (responseValidator) {
    requestOptions.push({
      key: 'responseValidator',
      value: responseValidator,
    });
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

  const isNuxtClient = client.name === '@hey-api/client-nuxt';
  const responseType = identifierResponse.name || 'unknown';
  const errorType = identifierError.name || 'unknown';

  const heyApiClient = plugin.client
    ? file.import({
        alias: '_heyApiClient',
        module: file.relativePathToFile({
          context,
          id: clientId,
        }),
        name: 'client',
      })
    : undefined;

  const optionsClient = compiler.propertyAccessExpression({
    expression: compiler.identifier({ text: 'options' }),
    isOptional: !isRequiredOptions,
    name: 'client',
  });

  return [
    compiler.returnFunctionCall({
      args: [
        compiler.objectExpression({
          identifiers: ['responseTransformer'],
          obj: requestOptions,
        }),
      ],
      name: compiler.propertyAccessExpression({
        expression: heyApiClient?.name
          ? compiler.binaryExpression({
              left: optionsClient,
              operator: '??',
              right: compiler.identifier({ text: heyApiClient.name }),
            })
          : optionsClient,
        name: compiler.identifier({ text: operation.method }),
      }),
      types: isNuxtClient
        ? [
            nuxtTypeComposable,
            `${responseType} | ${nuxtTypeDefault}`,
            errorType,
            nuxtTypeDefault,
          ]
        : [responseType, errorType, 'ThrowOnError'],
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
  const client = getClientPlugin(context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';
  const file = context.file({ id: sdkId })!;
  const sdks = new Map<string, Array<ts.MethodDeclaration>>();

  context.subscribe('operation', ({ operation }) => {
    const isRequiredOptions =
      !plugin.client || isNuxtClient || hasOperationDataRequired(operation);
    const identifierResponse = importIdentifierResponse({
      context,
      file,
      operation,
    });
    const node = compiler.methodDeclaration({
      accessLevel: 'public',
      comment: createOperationComment({ operation }),
      isStatic: true,
      name: serviceFunctionIdentifier({
        config: context.config,
        handleIllegal: false,
        id: operation.id,
        operation,
      }),
      parameters: [
        {
          isRequired: isRequiredOptions,
          name: 'options',
          type: operationOptionsType({
            context,
            file,
            operation,
            throwOnError: isNuxtClient ? undefined : 'ThrowOnError',
          }),
        },
      ],
      returnType: undefined,
      statements: operationStatements({
        context,
        isRequiredOptions,
        operation,
        plugin,
      }),
      types: isNuxtClient
        ? [
            {
              // default: compiler.ots.string('$fetch'),
              extends: compiler.typeNode('Composable'),
              name: nuxtTypeComposable,
            },
            {
              default: identifierResponse.name
                ? compiler.typeReferenceNode({
                    typeName: identifierResponse.name,
                  })
                : compiler.typeNode('undefined'),
              extends: identifierResponse.name
                ? compiler.typeReferenceNode({
                    typeName: identifierResponse.name,
                  })
                : undefined,
              name: nuxtTypeDefault,
            },
          ]
        : [
            {
              default:
                ('throwOnError' in client ? client.throwOnError : false) ??
                false,
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
  const client = getClientPlugin(context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';
  const file = context.file({ id: sdkId })!;

  context.subscribe('operation', ({ operation }) => {
    const isRequiredOptions =
      !plugin.client || isNuxtClient || hasOperationDataRequired(operation);
    const identifierResponse = importIdentifierResponse({
      context,
      file,
      operation,
    });
    const node = compiler.constVariable({
      comment: createOperationComment({ operation }),
      exportConst: true,
      expression: compiler.arrowFunction({
        parameters: [
          {
            isRequired: isRequiredOptions,
            name: 'options',
            type: operationOptionsType({
              context,
              file,
              operation,
              throwOnError: isNuxtClient ? undefined : 'ThrowOnError',
            }),
          },
        ],
        returnType: undefined,
        statements: operationStatements({
          context,
          isRequiredOptions,
          operation,
          plugin,
        }),
        types: isNuxtClient
          ? [
              {
                // default: compiler.ots.string('$fetch'),
                extends: compiler.typeNode('Composable'),
                name: nuxtTypeComposable,
              },
              {
                default: identifierResponse.name
                  ? compiler.typeReferenceNode({
                      typeName: identifierResponse.name,
                    })
                  : compiler.typeNode('undefined'),
                extends: identifierResponse.name
                  ? compiler.typeReferenceNode({
                      typeName: identifierResponse.name,
                    })
                  : undefined,
                name: nuxtTypeDefault,
              },
            ]
          : [
              {
                default:
                  ('throwOnError' in client ? client.throwOnError : false) ??
                  false,
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
  const file = context.createFile({
    exportFromIndex: plugin.exportFromIndex,
    id: sdkId,
    path: plugin.output,
  });

  // import required packages and core files
  const clientModule = clientModulePath({
    config: context.config,
    sourceOutput: file.nameWithoutExtension(),
  });
  const clientOptions = file.import({
    ...clientApi.Options,
    alias: 'ClientOptions',
    module: clientModule,
  });

  const client = getClientPlugin(context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';
  if (isNuxtClient) {
    file.import({
      asType: true,
      module: clientModule,
      name: 'Composable',
    });
  }

  createTypeOptions({
    clientOptions,
    context,
    plugin,
  });

  if (plugin.asClass) {
    generateClassSdk({ context, plugin });
  } else {
    generateFlatSdk({ context, plugin });
  }
};

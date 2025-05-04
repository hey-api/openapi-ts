import type { Auth } from '@hey-api/client-core';
import type ts from 'typescript';

import { compiler } from '../../../compiler';
import type { ObjectValue } from '../../../compiler/types';
import { clientModulePath } from '../../../generate/client';
import { statusCodeToGroup } from '../../../ir/operation';
import type { IR } from '../../../ir/types';
import { operationIrRef } from '../../shared/utils/ref';
import type { Plugin } from '../../types';
import { zodId } from '../../zod/plugin';
import { clientId, getClientPlugin } from '../client-core/utils';
import {
  operationTransformerIrRef,
  transformersId,
} from '../transformers/plugin';
import {
  importIdentifierError,
  importIdentifierResponse,
} from '../typescript/ref';
import { nuxtTypeComposable, nuxtTypeDefault, sdkId } from './constants';
import type { SdkParameter } from './params';
import { getResponseType } from './response';
import type { Config } from './types';

const clientParamsName = 'clientParams';

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

const fieldsToArgsConfig = ({
  argsConfig,
  parameter,
}: {
  argsConfig: Array<unknown>;
  parameter: SdkParameter;
}) => {
  if (parameter.fields) {
    for (const field of parameter.fields) {
      if ('in' in field) {
        // TODO: handle positional arguments
        // field.in
      } else if (field.args) {
        const obj: Array<unknown> = [];

        for (const config of field.args) {
          obj.push({
            key: 'in',
            value: config.in,
          });

          if (config.key) {
            obj.push({
              key: 'key',
              value: config.key,
            });
          }

          if (config.map) {
            obj.push({
              key: 'map',
              value: config.map,
            });
          }
        }

        argsConfig.push(
          compiler.objectExpression({
            obj: [
              {
                key: 'args',
                value: compiler.arrayLiteralExpression({
                  elements: [compiler.objectExpression({ obj })],
                }),
              },
            ],
          }),
        );
      }
    }
  }
};

const buildClientParamsNode = ({
  context,
  parameters,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
  parameters: ReadonlyArray<SdkParameter>;
  plugin: Plugin.Instance<Config>;
}) => {
  const file = context.file({ id: sdkId })!;
  const sdkOutput = file.nameWithoutExtension();

  const buildClientParams = file.import({
    alias: '_buildClientParams',
    module: clientModulePath({
      config: context.config,
      sourceOutput: sdkOutput,
    }),
    name: 'buildClientParams',
  });

  const args: Array<unknown> = [];
  const argsConfig: Array<unknown> = [];

  for (const [index, parameter] of parameters.entries()) {
    if ('name' in parameter && index !== parameters.length - 1) {
      args.push(compiler.identifier({ text: parameter.name }));
    }

    fieldsToArgsConfig({
      argsConfig,
      parameter,
    });
  }

  const clientParamsNode = compiler.constVariable({
    expression: compiler.callExpression({
      functionName: buildClientParams.name,
      parameters: [
        compiler.arrayLiteralExpression({ elements: args }),
        compiler.arrayLiteralExpression({ elements: argsConfig }),
      ],
    }),
    name: clientParamsName,
  });

  return clientParamsNode;
};

export const createStatements = ({
  context,
  operation,
  parameters,
  plugin,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
  parameters: ReadonlyArray<SdkParameter>;
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

  const hasClientParams = plugin.params !== 'namespaced';

  // options must go last to allow overriding parameters above
  requestOptions.push({ spread: 'options' });
  if (parameters.length > 1) {
    if (hasClientParams) {
      requestOptions.push({ spread: clientParamsName });
    } else {
      requestOptions.push({ spread: 'params' });
    }
  }

  // TODO: add hasParams check, that would be true if we're using params and operation.parameters?.header
  if (operation.body || hasClientParams) {
    const value: Array<unknown> = [
      {
        spread: 'options?.headers',
      },
    ];

    if (operation.body) {
      value.unshift({
        key: 'Content-Type',
        // form-data does not need Content-Type header, browser will set it automatically
        value:
          operation.body.type === 'form-data' ? null : operation.body.mediaType,
      });
    }

    if (hasClientParams) {
      // TODO: clientParams, know when to use params and when to use clientParams
      value.push({
        spread: `${clientParamsName}.headers`,
      });
    } else if (operation.parameters?.header) {
      value.push({
        spread: 'params?.headers',
      });
    }

    requestOptions.push({
      key: 'headers',
      value,
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

  const paramOptions = parameters.at(-1)!;
  const optionsClient = compiler.propertyAccessExpression({
    expression: compiler.identifier({ text: 'options' }),
    isOptional: 'name' in paramOptions ? !paramOptions.isRequired : true,
    name: 'client',
  });

  const statements: Array<ts.Statement> = [
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

  if (hasClientParams) {
    const clientParamsNode = buildClientParamsNode({
      context,
      operation,
      parameters,
      plugin,
    });
    statements.unshift(clientParamsNode);
  }

  return statements;
};

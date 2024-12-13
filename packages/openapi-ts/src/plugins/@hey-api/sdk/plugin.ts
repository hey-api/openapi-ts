import type ts from 'typescript';

import { compiler } from '../../../compiler';
import type { ObjectValue } from '../../../compiler/types';
import { clientApi, clientModulePath } from '../../../generate/client';
import type { IRContext } from '../../../ir/context';
import type { IROperationObject } from '../../../ir/ir';
import {
  hasOperationDataRequired,
  statusCodeToGroup,
} from '../../../ir/operation';
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
import { serviceFunctionIdentifier } from './plugin-legacy';
import type { Config } from './types';

export const operationOptionsType = ({
  importedType,
  throwOnError,
}: {
  importedType?: string | false;
  throwOnError?: string;
}) => {
  const optionsName = clientApi.Options.name;
  // TODO: refactor this to be more generic, works for now
  if (throwOnError) {
    return `${optionsName}<${importedType || 'unknown'}, ${throwOnError}>`;
  }
  return importedType ? `${optionsName}<${importedType}>` : optionsName;
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

  const cleanContent = contentType.split(';')[0].trim();

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

const operationStatements = ({
  context,
  operation,
  plugin,
}: {
  context: IRContext;
  operation: IROperationObject;
  plugin: Plugin.Instance<Config>;
}): Array<ts.Statement> => {
  const file = context.file({ id: sdkId })!;
  const sdkOutput = file.nameWithoutExtension();
  const typesModule = file.relativePathToFile({ context, id: 'types' });

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

  const requestOptions: ObjectValue[] = [{ spread: 'options' }];

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

  if (operation.security && plugin.auth) {
    // TODO: parser - handle more security types
    // type copied from client packages
    const security: Array<{
      fn: 'accessToken' | 'apiKey';
      in: 'header' | 'query';
      name: string;
    }> = [];

    for (const securitySchemeObject of operation.security) {
      if (securitySchemeObject.type === 'oauth2') {
        if (securitySchemeObject.flows.password) {
          security.push({
            fn: 'accessToken',
            in: 'header',
            name: 'Authorization',
          });
        }
      } else if (securitySchemeObject.type === 'apiKey') {
        // TODO: parser - support cookies auth
        if (securitySchemeObject.in !== 'cookie') {
          security.push({
            fn: 'apiKey',
            in: securitySchemeObject.in,
            name: securitySchemeObject.name,
          });
        }
      } else {
        console.warn(
          `❗️ SDK warning: security scheme isn't currently supported. Please open an issue if you'd like it added https://github.com/hey-api/openapi-ts/issues\n${JSON.stringify(securitySchemeObject, null, 2)}`,
        );
      }
    }

    if (security.length) {
      requestOptions.push({
        key: 'security',
        value: compiler.arrayLiteralExpression({ elements: security }),
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
  context: IRContext;
  plugin: Plugin.Instance<Config>;
}) => {
  const file = context.file({ id: sdkId })!;
  const typesModule = file.relativePathToFile({ context, id: 'types' });

  const sdks = new Map<string, Array<ts.MethodDeclaration>>();

  context.subscribe('operation', ({ operation }) => {
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
      statements: operationStatements({
        context,
        operation,
        plugin,
      }),
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

const generateFlatSdk = ({
  context,
  plugin,
}: {
  context: IRContext;
  plugin: Plugin.Instance<Config>;
}) => {
  const file = context.file({ id: sdkId })!;
  const typesModule = file.relativePathToFile({ context, id: 'types' });

  context.subscribe('operation', ({ operation }) => {
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
        statements: operationStatements({
          context,
          operation,
          plugin,
        }),
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

export const handler: Plugin.Handler<Config> = ({ context, plugin }) => {
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
    ...clientApi.Options,
    module: clientModulePath({
      config: context.config,
      sourceOutput: sdkOutput,
    }),
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
    generateClassSdk({ context, plugin });
  } else {
    generateFlatSdk({ context, plugin });
  }
};

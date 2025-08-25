import type ts from 'typescript';

import { clientApi, clientModulePath } from '../../../generate/client';
import { GeneratedFile } from '../../../generate/file';
import type { IR } from '../../../ir/types';
import { isOperationParameterRequired } from '../../../openApi';
import type { Comments, FunctionParameter } from '../../../tsc';
import { tsc } from '../../../tsc';
import type { FunctionTypeParameter, ObjectValue } from '../../../tsc/types';
import type {
  Client,
  Model,
  Operation,
  OperationParameter,
  Service,
} from '../../../types/client';
import type { Config as ClientConfig } from '../../../types/config';
import {
  getConfig,
  isLegacyClient,
  legacyNameFromConfig,
} from '../../../utils/config';
import { escapeComment, escapeName } from '../../../utils/escape';
import { reservedJavaScriptKeywordsRegExp } from '../../../utils/regexp';
import { stringCase } from '../../../utils/stringCase';
import { transformClassName } from '../../../utils/transform';
import { setUniqueTypeName } from '../../../utils/type';
import { unique } from '../../../utils/unique';
import { getClientPlugin } from '../client-core/utils';
import type { HeyApiSdkPlugin } from './types';

type OnNode = (node: ts.Node) => void;
type OnImport = (name: string) => void;

export const generateImport = ({
  meta,
  onImport,
  ...setUniqueTypeNameArgs
}: Pick<Parameters<typeof setUniqueTypeName>[0], 'client' | 'nameTransformer'> &
  Pick<Model, 'meta'> & {
    onImport: OnImport;
  }) => {
  // generate imports only for top-level models
  if (!meta) {
    // TODO: this used to return undefined. We could refactor this function to
    // return undefined again, but we will need to improve types so we can safely
    // do `const { name } = generateImport({ meta: ... })` (note when meta is defined
    // we guarantee the response to be an object). For now, nothing relies on this
    // response shape except for plugins, so it was acceptable to patch it that way
    return { created: false, name: '' };
  }

  const { created, name } = setUniqueTypeName({
    meta,
    ...setUniqueTypeNameArgs,
  });
  if (name) {
    onImport(name);
  }
  return { created, name };
};

export const modelResponseTransformerTypeName = (name: string) =>
  `${name}ModelResponseTransformer`;

export const operationDataTypeName = (name: string) =>
  `${stringCase({
    case: 'PascalCase',
    value: name,
  })}Data`;

export const operationErrorTypeName = (name: string) =>
  `${stringCase({
    case: 'PascalCase',
    value: name,
  })}Error`;

// operation response type ends with "Response", it's enough to append "Transformer"
export const operationResponseTransformerTypeName = (name: string) =>
  `${name}Transformer`;

export const operationResponseTypeName = (name: string) =>
  `${stringCase({
    case: 'PascalCase',
    value: name,
  })}Response`;

/**
 * @param importedType unique type name returned from `setUniqueTypeName()`
 * @returns options type
 */
export const operationOptionsLegacyParserType = ({
  importedType,
  throwOnError,
}: {
  importedType?: string | false;
  throwOnError?: string;
}) => {
  const optionsName = clientApi.OptionsLegacyParser.name;
  // TODO: refactor this to be more generic, works for now
  if (throwOnError) {
    return `${optionsName}<${importedType || 'unknown'}, ${throwOnError}>`;
  }
  return importedType ? `${optionsName}<${importedType}>` : optionsName;
};

const toOperationParamType = (
  client: Client,
  operation: Operation,
): FunctionParameter[] => {
  const config = getConfig();

  const { name: importedType } = setUniqueTypeName({
    client,
    meta: {
      // TODO: this should be exact ref to operation for consistency,
      // but name should work too as operation ID is unique
      $ref: operation.name,
      name: operation.name,
    },
    nameTransformer: operationDataTypeName,
  });

  const isRequired = isOperationParameterRequired(operation.parameters);

  if (!isLegacyClient(config)) {
    return [
      {
        isRequired,
        name: 'options',
        type: operationOptionsLegacyParserType({
          importedType,
          throwOnError: 'ThrowOnError',
        }),
      },
    ];
  }

  if (!operation.parameters.length) {
    return [];
  }

  const getDefaultPrintable = (
    p: OperationParameter | Model,
  ): string | undefined => {
    if (p.default === undefined) {
      return;
    }
    return JSON.stringify(p.default, null, 4);
  };

  // legacy configuration
  if (!config.useOptions) {
    return operation.parameters.map((p) => {
      const typePath = `${importedType}['${p.name}']`;
      return {
        default: p?.default,
        isRequired:
          (!p.isRequired && !getDefaultPrintable(p) ? '?' : '') === '',
        name: p.name,
        type: typePath,
      };
    });
  }

  return [
    {
      default: isRequired ? undefined : {},
      name: 'data',
      type: importedType,
    },
  ];
};

const toOperationReturnType = (client: Client, operation: Operation) => {
  const config = getConfig();

  let returnType = tsc.typeNode('void');

  const successResponses = operation.responses.filter((response) =>
    response.responseTypes.includes('success'),
  );

  // TODO: we should return nothing when successes don't exist
  // can't remove this logic without removing request/name config
  // as it complicates things
  if (successResponses.length) {
    const { name: importedType } = setUniqueTypeName({
      client,
      meta: {
        // TODO: this should be exact ref to operation for consistency,
        // but name should work too as operation ID is unique
        $ref: operation.name,
        name: operation.name,
      },
      nameTransformer: operationResponseTypeName,
    });
    returnType = tsc.typeUnionNode({
      types: [importedType],
    });
  }

  if (
    config.useOptions &&
    config.plugins['@hey-api/sdk']?.config.response === 'response'
  ) {
    returnType = tsc.typeNode('ApiResult', [returnType]);
  }

  const clientPlugin = getClientPlugin(config);
  if (clientPlugin.name === 'legacy/angular') {
    returnType = tsc.typeNode('Observable', [returnType]);
  } else {
    returnType = tsc.typeNode('CancelablePromise', [returnType]);
  }

  return returnType;
};

const toOperationComment = (operation: Operation): Comments => {
  const config = getConfig();

  if (!isLegacyClient(config)) {
    const comment = [
      operation.deprecated && '@deprecated',
      operation.summary && escapeComment(operation.summary),
      operation.description && escapeComment(operation.description),
    ];
    return comment;
  }

  let params: string[] = [];

  if (operation.parameters.length) {
    if (config.useOptions) {
      params = [
        '@param data The data for the request.',
        ...operation.parameters.map(
          (parameter) =>
            `@param data.${parameter.name} ${parameter.description ? escapeComment(parameter.description) : ''}`,
        ),
      ];
    } else {
      params = operation.parameters.map(
        (parameter) =>
          `@param ${parameter.name} ${parameter.description ? escapeComment(parameter.description) : ''}`,
      );
    }
  }

  const successResponses = operation.responses.filter((response) =>
    response.responseTypes.includes('success'),
  );

  const comment = [
    operation.deprecated && '@deprecated',
    operation.summary && escapeComment(operation.summary),
    operation.description && escapeComment(operation.description),
    ...params,
    ...successResponses.map(
      (response) =>
        `@returns ${response.type} ${response.description ? escapeComment(response.description) : ''}`,
    ),
    '@throws ApiError',
  ];
  return comment;
};

const toRequestOptions = ({
  client,
  onClientImport,
  onImport,
  operation,
}: {
  client: Client;
  onClientImport: OnImport | undefined;
  onImport: OnImport;
  operation: Operation;
}) => {
  const config = getConfig();

  const name = operationResponseTypeName(operation.name);
  const { name: responseTransformerName } = setUniqueTypeName({
    client,
    meta: {
      $ref: `transformers/${name}`,
      name,
    },
    nameTransformer: operationResponseTransformerTypeName,
  });

  if (responseTransformerName) {
    onImport(responseTransformerName);
  }

  if (!isLegacyClient(config)) {
    let obj: ObjectValue[] = [
      {
        spread: 'options',
      },
    ];

    const bodyParameters = operation.parameters.filter(
      (parameter) => parameter.in === 'body' || parameter.in === 'formData',
    );
    const contents = bodyParameters
      .map(
        (parameter) =>
          parameter.mediaType ||
          (parameter.in === 'formData' ? 'multipart/form-data' : undefined),
      )
      .filter(Boolean)
      .filter(unique);
    if (contents.length === 1) {
      if (contents[0] === 'multipart/form-data') {
        obj = [
          ...obj,
          {
            spread: 'formDataBodySerializer',
          },
          {
            key: 'headers',
            value: [
              {
                // no need for Content-Type header, browser will set it automatically
                key: 'Content-Type',
                value: null,
              },
              {
                spread: 'options?.headers',
              },
            ],
          },
        ];
        onClientImport?.('formDataBodySerializer');
      }

      if (contents[0] === 'application/x-www-form-urlencoded') {
        obj = [
          ...obj,
          {
            spread: 'urlSearchParamsBodySerializer',
          },
          {
            key: 'headers',
            value: [
              {
                key: 'Content-Type',
                value: contents[0],
              },
              {
                spread: 'options?.headers',
              },
            ],
          },
        ];
        onClientImport?.('urlSearchParamsBodySerializer');
      }
    }

    // TODO: set parseAs to skip inference if every result has the same
    // content type. currently impossible because successes do not contain
    // header information

    obj = [
      ...obj,
      {
        key: 'url',
        value: operation.path,
      },
    ];

    if (responseTransformerName) {
      obj = [
        ...obj,
        {
          key: 'responseTransformer',
          value: responseTransformerName,
        },
      ];
    }

    return tsc.objectExpression({
      identifiers: ['responseTransformer'],
      obj,
    });
  }

  const toObj = (parameters: OperationParameter[]) =>
    parameters.reduce(
      (prev, curr) => {
        const key = curr.prop;
        const value = config.useOptions ? `data.${curr.name}` : curr.name;
        if (key === value) {
          prev[key] = key;
        } else if (escapeName(key) === key) {
          prev[key] = value;
        } else {
          prev[`'${key}'`] = value;
        }
        return prev;
      },
      {} as Record<string, unknown>,
    );

  const obj: Record<string, any> = {
    method: operation.method,
    url: operation.path,
  };

  if (operation.parametersPath.length) {
    obj.path = toObj(operation.parametersPath);
  }

  if (operation.parametersCookie.length) {
    obj.cookies = toObj(operation.parametersCookie);
  }

  if (operation.parametersHeader.length) {
    obj.headers = toObj(operation.parametersHeader);
  }

  if (operation.parametersQuery.length) {
    obj.query = toObj(operation.parametersQuery);
  }

  if (operation.parametersForm.length) {
    obj.formData = toObj(operation.parametersForm);
  }

  if (operation.parametersBody) {
    if (operation.parametersBody.in === 'formData') {
      if (config.useOptions) {
        obj.formData = `data.${operation.parametersBody.name}`;
      } else {
        obj.formData = operation.parametersBody.name;
      }
    }
    if (operation.parametersBody.in === 'body') {
      if (config.useOptions) {
        obj.body = `data.${operation.parametersBody.name}`;
      } else {
        obj.body = operation.parametersBody.name;
      }
    }
  }

  if (operation.parametersBody?.mediaType) {
    obj.mediaType = operation.parametersBody?.mediaType;
  }

  if (operation.responseHeader) {
    obj.responseHeader = operation.responseHeader;
  }

  if (responseTransformerName) {
    obj.responseTransformer = responseTransformerName;
  }

  const errorResponses = operation.responses.filter((response) =>
    response.responseTypes.includes('error'),
  );
  if (errorResponses.length > 0) {
    const errors: Record<number | string, string> = {};
    errorResponses.forEach((response) => {
      errors[response.code] = response.description ?? '';
    });
    obj.errors = errors;
  }

  return tsc.objectExpression({
    identifiers: [
      'body',
      'cookies',
      'formData',
      'headers',
      'path',
      'query',
      'responseTransformer',
    ],
    obj,
    shorthand: true,
  });
};

export const serviceFunctionIdentifier = ({
  config,
  handleIllegal,
  id,
  operation,
}: {
  config: ClientConfig;
  handleIllegal?: boolean;
  id: string;
  operation: IR.OperationObject | Operation;
}) => {
  if (config.plugins['@hey-api/sdk']?.config.methodNameBuilder) {
    return config.plugins['@hey-api/sdk'].config.methodNameBuilder(operation);
  }

  if (handleIllegal && id.match(reservedJavaScriptKeywordsRegExp)) {
    return `${id}_`;
  }

  return id;
};

const toOperationStatements = ({
  client,
  onClientImport,
  onImport,
  operation,
}: {
  client: Client;
  onClientImport?: OnImport;
  onImport: OnImport;
  operation: Operation;
}) => {
  const config = getConfig();

  const options = toRequestOptions({
    client,
    onClientImport,
    onImport,
    operation,
  });

  if (!isLegacyClient(config)) {
    const errorType = setUniqueTypeName({
      client,
      meta: {
        // TODO: this should be exact ref to operation for consistency,
        // but name should work too as operation ID is unique
        $ref: operation.name,
        name: operation.name,
      },
      nameTransformer: operationErrorTypeName,
    }).name;
    const successResponses = operation.responses.filter((response) =>
      response.responseTypes.includes('success'),
    );
    const responseType = successResponses.length
      ? setUniqueTypeName({
          client,
          meta: {
            // TODO: this should be exact ref to operation for consistency,
            // but name should work too as operation ID is unique
            $ref: operation.name,
            name: operation.name,
          },
          nameTransformer: operationResponseTypeName,
        }).name
      : 'void';
    return [
      tsc.returnFunctionCall({
        args: [options],
        name: `(options?.client ?? client).${operation.method.toLocaleLowerCase()}`,
        types:
          errorType && responseType
            ? [responseType, errorType, 'ThrowOnError']
            : errorType
              ? ['unknown', errorType, 'ThrowOnError']
              : responseType
                ? [responseType, 'unknown', 'ThrowOnError']
                : [],
      }),
    ];
  }

  if (legacyNameFromConfig(config)) {
    return [
      tsc.returnFunctionCall({
        args: [options],
        name: 'this.httpRequest.request',
      }),
    ];
  }

  const clientPlugin = getClientPlugin(config);
  if (clientPlugin.name === 'legacy/angular') {
    return [
      tsc.returnFunctionCall({
        args: ['OpenAPI', 'this.http', options],
        name: '__request',
      }),
    ];
  }

  return [
    tsc.returnFunctionCall({
      args: ['OpenAPI', options],
      name: '__request',
    }),
  ];
};

const processService = ({
  client,
  onClientImport,
  onImport,
  onNode,
  service,
}: {
  client: Client;
  onClientImport: OnImport;
  onImport: OnImport;
  onNode: OnNode;
  service: Service;
}) => {
  const config = getConfig();

  const clientPlugin = getClientPlugin(config);
  const isLegacy = isLegacyClient(config);

  for (const operation of service.operations) {
    if (operation.parameters.length) {
      generateImport({
        client,
        meta: {
          // TODO: this should be exact ref to operation for consistency,
          // but name should work too as operation ID is unique
          $ref: operation.name,
          name: operation.name,
        },
        nameTransformer: operationDataTypeName,
        onImport,
      });
    }

    if (!isLegacy) {
      generateImport({
        client,
        meta: {
          // TODO: this should be exact ref to operation for consistency,
          // but name should work too as operation ID is unique
          $ref: operation.name,
          name: operation.name,
        },
        nameTransformer: operationErrorTypeName,
        onImport,
      });
    }

    const successResponses = operation.responses.filter((response) =>
      response.responseTypes.includes('success'),
    );
    if (successResponses.length) {
      generateImport({
        client,
        meta: {
          // TODO: this should be exact ref to operation for consistency,
          // but name should work too as operation ID is unique
          $ref: operation.name,
          name: operation.name,
        },
        nameTransformer: operationResponseTypeName,
        onImport,
      });
    }
  }

  const throwOnErrorTypeGeneric: FunctionTypeParameter = {
    default:
      ('throwOnError' in clientPlugin.config
        ? clientPlugin.config.throwOnError
        : false) ?? false,
    extends: 'boolean',
    name: 'ThrowOnError',
  };

  if (
    !config.plugins['@hey-api/sdk']?.config.asClass &&
    !legacyNameFromConfig(config)
  ) {
    for (const operation of service.operations) {
      const compileFunctionParams = {
        parameters: toOperationParamType(client, operation),
        returnType: !isLegacy
          ? undefined
          : toOperationReturnType(client, operation),
        statements: toOperationStatements({
          client,
          onClientImport,
          onImport,
          operation,
        }),
        types: !isLegacy ? [throwOnErrorTypeGeneric] : undefined,
      };
      const expression =
        clientPlugin.name === 'legacy/angular'
          ? tsc.anonymousFunction(compileFunctionParams)
          : tsc.arrowFunction(compileFunctionParams);
      const statement = tsc.constVariable({
        comment: toOperationComment(operation),
        exportConst: true,
        expression,
        name: serviceFunctionIdentifier({
          config,
          handleIllegal: true,
          id: operation.name,
          operation,
        }),
      });
      onNode(statement);
    }
    return;
  }

  let members: ts.ClassElement[] = service.operations.map((operation) => {
    const node = tsc.methodDeclaration({
      accessLevel: 'public',
      comment: toOperationComment(operation),
      isStatic:
        legacyNameFromConfig(config) === undefined &&
        clientPlugin.name !== 'legacy/angular',
      name: serviceFunctionIdentifier({
        config,
        id: operation.name,
        operation,
      }),
      parameters: toOperationParamType(client, operation),
      returnType: !isLegacy
        ? undefined
        : toOperationReturnType(client, operation),
      statements: toOperationStatements({
        client,
        onClientImport,
        onImport,
        operation,
      }),
      types: !isLegacy ? [throwOnErrorTypeGeneric] : undefined,
    });
    return node;
  });

  if (!members.length) {
    return;
  }

  // Push constructor to front if needed
  if (legacyNameFromConfig(config)) {
    members = [
      tsc.constructorDeclaration({
        multiLine: false,
        parameters: [
          {
            accessLevel: 'public',
            isReadOnly: true,
            name: 'httpRequest',
            type: 'BaseHttpRequest',
          },
        ],
      }),
      ...members,
    ];
  } else if (clientPlugin.name === 'legacy/angular') {
    members = [
      tsc.constructorDeclaration({
        multiLine: false,
        parameters: [
          {
            accessLevel: 'public',
            isReadOnly: true,
            name: 'http',
            type: 'HttpClient',
          },
        ],
      }),
      ...members,
    ];
  }

  const _members: Array<ts.ClassElement> = [];
  members.forEach((member, index) => {
    // add newline between each class member
    if (index) {
      // @ts-expect-error
      _members.push(tsc.identifier({ text: '\n' }));
    }

    _members.push(member);
  });

  const statement = tsc.classDeclaration({
    decorator:
      clientPlugin.name === 'legacy/angular'
        ? { args: [{ providedIn: 'root' }], name: 'Injectable' }
        : undefined,
    exportClass: true,
    name: transformClassName({
      config,
      name: service.name,
    }),
    nodes: _members,
  });
  onNode(statement);
};

export const handlerLegacy: HeyApiSdkPlugin['LegacyHandler'] = ({
  client,
  files,
  plugin,
}) => {
  const config = getConfig();

  const isLegacy = isLegacyClient(config);

  const sdkOutput = 'sdk';

  files.sdk = new GeneratedFile({
    dir: config.output.path,
    exportFromIndex: plugin.config.exportFromIndex,
    id: 'sdk',
    name: `${sdkOutput}.ts`,
  });

  // Import required packages and core files.
  if (!isLegacy) {
    files.sdk.import({
      module: clientModulePath({ config, sourceOutput: sdkOutput }),
      name: 'createClient',
    });
    files.sdk.import({
      module: clientModulePath({ config, sourceOutput: sdkOutput }),
      name: 'createConfig',
    });
    files.sdk.import({
      ...clientApi.OptionsLegacyParser,
      module: clientModulePath({ config, sourceOutput: sdkOutput }),
    });
  } else {
    const clientPlugin = getClientPlugin(config);
    if (clientPlugin.name === 'legacy/angular') {
      files.sdk.import({
        module: '@angular/core',
        name: 'Injectable',
      });

      if (!legacyNameFromConfig(config)) {
        files.sdk.import({
          module: '@angular/common/http',
          name: 'HttpClient',
        });
      }

      files.sdk.import({
        asType: true,
        module: 'rxjs',
        name: 'Observable',
      });
    } else {
      files.sdk.import({
        asType: true,
        module: './core/CancelablePromise',
        name: 'CancelablePromise',
      });
    }

    if (config.plugins['@hey-api/sdk']?.config.response === 'response') {
      files.sdk.import({
        asType: true,
        module: './core/ApiResult',
        name: 'ApiResult',
      });
    }

    if (legacyNameFromConfig(config)) {
      const clientPlugin = getClientPlugin(config);
      files.sdk.import({
        asType: clientPlugin.name !== 'legacy/angular',
        module: './core/BaseHttpRequest',
        name: 'BaseHttpRequest',
      });
    } else {
      files.sdk.import({
        module: './core/OpenAPI',
        name: 'OpenAPI',
      });
      files.sdk.import({
        alias: '__request',
        module: './core/request',
        name: 'request',
      });
    }
  }

  // define client first
  if (!isLegacy) {
    const clientPlugin = getClientPlugin(config);
    const statement = tsc.constVariable({
      exportConst: true,
      expression: tsc.callExpression({
        functionName: 'createClient',
        parameters: [
          tsc.callExpression({
            functionName: 'createConfig',
            parameters: [
              'throwOnError' in clientPlugin && clientPlugin.throwOnError
                ? tsc.objectExpression({
                    obj: [
                      {
                        key: 'throwOnError',
                        value: true,
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
    files.sdk.add(statement);
  }

  for (const service of client.services) {
    processService({
      client,
      onClientImport: (imported) => {
        files.sdk!.import({
          module: clientModulePath({ config, sourceOutput: sdkOutput }),
          name: imported,
        });
      },
      onImport: (imported) => {
        files.sdk!.import({
          // this detection could be done safer, but it shouldn't cause any issues
          asType: !imported.endsWith('Transformer'),
          module: `./${files.types!.nameWithoutExtension()}`,
          name: imported,
        });
      },
      onNode: (node) => {
        files.sdk!.add(node);
      },
      service,
    });
  }
};

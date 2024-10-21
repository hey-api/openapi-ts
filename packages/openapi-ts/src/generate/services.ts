import type ts from 'typescript';

import type {
  ClassElement,
  Comments,
  FunctionParameter,
  Node,
} from '../compiler';
import { compiler } from '../compiler';
import type { FunctionTypeParameter, ObjectValue } from '../compiler/types';
import type { IRContext } from '../ir/context';
import type {
  IROperationObject,
  IRPathItemObject,
  IRPathsObject,
} from '../ir/ir';
import { hasOperationDataRequired } from '../ir/operation';
import { isOperationParameterRequired } from '../openApi';
import type {
  Client,
  Model,
  Operation,
  OperationParameter,
  Service,
} from '../types/client';
import type { Config } from '../types/config';
import type { Files } from '../types/utils';
import { camelCase } from '../utils/camelCase';
import { getConfig, isLegacyClient } from '../utils/config';
import { escapeComment, escapeName } from '../utils/escape';
import { getServiceName } from '../utils/postprocess';
import { reservedWordsRegExp } from '../utils/regexp';
import { transformServiceName } from '../utils/transform';
import { setUniqueTypeName } from '../utils/type';
import { unique } from '../utils/unique';
import { clientModulePath, clientOptionsTypeName } from './client';
import { TypeScriptFile } from './files';
import { irRef } from './types';

type OnNode = (node: Node) => void;
type OnImport = (name: string) => void;

const servicesId = 'services';

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

interface OperationIRRef {
  /**
   * Operation ID
   */
  id: string;
}

const operationIrRef = ({
  id,
  type,
}: OperationIRRef & {
  type: 'data' | 'error' | 'response';
}): string => {
  let affix = '';
  switch (type) {
    case 'data':
      affix = 'Data';
      break;
    case 'error':
      affix = 'Error';
      break;
    case 'response':
      affix = 'Response';
      break;
  }
  return `${irRef}${camelCase({
    input: id,
    pascalCase: true,
  })}${affix}`;
};

export const operationDataRef = ({ id }: OperationIRRef): string =>
  operationIrRef({ id, type: 'data' });

export const operationDataTypeName = (name: string) =>
  `${camelCase({
    input: name,
    pascalCase: true,
  })}Data`;

export const operationErrorRef = ({ id }: OperationIRRef): string =>
  operationIrRef({ id, type: 'error' });

export const operationErrorTypeName = (name: string) =>
  `${camelCase({
    input: name,
    pascalCase: true,
  })}Error`;

// operation response type ends with "Response", it's enough to append "Transformer"
export const operationResponseTransformerTypeName = (name: string) =>
  `${name}Transformer`;

export const operationResponseRef = ({ id }: OperationIRRef): string =>
  operationIrRef({ id, type: 'response' });

export const operationResponseTypeName = (name: string) =>
  `${camelCase({
    input: name,
    pascalCase: true,
  })}Response`;

/**
 * @param importedType unique type name returned from `setUniqueTypeName()`
 * @returns options type
 */
export const operationOptionsType = ({
  importedType,
  throwOnError,
}: {
  importedType?: string;
  throwOnError?: string;
}) => {
  const optionsName = clientOptionsTypeName();
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
        type: operationOptionsType({
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
      return undefined;
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

  let returnType = compiler.typeNode('void');

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
    returnType = compiler.typeUnionNode({
      types: [importedType],
    });
  }

  if (config.useOptions && config.services.response === 'response') {
    returnType = compiler.typeNode('ApiResult', [returnType]);
  }

  if (config.client.name === 'legacy/angular') {
    returnType = compiler.typeNode('Observable', [returnType]);
  } else {
    returnType = compiler.typeNode('CancelablePromise', [returnType]);
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

const toRequestOptions = (
  client: Client,
  operation: Operation,
  onImport: OnImport,
  onClientImport: OnImport | undefined,
) => {
  const config = getConfig();

  const operationName = operationResponseTypeName(operation.name);
  const { name: responseTransformerName } = setUniqueTypeName({
    client,
    meta: {
      $ref: `transformers/${operationName}`,
      name: operationName,
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

    return compiler.objectExpression({
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

  return compiler.objectExpression({
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
  id,
  operation,
  handleIllegal,
}: {
  config: Config;
  handleIllegal?: boolean;
  id: string;
  operation: IROperationObject | Operation;
}) => {
  if (config.services.methodNameBuilder) {
    return config.services.methodNameBuilder(operation);
  }

  if (handleIllegal && id.match(reservedWordsRegExp)) {
    return `${id}_`;
  }

  return id;
};

const toOperationStatements = (
  client: Client,
  operation: Operation,
  onImport: OnImport,
  onClientImport?: OnImport,
) => {
  const config = getConfig();

  const options = toRequestOptions(client, operation, onImport, onClientImport);

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
      compiler.returnFunctionCall({
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

  if (config.name) {
    return [
      compiler.returnFunctionCall({
        args: [options],
        name: 'this.httpRequest.request',
      }),
    ];
  }

  if (config.client.name === 'legacy/angular') {
    return [
      compiler.returnFunctionCall({
        args: ['OpenAPI', 'this.http', options],
        name: '__request',
      }),
    ];
  }

  return [
    compiler.returnFunctionCall({
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
    default: false,
    extends: 'boolean',
    name: 'ThrowOnError',
  };

  if (!config.services.asClass && !config.name) {
    for (const operation of service.operations) {
      const compileFunctionParams = {
        parameters: toOperationParamType(client, operation),
        returnType: !isLegacy
          ? undefined
          : toOperationReturnType(client, operation),
        statements: toOperationStatements(
          client,
          operation,
          onImport,
          onClientImport,
        ),
        types: !isLegacy ? [throwOnErrorTypeGeneric] : undefined,
      };
      const expression =
        config.client.name === 'legacy/angular'
          ? compiler.anonymousFunction(compileFunctionParams)
          : compiler.arrowFunction(compileFunctionParams);
      const statement = compiler.constVariable({
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

  let members: ClassElement[] = service.operations.map((operation) => {
    const node = compiler.methodDeclaration({
      accessLevel: 'public',
      comment: toOperationComment(operation),
      isStatic:
        config.name === undefined && config.client.name !== 'legacy/angular',
      name: serviceFunctionIdentifier({
        config,
        id: operation.name,
        operation,
      }),
      parameters: toOperationParamType(client, operation),
      returnType: !isLegacy
        ? undefined
        : toOperationReturnType(client, operation),
      statements: toOperationStatements(
        client,
        operation,
        onImport,
        onClientImport,
      ),
      types: !isLegacy ? [throwOnErrorTypeGeneric] : undefined,
    });
    return node;
  });

  if (!members.length) {
    return;
  }

  // Push constructor to front if needed
  if (config.name) {
    members = [
      compiler.constructorDeclaration({
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
  } else if (config.client.name === 'legacy/angular') {
    members = [
      compiler.constructorDeclaration({
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

  const statement = compiler.classDeclaration({
    decorator:
      config.client.name === 'legacy/angular'
        ? { args: [{ providedIn: 'root' }], name: 'Injectable' }
        : undefined,
    members,
    name: transformServiceName({
      config,
      name: service.name,
    }),
  });
  onNode(statement);
};

const checkLegacyPrerequisites = ({ files }: { files: Files }) => {
  const config = getConfig();

  if (!config.client.name) {
    throw new Error(
      '🚫 client needs to be set to generate services - which HTTP client do you want to use?',
    );
  }

  if (!files.types) {
    throw new Error(
      '🚫 types need to be exported to generate services - enable type generation',
    );
  }
};

const checkPrerequisites = ({ context }: { context: IRContext }) => {
  if (!context.config.client.name) {
    throw new Error(
      '🚫 client needs to be set to generate services - which HTTP client do you want to use?',
    );
  }

  if (!context.file({ id: 'types' })) {
    throw new Error(
      '🚫 types need to be exported to generate services - enable type generation',
    );
  }
};

export const generateLegacyServices = async ({
  client,
  files,
}: {
  client: Client;
  files: Files;
}): Promise<void> => {
  const config = getConfig();

  if (!config.services.export) {
    return;
  }

  checkLegacyPrerequisites({ files });

  const isLegacy = isLegacyClient(config);

  const servicesOutput = 'services';

  files.services = new TypeScriptFile({
    dir: config.output.path,
    name: `${servicesOutput}.ts`,
  });

  // Import required packages and core files.
  if (!isLegacy) {
    files.services.import({
      module: clientModulePath({ config, sourceOutput: servicesOutput }),
      name: 'createClient',
    });
    files.services.import({
      module: clientModulePath({ config, sourceOutput: servicesOutput }),
      name: 'createConfig',
    });
    files.services.import({
      asType: true,
      module: clientModulePath({ config, sourceOutput: servicesOutput }),
      name: clientOptionsTypeName(),
    });
  } else {
    if (config.client.name === 'legacy/angular') {
      files.services.import({
        module: '@angular/core',
        name: 'Injectable',
      });

      if (!config.name) {
        files.services.import({
          module: '@angular/common/http',
          name: 'HttpClient',
        });
      }

      files.services.import({
        asType: true,
        module: 'rxjs',
        name: 'Observable',
      });
    } else {
      files.services.import({
        asType: true,
        module: './core/CancelablePromise',
        name: 'CancelablePromise',
      });
    }

    if (config.services.response === 'response') {
      files.services.import({
        asType: true,
        module: './core/ApiResult',
        name: 'ApiResult',
      });
    }

    if (config.name) {
      files.services.import({
        asType: config.client.name !== 'legacy/angular',
        module: './core/BaseHttpRequest',
        name: 'BaseHttpRequest',
      });
    } else {
      files.services.import({
        module: './core/OpenAPI',
        name: 'OpenAPI',
      });
      files.services.import({
        alias: '__request',
        module: './core/request',
        name: 'request',
      });
    }
  }

  // define client first
  if (!isLegacy) {
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
    files.services.add(statement);
  }

  for (const service of client.services) {
    processService({
      client,
      onClientImport: (imported) => {
        files.services.import({
          module: clientModulePath({ config, sourceOutput: servicesOutput }),
          name: imported,
        });
      },
      onImport: (imported) => {
        files.services.import({
          // this detection could be done safer, but it shouldn't cause any issues
          asType: !imported.endsWith('Transformer'),
          module: `./${files.types.nameWithoutExtension()}`,
          name: imported,
        });
      },
      onNode: (node) => {
        files.services.add(node);
      },
      service,
    });
  }
};

const requestOptions = ({
  context,
  operation,
  path,
}: {
  context: IRContext;
  operation: IROperationObject;
  path: string;
}) => {
  const file = context.file({ id: servicesId })!;
  const servicesOutput = file.nameWithoutExtension();
  // const typesModule = `./${context.file({ id: 'types' })!.nameWithoutExtension()}`

  // TODO: parser - add response transformers
  // const operationName = operationResponseTypeName(operation.name);
  // const { name: responseTransformerName } = setUniqueTypeName({
  //   client,
  //   meta: {
  //     $ref: `transformers/${operationName}`,
  //     name: operationName,
  //   },
  //   nameTransformer: operationResponseTransformerTypeName,
  // });

  // if (responseTransformerName) {
  //   file.import({
  //     // this detection could be done safer, but it shouldn't cause any issues
  //     asType: !responseTransformerName.endsWith('Transformer'),
  //     module: typesModule,
  //     name: responseTransformerName,
  //   });
  // }

  const obj: ObjectValue[] = [{ spread: 'options' }];

  if (operation.body) {
    switch (operation.body.type) {
      case 'form-data':
        obj.push({ spread: 'formDataBodySerializer' });
        file.import({
          module: clientModulePath({
            config: context.config,
            sourceOutput: servicesOutput,
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
            sourceOutput: servicesOutput,
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

  // TODO: parser - add response transformers
  // if (responseTransformerName) {
  //   obj = [
  //     ...obj,
  //     {
  //       key: 'responseTransformer',
  //       value: responseTransformerName,
  //     },
  //   ];
  // }

  return compiler.objectExpression({
    identifiers: ['responseTransformer'],
    obj,
  });
};

const generateClassServices = ({ context }: { context: IRContext }) => {
  const file = context.file({ id: servicesId })!;
  const typesModule = `./${context.file({ id: 'types' })!.nameWithoutExtension()}`;

  const services = new Map<string, Array<ts.MethodDeclaration>>();

  for (const path in context.ir.paths) {
    const pathItem = context.ir.paths[path as keyof IRPathsObject];

    for (const _method in pathItem) {
      const method = _method as keyof IRPathItemObject;
      const operation = pathItem[method]!;

      const identifierData = context.file({ id: 'types' })!.identifier({
        $ref: operationDataRef({ id: operation.id }),
        namespace: 'type',
      });
      if (identifierData.name) {
        file.import({
          // this detection could be done safer, but it shouldn't cause any issues
          asType: !identifierData.name.endsWith('Transformer'),
          module: typesModule,
          name: identifierData.name,
        });
      }

      const identifierError = context.file({ id: 'types' })!.identifier({
        $ref: operationErrorRef({ id: operation.id }),
        namespace: 'type',
      });
      if (identifierError.name) {
        file.import({
          // this detection could be done safer, but it shouldn't cause any issues
          asType: !identifierError.name.endsWith('Transformer'),
          module: typesModule,
          name: identifierError.name,
        });
      }

      const identifierResponse = context.file({ id: 'types' })!.identifier({
        $ref: operationResponseRef({ id: operation.id }),
        namespace: 'type',
      });
      if (identifierResponse.name) {
        file.import({
          // this detection could be done safer, but it shouldn't cause any issues
          asType: !identifierResponse.name.endsWith('Transformer'),
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
        const serviceName = getServiceName(tag);
        const nodes = services.get(serviceName) ?? [];
        nodes.push(node);
        services.set(serviceName, nodes);
      }
    }
  }

  for (const [serviceName, nodes] of services) {
    const node = compiler.classDeclaration({
      decorator: undefined,
      members: nodes,
      name: transformServiceName({
        config: context.config,
        name: serviceName,
      }),
    });
    file.add(node);
  }
};

const generateFlatServices = ({ context }: { context: IRContext }) => {
  const file = context.file({ id: servicesId })!;
  const typesModule = `./${context.file({ id: 'types' })!.nameWithoutExtension()}`;

  for (const path in context.ir.paths) {
    const pathItem = context.ir.paths[path as keyof IRPathsObject];

    for (const _method in pathItem) {
      const method = _method as keyof IRPathItemObject;
      const operation = pathItem[method]!;

      const identifierData = context.file({ id: 'types' })!.identifier({
        $ref: operationDataRef({ id: operation.id }),
        namespace: 'type',
      });
      if (identifierData.name) {
        file.import({
          // this detection could be done safer, but it shouldn't cause any issues
          asType: !identifierData.name.endsWith('Transformer'),
          module: typesModule,
          name: identifierData.name,
        });
      }

      const identifierError = context.file({ id: 'types' })!.identifier({
        $ref: operationErrorRef({ id: operation.id }),
        namespace: 'type',
      });
      if (identifierError.name) {
        file.import({
          // this detection could be done safer, but it shouldn't cause any issues
          asType: !identifierError.name.endsWith('Transformer'),
          module: typesModule,
          name: identifierError.name,
        });
      }

      const identifierResponse = context.file({ id: 'types' })!.identifier({
        $ref: operationResponseRef({ id: operation.id }),
        namespace: 'type',
      });
      if (identifierResponse.name) {
        file.import({
          // this detection could be done safer, but it shouldn't cause any issues
          asType: !identifierResponse.name.endsWith('Transformer'),
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
    }
  }
};

export const generateServices = ({ context }: { context: IRContext }) => {
  // TODO: parser - once services are a plugin, this logic can be simplified
  if (!context.config.services.export) {
    return;
  }

  checkPrerequisites({ context });

  const file = context.createFile({
    id: servicesId,
    path: 'services',
  });
  const servicesOutput = file.nameWithoutExtension();

  // import required packages and core files
  file.import({
    module: clientModulePath({
      config: context.config,
      sourceOutput: servicesOutput,
    }),
    name: 'createClient',
  });
  file.import({
    module: clientModulePath({
      config: context.config,
      sourceOutput: servicesOutput,
    }),
    name: 'createConfig',
  });
  file.import({
    asType: true,
    module: clientModulePath({
      config: context.config,
      sourceOutput: servicesOutput,
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

  if (context.config.services.asClass) {
    generateClassServices({ context });
  } else {
    generateFlatServices({ context });
  }
};

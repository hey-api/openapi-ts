import {
  ClassElement,
  type Comments,
  compiler,
  FunctionParameter,
  type Node,
  TypeScriptFile,
} from '../compiler';
import type { FunctionTypeParameter, ObjectValue } from '../compiler/types';
import type { Model, Operation, OperationParameter, Service } from '../openApi';
import { isOperationParameterRequired } from '../openApi/common/parser/operation';
import type { Client } from '../types/client';
import type { Files } from '../types/utils';
import { camelCase } from '../utils/camelCase';
import { getConfig, isStandaloneClient } from '../utils/config';
import { escapeComment, escapeName } from '../utils/escape';
import { reservedWordsRegExp } from '../utils/reservedWords';
import { transformServiceName } from '../utils/transform';
import { setUniqueTypeName } from '../utils/type';
import { unique } from '../utils/unique';
import { clientModulePath, clientOptionsTypeName } from './client';

type OnNode = (node: Node) => void;
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
  `${camelCase({
    input: name,
    pascalCase: true,
  })}Data`;

export const operationErrorTypeName = (name: string) =>
  `${camelCase({
    input: name,
    pascalCase: true,
  })}Error`;

// operation response type ends with "Response", it's enough to append "Transformer"
export const operationResponseTransformerTypeName = (name: string) =>
  `${name}Transformer`;

export const operationResponseTypeName = (name: string) =>
  `${camelCase({
    input: name,
    pascalCase: true,
  })}Response`;

/**
 * @param importedType unique type name returned from `setUniqueTypeName()`
 * @returns options type
 */
export const operationOptionsType = (
  importedType?: string,
  throwOnError?: string,
) => {
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

  if (isStandaloneClient(config)) {
    return [
      {
        isRequired,
        name: 'options',
        type: operationOptionsType(importedType, 'ThrowOnError'),
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

  if (config.client.name === 'angular') {
    returnType = compiler.typeNode('Observable', [returnType]);
  } else {
    returnType = compiler.typeNode('CancelablePromise', [returnType]);
  }

  return returnType;
};

const toOperationComment = (operation: Operation): Comments => {
  const config = getConfig();

  if (isStandaloneClient(config)) {
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

  if (isStandaloneClient(config)) {
    let obj: ObjectValue[] = [
      {
        spread: 'options',
      },
    ];

    const bodyParameters = operation.parameters.filter(
      (parameter) => parameter.in === 'body' || parameter.in === 'formData',
    );
    const contents = bodyParameters
      .map((parameter) => parameter.mediaType)
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
            value: {
              // no need for Content-Type header, browser will set it automatically
              'Content-Type': null,
            },
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
            value: {
              'Content-Type': contents[0],
            },
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

export const toOperationName = (
  operation: Operation,
  handleIllegal: boolean,
) => {
  const config = getConfig();

  if (config.services.methodNameBuilder) {
    return config.services.methodNameBuilder(operation);
  }

  if (handleIllegal && operation.name.match(reservedWordsRegExp)) {
    return `${operation.name}_`;
  }

  return operation.name;
};

const toOperationStatements = (
  client: Client,
  operation: Operation,
  onImport: OnImport,
  onClientImport?: OnImport,
) => {
  const config = getConfig();

  const options = toRequestOptions(client, operation, onImport, onClientImport);

  if (isStandaloneClient(config)) {
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

  if (config.client.name === 'angular') {
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

  const isStandalone = isStandaloneClient(config);

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

    if (isStandalone) {
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
        returnType: isStandalone
          ? undefined
          : toOperationReturnType(client, operation),
        statements: toOperationStatements(
          client,
          operation,
          onImport,
          onClientImport,
        ),
        types: isStandalone ? [throwOnErrorTypeGeneric] : undefined,
      };
      const expression =
        config.client.name === 'angular'
          ? compiler.anonymousFunction(compileFunctionParams)
          : compiler.arrowFunction(compileFunctionParams);
      const statement = compiler.constVariable({
        comment: toOperationComment(operation),
        exportConst: true,
        expression,
        name: toOperationName(operation, true),
      });
      onNode(statement);
    }
    return;
  }

  let members: ClassElement[] = service.operations.map((operation) => {
    const node = compiler.methodDeclaration({
      accessLevel: 'public',
      comment: toOperationComment(operation),
      isStatic: config.name === undefined && config.client.name !== 'angular',
      name: toOperationName(operation, false),
      parameters: toOperationParamType(client, operation),
      returnType: isStandalone
        ? undefined
        : toOperationReturnType(client, operation),
      statements: toOperationStatements(
        client,
        operation,
        onImport,
        onClientImport,
      ),
      types: isStandalone ? [throwOnErrorTypeGeneric] : undefined,
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
  } else if (config.client.name === 'angular') {
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
      config.client.name === 'angular'
        ? { args: [{ providedIn: 'root' }], name: 'Injectable' }
        : undefined,
    members,
    name: transformServiceName(service.name),
  });
  onNode(statement);
};

const checkPrerequisites = ({ files }: { files: Files }) => {
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

export const generateServices = async ({
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

  checkPrerequisites({ files });

  const isStandalone = isStandaloneClient(config);

  files.services = new TypeScriptFile({
    dir: config.output.path,
    name: 'services.ts',
  });

  // Import required packages and core files.
  if (isStandalone) {
    files.services.import({
      module: clientModulePath(),
      name: 'createClient',
    });
    files.services.import({
      module: clientModulePath(),
      name: 'createConfig',
    });
    files.services.import({
      asType: true,
      module: clientModulePath(),
      name: clientOptionsTypeName(),
    });
  } else {
    if (config.client.name === 'angular') {
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
        asType: config.client.name !== 'angular',
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
  if (isStandalone) {
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
          module: clientModulePath(),
          name: imported,
        });
      },
      onImport: (imported) => {
        files.services.import({
          // this detection could be done safer, but it shouldn't cause any issues
          asType: !imported.endsWith('Transformer'),
          module: `./${files.types.getName(false)}`,
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

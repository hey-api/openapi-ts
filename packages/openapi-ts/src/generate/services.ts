import camelcase from 'camelcase';

import {
  ClassElement,
  type Comments,
  compiler,
  FunctionParameter,
  type Node,
  TypeScriptFile,
} from '../compiler';
import type { ObjectValue } from '../compiler/types';
import type { Model, Operation, OperationParameter, Service } from '../openApi';
import type { Client } from '../types/client';
import type { Files } from '../types/utils';
import { getConfig, isStandaloneClient } from '../utils/config';
import { escapeComment, escapeName } from '../utils/escape';
import { reservedWordsRegExp } from '../utils/reservedWords';
import { transformServiceName } from '../utils/transform';
import { setUniqueTypeName } from '../utils/type';
import { unique } from '../utils/unique';

type OnNode = (node: Node) => void;
type OnImport = (name: string) => void;

const generateImport = ({
  meta,
  onImport,
  ...setUniqueTypeNameArgs
}: Pick<Parameters<typeof setUniqueTypeName>[0], 'client' | 'nameTransformer'> &
  Pick<Model, 'meta'> & {
    onImport: OnImport;
  }) => {
  // generate imports only for top-level models
  if (!meta) {
    return;
  }

  const { name } = setUniqueTypeName({ meta, ...setUniqueTypeNameArgs });
  if (name) {
    onImport(name);
  }
};

export const modelResponseTransformerTypeName = (name: string) =>
  `${name}ModelResponseTransformer`;

export const operationDataTypeName = (name: string) =>
  `${camelcase(name, { pascalCase: true })}Data`;

export const operationErrorTypeName = (name: string) =>
  `${camelcase(name, { pascalCase: true })}Error`;

// operation response type ends with "Response", it's enough to append "Transformer"
export const operationResponseTransformerTypeName = (name: string) =>
  `${name}Transformer`;

export const operationResponseTypeName = (name: string) =>
  `${camelcase(name, { pascalCase: true })}Response`;

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

  const isRequired = operation.parameters.some(
    (parameter) => parameter.isRequired,
  );

  if (isStandaloneClient(config)) {
    return [
      {
        isRequired,
        name: 'options',
        type: importedType ? `Options<${importedType}>` : 'Options',
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

  let returnType = compiler.typedef.basic('void');

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
    returnType = compiler.typedef.union([importedType]);
  }

  if (config.useOptions && config.services.response === 'response') {
    returnType = compiler.typedef.basic('ApiResult', [returnType]);
  }

  if (config.client.name === 'angular') {
    returnType = compiler.typedef.basic('Observable', [returnType]);
  } else {
    returnType = compiler.typedef.basic('CancelablePromise', [returnType]);
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
          // no need for Content-Type header, browser will set it automatically
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

    return compiler.types.object({
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

  return compiler.types.object({
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
      compiler.return.functionCall({
        args: [options],
        name: `(options?.client ?? client).${operation.method.toLocaleLowerCase()}`,
        types:
          errorType && responseType
            ? [responseType, errorType]
            : errorType
              ? ['unknown', errorType]
              : responseType
                ? [responseType]
                : [],
      }),
    ];
  }

  if (config.name) {
    return [
      compiler.return.functionCall({
        args: [options],
        name: 'this.httpRequest.request',
      }),
    ];
  }

  if (config.client.name === 'angular') {
    return [
      compiler.return.functionCall({
        args: ['OpenAPI', 'this.http', options],
        name: '__request',
      }),
    ];
  }

  return [
    compiler.return.functionCall({
      args: ['OpenAPI', options],
      name: '__request',
    }),
  ];
};

const processService = (
  client: Client,
  service: Service,
  onNode: OnNode,
  onImport: OnImport,
  onClientImport: OnImport,
) => {
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

  if (!config.services.asClass && !config.name) {
    for (const operation of service.operations) {
      const expression = compiler.types.function({
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
      });
      const statement = compiler.export.const({
        comment: toOperationComment(operation),
        expression,
        name: toOperationName(operation, true),
      });
      onNode(statement);
    }
    return;
  }

  let members: ClassElement[] = service.operations.map((operation) => {
    const node = compiler.class.method({
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
    });
    return node;
  });

  if (!members.length) {
    return;
  }

  // Push to front constructor if needed
  if (config.name) {
    members = [
      compiler.class.constructor({
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
      compiler.class.constructor({
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

  const statement = compiler.class.create({
    decorator:
      config.client.name === 'angular'
        ? { args: [{ providedIn: 'root' }], name: 'Injectable' }
        : undefined,
    members,
    name: transformServiceName(service.name),
  });
  onNode(statement);
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

  files.services = new TypeScriptFile({
    dir: config.output.path,
    name: 'services.ts',
  });

  let imports: string[] = [];
  let clientImports: string[] = [];

  for (const service of client.services) {
    processService(
      client,
      service,
      (node) => {
        files.services?.add(node);
      },
      (imported) => {
        imports = [...imports, imported];
      },
      (imported) => {
        clientImports = [...clientImports, imported];
      },
    );
  }

  // Import required packages and core files.
  if (isStandaloneClient(config)) {
    files.services?.addImport({
      imports: [
        'client',
        {
          asType: true,
          name: 'Options',
        },
        ...clientImports.filter(unique),
      ],
      module: config.client.bundle ? './client' : config.client.name,
    });
  } else {
    if (config.client.name === 'angular') {
      files.services?.addImport({
        imports: 'Injectable',
        module: '@angular/core',
      });

      if (!config.name) {
        files.services?.addImport({
          imports: 'HttpClient',
          module: '@angular/common/http',
        });
      }

      files.services?.addImport({
        imports: { asType: true, name: 'Observable' },
        module: 'rxjs',
      });
    } else {
      files.services?.addImport({
        imports: { asType: true, name: 'CancelablePromise' },
        module: './core/CancelablePromise',
      });
    }

    if (config.services.response === 'response') {
      files.services?.addImport({
        imports: { asType: true, name: 'ApiResult' },
        module: './core/ApiResult',
      });
    }

    if (config.name) {
      files.services?.addImport({
        imports: {
          asType: config.client.name !== 'angular',
          name: 'BaseHttpRequest',
        },
        module: './core/BaseHttpRequest',
      });
    } else {
      files.services?.addImport({
        imports: 'OpenAPI',
        module: './core/OpenAPI',
      });
      files.services?.addImport({
        imports: { alias: '__request', name: 'request' },
        module: './core/request',
      });
    }
  }

  // Import all models required by the services.
  if (files.types && !files.types.isEmpty()) {
    const importedTypes = imports.filter(unique).map((name) => ({
      // this detection could be done safer, but it shouldn't cause any issues
      asType: !name.endsWith('Transformer'),
      name,
    }));
    if (importedTypes.length) {
      files.services?.addImport({
        imports: importedTypes,
        module: `./${files.types.getName(false)}`,
      });
    }
  }
};

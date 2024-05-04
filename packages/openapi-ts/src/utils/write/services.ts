import camelcase from 'camelcase';

import {
  ClassElement,
  compiler,
  FunctionParameter,
  type Node,
  TypeScriptFile,
} from '../../compiler';
import type { ObjectValue } from '../../compiler/types';
import type { Operation, OperationParameter, Service } from '../../openApi';
import type { Client } from '../../types/client';
import { getConfig } from '../config';
import { escapeComment, escapeDescription, escapeName } from '../escape';
import { modelIsRequired } from '../required';
import { transformServiceName } from '../transform';
import { unique } from '../unique';

type OnNode = (node: Node) => void;
type OnImport = (importedType: string) => void;

export const operationDataTypeName = (operation: Operation) =>
  `${camelcase(operation.name, { pascalCase: true })}Data`;

export const operationResponseTypeName = (operation: Operation) =>
  `${camelcase(operation.name, { pascalCase: true })}Response`;

const toOperationParamType = (operation: Operation): FunctionParameter[] => {
  if (!operation.parameters.length) {
    return [];
  }

  const config = getConfig();

  const importedType = operationDataTypeName(operation);

  if (config.useOptions) {
    const isRequired = operation.parameters.some(
      (parameter) => parameter.isRequired,
    );
    return [
      {
        default: isRequired ? undefined : {},
        name: 'data',
        type: importedType,
      },
    ];
  }

  return operation.parameters.map((p) => {
    const typePath = `${importedType}['${p.name}']`;
    return {
      default: p?.default,
      isRequired: modelIsRequired(p) === '',
      name: p.name,
      type: typePath,
    };
  });
};

const toOperationReturnType = (operation: Operation) => {
  const config = getConfig();

  let returnType = compiler.typedef.basic('void');

  // TODO: we should return nothing when results don't exist
  // can't remove this logic without removing request/name config
  // as it complicates things
  if (operation.results.length) {
    const importedType = operationResponseTypeName(operation);
    returnType = compiler.typedef.union([importedType]);
  }

  if (config.useOptions && config.services.response === 'response') {
    returnType = compiler.typedef.basic('ApiResult', [returnType]);
  }

  if (config.client === 'angular') {
    returnType = compiler.typedef.basic('Observable', [returnType]);
  } else {
    returnType = compiler.typedef.basic('CancelablePromise', [returnType]);
  }

  return returnType;
};

const toOperationComment = (operation: Operation) => {
  const config = getConfig();
  let params: string[] = [];
  if (operation.parameters.length) {
    if (config.useOptions) {
      params = [
        '@param data The data for the request.',
        ...operation.parameters.map(
          (p) =>
            `@param data.${p.name} ${p.description ? escapeComment(p.description) : ''}`,
        ),
      ];
    } else {
      params = operation.parameters.map(
        (p) =>
          `@param ${p.name} ${p.description ? escapeComment(p.description) : ''}`,
      );
    }
  }
  const comment = [
    operation.deprecated && '@deprecated',
    operation.summary && escapeComment(operation.summary),
    operation.description && escapeComment(operation.description),
    ...params,
    ...operation.results.map(
      (r) =>
        `@returns ${r.type} ${r.description ? escapeComment(r.description) : ''}`,
    ),
    '@throws ApiError',
  ];
  return comment;
};

const toRequestOptions = (operation: Operation) => {
  const config = getConfig();

  if (config.client.startsWith('@hey-api')) {
    const obj: ObjectValue[] = [
      {
        spread: 'data',
      },
      {
        key: 'url',
        value: operation.path,
      },
    ];
    return compiler.types.object({
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

  if (operation.errors.length) {
    const errors: Record<number | string, string> = {};
    operation.errors.forEach((err) => {
      errors[err.code] = escapeDescription(err.description ?? '');
    });
    obj.errors = errors;
  }

  return compiler.types.object({
    identifiers: ['body', 'cookies', 'formData', 'headers', 'path', 'query'],
    obj,
    shorthand: true,
  });
};

const toOperationStatements = (operation: Operation) => {
  const config = getConfig();

  const options = toRequestOptions(operation);

  if (config.client.startsWith('@hey-api')) {
    const returnType = operation.results.length
      ? operationResponseTypeName(operation)
      : 'void';
    return [
      compiler.return.functionCall({
        args: [options],
        name: `client.${operation.method.toLocaleLowerCase()}`,
        types: [returnType],
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

  if (config.client === 'angular') {
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

export const processService = (
  service: Service,
  onNode: OnNode,
  onImport: OnImport,
) => {
  const config = getConfig();

  service.operations.forEach((operation) => {
    if (operation.parameters.length) {
      const importedType = operationDataTypeName(operation);
      onImport(importedType);
    }

    if (operation.results.length) {
      const importedType = operationResponseTypeName(operation);
      onImport(importedType);
    }
  });

  if (config.client.startsWith('@hey-api')) {
    service.operations.forEach((operation) => {
      const expression = compiler.types.function({
        parameters: toOperationParamType(operation),
        statements: toOperationStatements(operation),
      });
      const statement = compiler.export.const({
        comment: toOperationComment(operation),
        expression,
        name: operation.name,
      });
      onNode(statement);
    });
    return;
  }

  const members: ClassElement[] = service.operations.map((operation) => {
    const node = compiler.class.method({
      accessLevel: 'public',
      comment: toOperationComment(operation),
      isStatic: config.name === undefined && config.client !== 'angular',
      name: operation.name,
      parameters: toOperationParamType(operation),
      returnType: toOperationReturnType(operation),
      statements: toOperationStatements(operation),
    });
    return node;
  });

  // Push to front constructor if needed
  if (config.name) {
    members.unshift(
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
    );
  } else if (config.client === 'angular') {
    members.unshift(
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
    );
  }

  const statement = compiler.class.create({
    decorator:
      config.client === 'angular'
        ? { args: [{ providedIn: 'root' }], name: 'Injectable' }
        : undefined,
    members,
    name: transformServiceName(service.name),
  });
  onNode(statement);
};

export const processServices = async ({
  client,
  files,
}: {
  client: Client;
  files: Record<string, TypeScriptFile>;
}): Promise<void> => {
  if (!files.services) {
    return;
  }

  const config = getConfig();

  let imports: string[] = [];

  for (const service of client.services) {
    processService(
      service,
      (node) => {
        files.services?.add(node);
      },
      (importedType) => {
        imports = [...imports, importedType];
      },
    );
  }

  // Import required packages and core files.
  if (config.client.startsWith('@hey-api')) {
    files.services?.addImport(['client'], config.client);
  } else {
    if (config.client === 'angular') {
      files.services?.addImport('Injectable', '@angular/core');

      if (!config.name) {
        files.services?.addImport('HttpClient', '@angular/common/http');
      }

      files.services?.addImport(
        { isTypeOnly: true, name: 'Observable' },
        'rxjs',
      );
    } else {
      files.services?.addImport(
        { isTypeOnly: true, name: 'CancelablePromise' },
        './core/CancelablePromise',
      );
    }

    if (config.services.response === 'response') {
      files.services?.addImport(
        { isTypeOnly: true, name: 'ApiResult' },
        './core/ApiResult',
      );
    }

    if (config.name) {
      files.services?.addImport(
        { isTypeOnly: config.client !== 'angular', name: 'BaseHttpRequest' },
        './core/BaseHttpRequest',
      );
    } else {
      files.services?.addImport('OpenAPI', './core/OpenAPI');
      files.services?.addImport(
        { alias: '__request', name: 'request' },
        './core/request',
      );
    }
  }

  // Import all models required by the services.
  if (files.types && !files.types.isEmpty()) {
    const models = imports
      .filter(unique)
      .map((name) => ({ isTypeOnly: true, name }));
    files.services?.addImport(models, `./${files.types.getName(false)}`);
  }
};

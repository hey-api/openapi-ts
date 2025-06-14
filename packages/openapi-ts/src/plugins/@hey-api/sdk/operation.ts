import type ts from 'typescript';

import { compiler } from '../../../compiler';
import type { ObjectValue } from '../../../compiler/types';
import { clientApi, clientModulePath } from '../../../generate/client';
import type { TypeScriptFile } from '../../../generate/files';
import { statusCodeToGroup } from '../../../ir/operation';
import type { IR } from '../../../ir/types';
import { sanitizeNamespaceIdentifier } from '../../../openApi';
import { reservedJavaScriptKeywordsRegExp } from '../../../utils/regexp';
import { stringCase } from '../../../utils/stringCase';
import { transformClassName } from '../../../utils/transform';
import type { Plugin } from '../../types';
import { clientId, getClientPlugin } from '../client-core/utils';
import {
  operationTransformerIrRef,
  transformersId,
} from '../transformers/plugin';
import { importIdentifier } from '../typescript/ref';
import { operationAuth } from './auth';
import { nuxtTypeComposable, nuxtTypeDefault, sdkId } from './constants';
import type { Config } from './types';
import { createResponseValidator } from './validator';

interface ClassNameEntry {
  /**
   * Name of the class where this function appears.
   */
  className: string;
  /**
   * Name of the function within the class.
   */
  methodName: string;
  /**
   * JSONPath-like array to class location.
   */
  path: ReadonlyArray<string>;
}

const operationClassName = ({
  context,
  value,
}: {
  context: IR.Context;
  value: string;
}) => {
  const name = stringCase({
    case: 'PascalCase',
    value: sanitizeNamespaceIdentifier(value),
  });
  return transformClassName({
    config: context.config,
    name,
  });
};

const getOperationMethodName = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: {
    config: Pick<
      Plugin.Instance<Config>['config'],
      'asClass' | 'methodNameBuilder'
    >;
  };
}) => {
  if (plugin.config.methodNameBuilder) {
    return plugin.config.methodNameBuilder(operation);
  }

  const handleIllegal = !plugin.config.asClass;
  if (handleIllegal && operation.id.match(reservedJavaScriptKeywordsRegExp)) {
    return `${operation.id}_`;
  }

  return operation.id;
};

/**
 * Returns a list of classes where this operation appears in the generated SDK.
 */
export const operationClasses = ({
  context,
  operation,
  plugin,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
  plugin: {
    config: Pick<
      Plugin.Instance<Config>['config'],
      'asClass' | 'classStructure' | 'instance'
    >;
  };
}): Map<string, ClassNameEntry> => {
  const classNames = new Map<string, ClassNameEntry>();

  let className: string | undefined;
  let methodName: string | undefined;
  let classCandidates: Array<string> = [];

  if (plugin.config.classStructure === 'auto' && operation.operationId) {
    classCandidates = operation.operationId.split(/[./]/).filter(Boolean);
    if (classCandidates.length > 1) {
      const methodCandidate = classCandidates.pop()!;
      methodName = stringCase({
        case: 'camelCase',
        value: sanitizeNamespaceIdentifier(methodCandidate),
      });
      className = classCandidates.pop()!;
    }
  }

  const rootClasses = plugin.config.instance
    ? [plugin.config.instance as string]
    : (operation.tags ?? ['default']);

  for (const rootClass of rootClasses) {
    const finalClassName = operationClassName({
      context,
      value: className || rootClass,
    });
    classNames.set(rootClass, {
      className: finalClassName,
      methodName: methodName || getOperationMethodName({ operation, plugin }),
      path: (className
        ? [rootClass, ...classCandidates, className]
        : [rootClass]
      ).map((value) =>
        operationClassName({
          context,
          value,
        }),
      ),
    });
  }

  return classNames;
};

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
  const client = getClientPlugin(context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';

  const identifierData = importIdentifier({
    context,
    file,
    operation,
    type: 'data',
  });
  const identifierResponse = importIdentifier({
    context,
    file,
    operation,
    type: isNuxtClient ? 'response' : 'responses',
  });

  const optionsName = clientApi.Options.name;

  if (isNuxtClient) {
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

/**
 * Infers `responseType` value from provided response content type. This is
 * an adapted version of `getParseAs()` from the Fetch API client.
 *
 * From Axios documentation:
 * `responseType` indicates the type of data that the server will respond with
 * options are: 'arraybuffer', 'document', 'json', 'text', 'stream'
 * browser only: 'blob'
 */
const getResponseType = (
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

export const operationStatements = ({
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

  const client = getClientPlugin(context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';

  const identifierError = importIdentifier({
    context,
    file,
    operation,
    type: isNuxtClient ? 'error' : 'errors',
  });
  const identifierResponse = importIdentifier({
    context,
    file,
    operation,
    type: isNuxtClient ? 'response' : 'responses',
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

  if (client.name === '@hey-api/client-axios') {
    // try to infer `responseType` option for Axios. We don't need this in
    // Fetch API client because it automatically detects the correct response
    // during runtime.
    for (const statusCode in operation.responses) {
      // this doesn't handle default status code for now
      if (statusCodeToGroup({ statusCode }) === '2XX') {
        const response = operation.responses[statusCode];
        const responseType = getResponseType(response?.mediaType);
        if (responseType) {
          requestOptions.push({
            key: 'responseType',
            value: responseType,
          });
          break;
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

  if (plugin.config.transformer === '@hey-api/transformers') {
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

  if (plugin.config.responseStyle === 'data') {
    requestOptions.push({
      key: 'responseStyle',
      value: plugin.config.responseStyle,
    });
  }

  requestOptions.push({
    key: 'url',
    value: operation.path,
  });

  // options must go last to allow overriding parameters above
  requestOptions.push({ spread: 'options' });

  if (operation.body) {
    const parameterContentType = operation.parameters?.header?.['content-type'];
    const hasRequiredContentType = Boolean(parameterContentType?.required);
    // spreading required Content-Type on generated header would throw a TypeScript error
    if (!hasRequiredContentType) {
      const spread = compiler.propertyAccessExpression({
        expression: compiler.identifier({ text: 'options' }),
        isOptional: !isRequiredOptions,
        name: 'headers',
      });
      requestOptions.push({
        key: 'headers',
        value: [
          {
            key: parameterContentType?.name ?? 'Content-Type',
            // form-data does not need Content-Type header, browser will set it automatically
            value:
              operation.body.type === 'form-data'
                ? null
                : operation.body.mediaType,
          },
          {
            spread,
          },
        ],
      });
    }
  }

  const responseType = identifierResponse.name || 'unknown';
  const errorType = identifierError.name || 'unknown';

  const heyApiClient = plugin.config.client
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

  let clientExpression: ts.Expression;

  if (plugin.config.instance) {
    clientExpression = compiler.binaryExpression({
      left: optionsClient,
      operator: '??',
      right: compiler.propertyAccessExpression({
        expression: compiler.this(),
        name: '_client',
      }),
    });
  } else if (heyApiClient?.name) {
    clientExpression = compiler.binaryExpression({
      left: optionsClient,
      operator: '??',
      right: compiler.identifier({ text: heyApiClient.name }),
    });
  } else {
    clientExpression = optionsClient;
  }

  const types: Array<string | ts.StringLiteral> = [];
  if (isNuxtClient) {
    types.push(
      nuxtTypeComposable,
      `${responseType} | ${nuxtTypeDefault}`,
      errorType,
      nuxtTypeDefault,
    );
  } else {
    types.push(responseType, errorType, 'ThrowOnError');
  }

  if (plugin.config.responseStyle === 'data') {
    types.push(compiler.stringLiteral({ text: plugin.config.responseStyle }));
  }

  return [
    compiler.returnFunctionCall({
      args: [
        compiler.objectExpression({
          identifiers: ['responseTransformer'],
          obj: requestOptions,
        }),
      ],
      name: compiler.propertyAccessExpression({
        expression: clientExpression,
        name: compiler.identifier({ text: operation.method }),
      }),
      types,
    }),
  ];
};

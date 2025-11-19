import type { SymbolMeta } from '@hey-api/codegen-core';

import type { Context } from '~/ir/context';
import { statusCodeToGroup } from '~/ir/operation';
import type { IR } from '~/ir/types';
import { sanitizeNamespaceIdentifier } from '~/openApi/common/parser/sanitize';
import { getClientPlugin } from '~/plugins/@hey-api/client-core/utils';
import { toRefs } from '~/plugins/shared/utils/refs';
import { $ } from '~/ts-dsl';
import { reservedJavaScriptKeywordsRegExp } from '~/utils/regexp';
import { stringCase } from '~/utils/stringCase';
import { transformClassName } from '~/utils/transform';

import type { Field, Fields } from '../../client-core/bundle/params';
import type { HeyApiSdkPlugin } from '../types';
import { operationAuth } from './auth';
import { nuxtTypeComposable, nuxtTypeDefault } from './constants';
import { getSignatureParameters } from './signature';
import { createRequestValidator, createResponseValidator } from './validator';

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
  context: Context;
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
      HeyApiSdkPlugin['Instance']['config'],
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
  context: Context;
  operation: IR.OperationObject;
  plugin: {
    config: Pick<
      HeyApiSdkPlugin['Instance']['config'],
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

    // Default path
    let path = [rootClass];
    if (className) {
      // If root class is already within classCandidates or the same as className
      // do not add it again as this will cause a recursion issue.
      if (classCandidates.includes(rootClass) || rootClass === className) {
        path = [...classCandidates, className];
      } else {
        path = [rootClass, ...classCandidates, className];
      }
    }

    classNames.set(rootClass, {
      className: finalClassName,
      methodName: methodName || getOperationMethodName({ operation, plugin }),
      path: path.map((value) =>
        operationClassName({
          context,
          value,
        }),
      ),
    });
  }

  return classNames;
};

/** TODO: needs complete refactor */
export const operationOptionsType = ({
  isDataAllowed = true,
  operation,
  plugin,
  throwOnError,
}: {
  isDataAllowed?: boolean;
  operation: IR.OperationObject;
  plugin: HeyApiSdkPlugin['Instance'];
  throwOnError?: string;
}) => {
  const client = getClientPlugin(plugin.context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';

  const symbolDataType = isDataAllowed
    ? plugin.querySymbol({
        category: 'type',
        resource: 'operation',
        resourceId: operation.id,
        role: 'data',
        tool: 'typescript',
      })
    : undefined;

  const symbolOptions = plugin.referenceSymbol({
    category: 'type',
    resource: 'client-options',
    tool: 'sdk',
  });

  if (isNuxtClient) {
    const symbolResponseType = plugin.querySymbol({
      category: 'type',
      resource: 'operation',
      resourceId: operation.id,
      role: 'response',
    });
    const dataType = isDataAllowed
      ? symbolDataType?.placeholder || 'unknown'
      : 'never';
    const responseType = symbolResponseType?.placeholder || 'unknown';
    return `${symbolOptions.placeholder}<${nuxtTypeComposable}, ${dataType}, ${responseType}, ${nuxtTypeDefault}>`;
  }

  // TODO: refactor this to be more generic, works for now
  if (throwOnError) {
    const dataType = isDataAllowed
      ? symbolDataType?.placeholder || 'unknown'
      : 'never';
    return `${symbolOptions.placeholder}<${dataType}, ${throwOnError}>`;
  }
  const dataType = isDataAllowed ? symbolDataType?.placeholder : 'never';
  return dataType
    ? `${symbolOptions.placeholder}<${dataType}>`
    : symbolOptions.placeholder;
};

type OperationParameters = {
  argNames: Array<string>;
  fields: Array<Field | Fields>;
  parameters: Array<ReturnType<typeof $.param>>;
};

export const operationParameters = ({
  isRequiredOptions,
  operation,
  plugin,
}: {
  isRequiredOptions: boolean;
  operation: IR.OperationObject;
  plugin: HeyApiSdkPlugin['Instance'];
}): OperationParameters => {
  const result: OperationParameters = {
    argNames: [],
    fields: [],
    parameters: [],
  };

  const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');
  const client = getClientPlugin(plugin.context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';

  if (plugin.config.paramsStructure === 'flat') {
    const signature = getSignatureParameters({ operation, plugin });
    const flatParams = $.type.object();

    if (signature) {
      let isParametersRequired = false;

      for (const key in signature.parameters) {
        const parameter = signature.parameters[key]!;
        if (parameter.isRequired) {
          isParametersRequired = true;
        }
        flatParams.prop(parameter.name, (p) =>
          p.optional(!parameter.isRequired).type(
            pluginTypeScript.api.schemaToType({
              plugin: pluginTypeScript,
              schema: parameter.schema,
              state: toRefs({
                path: [],
              }),
            }),
          ),
        );
      }

      result.argNames.push('parameters');
      for (const field of signature.fields) {
        result.fields.push(field);
      }

      result.parameters.push(
        $.param('parameters', (p) =>
          p.optional(!isParametersRequired).type(flatParams),
        ),
      );
    }
  }

  result.parameters.push(
    $.param('options', (p) =>
      p.optional(!isRequiredOptions).type(
        operationOptionsType({
          isDataAllowed: plugin.config.paramsStructure === 'grouped',
          operation,
          plugin,
          throwOnError: isNuxtClient ? undefined : 'ThrowOnError',
        }),
      ),
    ),
  );

  return result;
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

  return;
};

export const operationStatements = ({
  isRequiredOptions,
  opParameters,
  operation,
  plugin,
}: {
  isRequiredOptions: boolean;
  opParameters: OperationParameters;
  operation: IR.OperationObject;
  plugin: HeyApiSdkPlugin['Instance'];
}): Array<ReturnType<typeof $.return | typeof $.const>> => {
  const client = getClientPlugin(plugin.context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';

  const symbolResponseType = plugin.querySymbol({
    category: 'type',
    resource: 'operation',
    resourceId: operation.id,
    role: isNuxtClient ? 'response' : 'responses',
  });
  const responseType = symbolResponseType?.placeholder || 'unknown';

  const symbolErrorType = plugin.querySymbol({
    category: 'type',
    resource: 'operation',
    resourceId: operation.id,
    role: isNuxtClient ? 'error' : 'errors',
  });
  const errorType = symbolErrorType?.placeholder || 'unknown';

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

  const reqOptions = $.object();

  if (operation.body) {
    switch (operation.body.type) {
      case 'form-data': {
        const symbol = plugin.referenceSymbol({
          category: 'external',
          resource: 'client.formDataBodySerializer',
        });
        reqOptions.spread(symbol.placeholder);
        break;
      }
      case 'json':
        // jsonBodySerializer is the default, no need to specify
        break;
      case 'text':
      case 'octet-stream':
        // ensure we don't use any serializer by default
        reqOptions.prop('bodySerializer', $.literal(null));
        break;
      case 'url-search-params': {
        const symbol = plugin.referenceSymbol({
          category: 'external',
          resource: 'client.urlSearchParamsBodySerializer',
        });
        reqOptions.spread(symbol.placeholder);
        break;
      }
    }
  }

  // TODO: parser - set parseAs to skip inference if every response has the same
  // content type. currently impossible because successes do not contain
  // header information

  const paramSerializers = $.object();

  for (const name in operation.parameters?.query) {
    const parameter = operation.parameters.query[name]!;

    if (
      parameter.schema.type === 'array' ||
      parameter.schema.type === 'tuple'
    ) {
      if (parameter.style !== 'form' || !parameter.explode) {
        // override the default settings for array serialization
        paramSerializers.prop(
          parameter.name,
          $.object().prop(
            'array',
            $.object()
              .$if(parameter.explode === false, (o) =>
                o.prop('explode', $.literal(parameter.explode)),
              )
              .$if(parameter.style !== 'form', (o) =>
                o.prop('style', $.literal(parameter.style)),
              ),
          ),
        );
      }
    } else if (parameter.schema.type === 'object') {
      if (parameter.style !== 'deepObject' || !parameter.explode) {
        // override the default settings for object serialization
        paramSerializers.prop(
          parameter.name,
          $.object().prop(
            'object',
            $.object()
              .$if(parameter.explode === false, (o) =>
                o.prop('explode', $.literal(parameter.explode)),
              )
              .$if(parameter.style !== 'deepObject', (o) =>
                o.prop('style', $.literal(parameter.style)),
              ),
          ),
        );
      }
    }
  }

  if (paramSerializers.hasProps()) {
    // TODO: if all parameters have the same serialization,
    // apply it globally to reduce output size
    reqOptions.prop(
      'querySerializer',
      $.object().prop('parameters', paramSerializers),
    );
  }

  const requestValidator = createRequestValidator({ operation, plugin });
  const responseValidator = createResponseValidator({ operation, plugin });
  if (requestValidator) {
    reqOptions.prop('requestValidator', requestValidator.arrow());
  }

  if (plugin.config.transformer) {
    const query: SymbolMeta = {
      category: 'transform',
      resource: 'operation',
      resourceId: operation.id,
      role: 'response',
    };
    if (plugin.isSymbolRegistered(query)) {
      const ref = plugin.referenceSymbol(query);
      reqOptions.prop('responseTransformer', $(ref.placeholder));
    }
  }

  let hasServerSentEvents = false;
  let responseTypeValue: ReturnType<typeof getResponseType> | undefined;

  for (const statusCode in operation.responses) {
    const response = operation.responses[statusCode]!;

    // try to infer `responseType` option for Axios. We don't need this in
    // Fetch API client because it automatically detects the correct response
    // during runtime.
    if (!responseTypeValue && client.name === '@hey-api/client-axios') {
      // this doesn't handle default status code for now
      if (statusCodeToGroup({ statusCode }) === '2XX') {
        responseTypeValue = getResponseType(response.mediaType);
        if (responseTypeValue) {
          reqOptions.prop('responseType', $.literal(responseTypeValue));
        }
      }
    }

    if (response.mediaType === 'text/event-stream') {
      hasServerSentEvents = true;
    }
  }

  if (responseValidator) {
    reqOptions.prop('responseValidator', responseValidator.arrow());
  }

  if (plugin.config.responseStyle === 'data') {
    reqOptions.prop('responseStyle', $.literal(plugin.config.responseStyle));
  }

  const auth = operationAuth({ context: plugin.context, operation, plugin });
  if (auth.length) {
    reqOptions.prop('security', $.toExpr(auth)!);
  }

  reqOptions.prop('url', $.literal(operation.path));

  // options must go last to allow overriding parameters above
  reqOptions.spread('options');

  const statements: Array<ReturnType<typeof $.return | typeof $.const>> = [];
  const hasParams = opParameters.argNames.length;

  if (hasParams) {
    const args: Array<ReturnType<typeof $.expr>> = [];
    const config: Array<ReturnType<typeof $.object>> = [];
    for (const argName of opParameters.argNames) {
      args.push($(argName));
    }

    // When using flat params, fields need to be wrapped in an args array
    if (plugin.config.paramsStructure === 'flat') {
      const fieldShapes: Array<ReturnType<typeof $.object>> = [];
      for (const field of opParameters.fields) {
        const shape = $.object();
        if ('in' in field) {
          shape.prop('in', $.literal(field.in));
          if (field.key) {
            shape.prop('key', $.literal(field.key));
          }
          if (field.map) {
            shape.prop('map', $.literal(field.map));
          }
        }
        fieldShapes.push(shape);
      }
      // Wrap all fields in an args array for flat params
      const argsWrapper = $.object();
      argsWrapper.prop('args', $.array(...fieldShapes));
      config.push(argsWrapper);
    } else {
      // For grouped params, generate fields as before
      for (const field of opParameters.fields) {
        const shape = $.object();
        if ('in' in field) {
          shape.prop('in', $.literal(field.in));
          if (field.key) {
            shape.prop('key', $.literal(field.key));
          }
          if (field.map) {
            shape.prop('map', $.literal(field.map));
          }
        }
        config.push(shape);
      }
    }

    const symbol = plugin.referenceSymbol({
      category: 'external',
      resource: 'client.buildClientParams',
    });
    statements.push(
      $.const('params').assign(
        $(symbol.placeholder).call($.array(...args), $.array(...config)),
      ),
    );
    reqOptions.spread('params');
  }

  if (operation.body) {
    const parameterContentType = operation.parameters?.header?.['content-type'];
    const hasRequiredContentType = Boolean(parameterContentType?.required);
    // spreading required Content-Type on generated header would throw a TypeScript error
    if (!hasRequiredContentType) {
      const headers = $.object()
        .pretty()
        // form-data does not need Content-Type header, browser will set it automatically
        .prop(
          parameterContentType?.name ?? 'Content-Type',
          $.literal(
            operation.body.type === 'form-data'
              ? null
              : operation.body.mediaType,
          ),
        )
        .spread($('options').attr('headers').optional(!isRequiredOptions));
      if (hasParams) {
        headers.spread($('params').attr('headers'));
      }
      reqOptions.prop('headers', headers);
    }
  }

  const symbolClient = plugin.config.client
    ? plugin.getSymbol({
        category: 'client',
      })
    : undefined;

  const clientExpression = $('options')
    .attr('client')
    .optional(!isRequiredOptions)
    .$if(plugin.config.instance !== undefined, (c) =>
      c.coalesce($('this').attr('client')),
    )
    .$if(symbolClient !== undefined, (c) =>
      c.coalesce(symbolClient!.placeholder),
    );

  const functionName = hasServerSentEvents
    ? clientExpression.attr('sse').attr(operation.method)
    : clientExpression.attr(operation.method);

  statements.push(
    $.return(
      functionName
        .call(reqOptions)
        .$if(
          isNuxtClient,
          (f) =>
            f
              .generic(nuxtTypeComposable)
              .generic(`${responseType} | ${nuxtTypeDefault}`)
              .generic(errorType)
              .generic(nuxtTypeDefault),
          (f) =>
            f.generic(responseType).generic(errorType).generic('ThrowOnError'),
        )
        .$if(plugin.config.responseStyle === 'data', (f) =>
          f.generic($.type.literal(plugin.config.responseStyle)),
        ),
    ),
  );

  return statements;
};

import type { SymbolMeta } from '@hey-api/codegen-core';
import { refs } from '@hey-api/codegen-core';

import { statusCodeToGroup } from '~/ir/operation';
import type { IR } from '~/ir/types';
import { sanitizeNamespaceIdentifier } from '~/openApi/common/parser/sanitize';
import { getClientPlugin } from '~/plugins/@hey-api/client-core/utils';
import { $ } from '~/ts-dsl';
import { toCase } from '~/utils/to-case';

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

export const operationClassName = ({
  plugin,
  value,
}: {
  plugin: HeyApiSdkPlugin['Instance'];
  value: string;
}) => {
  // TODO: expose casing option
  const name = toCase(value, 'PascalCase');
  return (
    (typeof plugin.config.classNameBuilder === 'string'
      ? plugin.config.classNameBuilder.replace('{{name}}', name)
      : plugin.config.classNameBuilder(name)) || name
  );
};

export const operationMethodName = ({
  operation,
  plugin,
  value,
}: {
  operation: IR.OperationObject;
  plugin: HeyApiSdkPlugin['Instance'];
  value?: string;
}) => {
  // TODO: expose casing option
  const name = toCase(value || operation.id, 'camelCase');
  return (
    (typeof plugin.config.methodNameBuilder === 'string'
      ? plugin.config.methodNameBuilder.replace('{{name}}', name)
      : plugin.config.methodNameBuilder?.(name, operation)) || name
  );
};

/**
 * Returns a list of classes where this operation appears in the generated SDK.
 *
 * @deprecated
 */
export const operationClasses = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: HeyApiSdkPlugin['Instance'];
}): Map<string, ClassNameEntry> => {
  const classNames = new Map<string, ClassNameEntry>();

  let className: string | undefined;
  let methodName: string | undefined;
  let classCandidates: Array<string> = [];

  if (plugin.config.classStructure === 'auto' && operation.operationId) {
    classCandidates = operation.operationId.split(/[./]/).filter(Boolean);
    if (classCandidates.length >= 2) {
      const methodCandidate = classCandidates.pop()!;
      methodName = toCase(
        sanitizeNamespaceIdentifier(methodCandidate),
        'camelCase',
      );
      className = classCandidates.pop()!;
    }
  }

  const rootClasses = plugin.config.instance
    ? [plugin.config.instance]
    : (operation.tags ?? ['default']);

  for (const rootClass of rootClasses) {
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
      className: operationClassName({ plugin, value: className || rootClass }),
      methodName: methodName || operationMethodName({ operation, plugin }),
      path: path.map((value) => operationClassName({ plugin, value })),
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
}): ReturnType<typeof $.type> => {
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
    return $.type(symbolOptions)
      .generic(nuxtTypeComposable)
      .generic(isDataAllowed ? (symbolDataType ?? 'unknown') : 'never')
      .generic(symbolResponseType ?? 'unknown')
      .generic(nuxtTypeDefault);
  }

  // TODO: refactor this to be more generic, works for now
  if (throwOnError) {
    return $.type(symbolOptions)
      .generic(isDataAllowed ? (symbolDataType ?? 'unknown') : 'never')
      .generic(throwOnError);
  }
  return $.type(symbolOptions).$if(!isDataAllowed || symbolDataType, (t) =>
    t.generic(isDataAllowed ? symbolDataType! : 'never'),
  );
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
          p.required(parameter.isRequired).type(
            pluginTypeScript.api.schemaToType({
              plugin: pluginTypeScript,
              schema: parameter.schema,
              state: refs({
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
          p.required(isParametersRequired).type(flatParams),
        ),
      );
    }
  }

  result.parameters.push(
    $.param('options', (p) =>
      p.required(isRequiredOptions).type(
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

  const symbolErrorType = plugin.querySymbol({
    category: 'type',
    resource: 'operation',
    resourceId: operation.id,
    role: isNuxtClient ? 'error' : 'errors',
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

  const reqOptions = $.object();

  if (operation.body) {
    switch (operation.body.type) {
      case 'form-data': {
        const symbol = plugin.referenceSymbol({
          category: 'external',
          resource: 'client.formDataBodySerializer',
        });
        reqOptions.spread(symbol);
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
        reqOptions.spread(symbol);
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
      reqOptions.prop('responseTransformer', $(ref));
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
    reqOptions.prop('security', $.fromValue(auth));
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
    for (const field of opParameters.fields) {
      const shape = $.object();
      if ('in' in field) {
        shape.prop('in', $.literal(field.in));
      }
      if ('key' in field) {
        if (field.key) {
          shape.prop('key', $.literal(field.key));
        }
        if (field.map) {
          shape.prop('map', $.literal(field.map));
        }
      }
      config.push(shape);
    }
    const symbol = plugin.referenceSymbol({
      category: 'external',
      resource: 'client.buildClientParams',
    });
    statements.push(
      $.const('params').assign(
        $(symbol).call(
          $.array(...args),
          $.array($.object().prop('args', $.array(...config))),
        ),
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
        .spread($('options').attr('headers').required(isRequiredOptions));
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

  let clientExpression: ReturnType<typeof $.attr | typeof $.binary>;
  const optionsClient = $('options').attr('client').required(isRequiredOptions);
  if (plugin.config.instance) {
    clientExpression = optionsClient.coalesce($('this').attr('client'));
  } else if (symbolClient) {
    clientExpression = optionsClient.coalesce(symbolClient);
  } else {
    clientExpression = optionsClient;
  }

  let functionName = hasServerSentEvents
    ? clientExpression.attr('sse')
    : clientExpression;
  functionName = functionName.attr(operation.method);

  statements.push(
    $.return(
      functionName
        .call(reqOptions)
        .$if(
          isNuxtClient,
          (f) =>
            f
              .generic(nuxtTypeComposable)
              .generic(
                $.type.or(symbolResponseType ?? 'unknown', nuxtTypeDefault),
              )
              .generic(symbolErrorType ?? 'unknown')
              .generic(nuxtTypeDefault),
          (f) =>
            f
              .generic(symbolResponseType ?? 'unknown')
              .generic(symbolErrorType ?? 'unknown')
              .generic('ThrowOnError'),
        )
        .$if(plugin.config.responseStyle === 'data', (f) =>
          f.generic($.type.literal(plugin.config.responseStyle)),
        ),
    ),
  );

  return statements;
};

import type { FunctionParameter } from '../../../compiler';
import { clientApi } from '../../../generate/client';
import type { TypeScriptFile } from '../../../generate/files';
import { hasOperationDataRequired } from '../../../ir/operation';
import type { IR } from '../../../ir/types';
import type { Plugin } from '../../types';
import { getClientPlugin } from '../client-core/utils';
import {
  importIdentifierData,
  importIdentifierResponse,
} from '../typescript/ref';
import { nuxtTypeComposable, nuxtTypeDefault } from './constants';
import type { Config } from './types';

export const operationOptionsType = ({
  context,
  file,
  operation,
  throwOnError,
  transformData,
}: {
  context: IR.Context;
  file: TypeScriptFile;
  operation: IR.OperationObject;
  throwOnError?: string;
  transformData?: (name: string) => string;
}) => {
  const identifierData = importIdentifierData({ context, file, operation });
  const identifierResponse = importIdentifierResponse({
    context,
    file,
    operation,
  });

  const optionsName = clientApi.Options.name;

  const finalData = (name: string) =>
    transformData ? transformData(name) : name;

  const client = getClientPlugin(context.config);
  if (client.name === '@hey-api/client-nuxt') {
    return `${optionsName}<${nuxtTypeComposable}, ${identifierData.name ? finalData(identifierData.name) : 'unknown'}, ${identifierResponse.name || 'unknown'}, ${nuxtTypeDefault}>`;
  }

  // TODO: refactor this to be more generic, works for now
  if (throwOnError) {
    return `${optionsName}<${identifierData.name ? finalData(identifierData.name) : 'unknown'}, ${throwOnError}>`;
  }
  return identifierData.name
    ? `${optionsName}<${finalData(identifierData.name)}>`
    : optionsName;
};

export const createParameters = ({
  context,
  file,
  operation,
  plugin,
}: {
  context: IR.Context;
  file: TypeScriptFile;
  operation: IR.OperationObject;
  plugin: Plugin.Instance<Config>;
}): Array<FunctionParameter> | undefined => {
  const client = getClientPlugin(context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';

  const parameters: Array<FunctionParameter> = [];

  if (plugin.params === 'flattened') {
    const identifierData = importIdentifierData({ context, file, operation });

    if (identifierData.name) {
      parameters.push({
        isRequired: hasOperationDataRequired(operation),
        name: 'params',
        type: `OmitNever<Omit<${identifierData.name}, 'url'>>`,
      });
    }

    parameters.push({
      isRequired: !plugin.client || isNuxtClient,
      name: 'options',
      type: operationOptionsType({
        context,
        file,
        operation,
        throwOnError: isNuxtClient ? undefined : 'ThrowOnError',
        transformData: (name) => `Pick<${name}, 'url'>`,
      }),
    });
  }

  if (plugin.params === 'namespaced') {
    const isRequiredOptions =
      !plugin.client || isNuxtClient || hasOperationDataRequired(operation);
    parameters.push({
      isRequired: isRequiredOptions,
      name: 'options',
      type: operationOptionsType({
        context,
        file,
        operation,
        throwOnError: isNuxtClient ? undefined : 'ThrowOnError',
      }),
    });
  }

  return parameters.length ? parameters : undefined;
};

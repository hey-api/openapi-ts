import { clientApi } from '../../../generate/client';
import type { GeneratedFile } from '../../../generate/file';
import type { IR } from '../../../ir/types';
import type { ImportExportItemObject } from '../../../tsc/utils';
import { getClientPlugin } from '../../@hey-api/client-core/utils';
import { sdkId } from '../../@hey-api/sdk/constants';
import { operationOptionsType } from '../../@hey-api/sdk/operation';
import { typesId } from '../../@hey-api/typescript/ref';
import { getInitialState, type PluginState } from './state';
import type { PiniaColadaPlugin } from './types';

export const getFileForOperation = ({
  files,
  operation,
  plugin,
  states,
}: {
  files: Map<string, GeneratedFile>;
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
  states: Map<string, PluginState>;
}) => {
  let tag = '';
  if (plugin.config.groupByTag) {
    tag = operation.tags?.[0] || 'default';
  }

  const fileId = tag ? `${plugin.name}/${tag}` : plugin.name;

  if (!files.has(fileId)) {
    const filePath = tag ? `${plugin.output}/${tag}` : plugin.output;
    const file = plugin.createFile({
      case: plugin.config.case,
      id: fileId,
      path: filePath,
    });
    files.set(fileId, file);
    states.set(fileId, getInitialState());
    // import Options type from SDK
    file.import({
      ...clientApi.Options,
      module: file.relativePathToFile({ context: plugin.context, id: sdkId }),
    });
  }

  return {
    file: files.get(fileId)!,
    state: states.get(fileId)!,
  };
};

export const getPublicTypeData = ({
  plugin,
  typeData,
}: {
  plugin: PiniaColadaPlugin['Instance'];
  typeData: string;
}) => {
  const client = getClientPlugin(plugin.context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';
  const strippedTypeData = isNuxtClient
    ? `Omit<${typeData}, 'composable'>`
    : typeData;

  return { isNuxtClient, strippedTypeData };
};

export const useTypeData = ({
  file,
  operation,
  plugin,
}: {
  file: GeneratedFile;
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
}) => {
  const pluginSdk = plugin.getPlugin('@hey-api/sdk')!;
  return operationOptionsType({ file, operation, plugin: pluginSdk });
};

export const useTypeError = ({
  file,
  operation,
  plugin,
}: {
  file: GeneratedFile;
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
}) => {
  const pluginTypeScript = plugin.getPlugin('@hey-api/typescript')!;
  const fileTypeScript = plugin.context.file({ id: typesId })!;
  const errorImport = file.import({
    asType: true,
    module: file.relativePathToFile({ context: plugin.context, id: typesId }),
    name: fileTypeScript.getName(
      pluginTypeScript.api.getId({ operation, type: 'error' }),
    ),
  });
  let typeError: ImportExportItemObject = {
    asType: true,
    name: errorImport.name || '',
  };
  if (!typeError.name) {
    typeError = {
      asType: true,
      name: 'Error',
    };
  }
  const client = getClientPlugin(plugin.context.config);
  if (client.name === '@hey-api/client-axios') {
    const axiosError = file.import({
      asType: true,
      module: 'axios',
      name: 'AxiosError',
    });
    typeError = {
      ...axiosError,
      name: `${axiosError.name}<${typeError.name}>`,
    };
  }
  return typeError;
};

export const useTypeResponse = ({
  file,
  operation,
  plugin,
}: {
  file: GeneratedFile;
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
}) => {
  const pluginTypeScript = plugin.getPlugin('@hey-api/typescript')!;
  const fileTypeScript = plugin.context.file({ id: typesId })!;
  const responseImport = file.import({
    asType: true,
    module: file.relativePathToFile({ context: plugin.context, id: typesId }),
    name: fileTypeScript.getName(
      pluginTypeScript.api.getId({ operation, type: 'response' }),
    ),
  });

  const typeResponse = responseImport.name || 'unknown';
  return typeResponse;
};

import { clientApi } from '../../../generate/client';
import type { GeneratedFile } from '../../../generate/file';
import type { IR } from '../../../ir/types';
import { sdkId } from '../../@hey-api/sdk/constants';
import { operationOptionsType } from '../../@hey-api/sdk/operation';
import type { PluginState } from './state';
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
  if (!plugin.config.groupByTag) {
    // Single file mode
    const fileId = plugin.name;
    if (!files.has(fileId)) {
      const file = plugin.createFile({
        case: plugin.config.case,
        id: fileId,
        path: plugin.output,
      });
      files.set(fileId, file);
      states.set(fileId, {
        hasMutations: false,
        hasQueries: false,
        hasUsedQueryFn: false,
      });
      // Import Options type from SDK
      file.import({
        ...clientApi.Options,
        module: file.relativePathToFile({
          context: plugin.context,
          id: sdkId,
        }),
      });
    }
    return { file: files.get(fileId)!, state: states.get(fileId)! };
  }

  // Group by tag mode
  const tag = operation.tags?.[0] || 'default';
  const fileId = `${plugin.name}/${tag}`;

  if (!files.has(fileId)) {
    const file = plugin.createFile({
      case: plugin.config.case,
      id: fileId,
      path: `${plugin.output}/${tag}`,
    });
    files.set(fileId, file);
    states.set(fileId, {
      hasMutations: false,
      hasQueries: false,
      hasUsedQueryFn: false,
    });
    // Import Options type from SDK
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
  const typeData = operationOptionsType({ file, operation, plugin: pluginSdk });
  return typeData;
};

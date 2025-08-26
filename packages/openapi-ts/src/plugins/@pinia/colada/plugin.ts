import type { GeneratedFile } from '../../../generate/file';
import { tsc } from '../../../tsc';
import { stringCase } from '../../../utils/stringCase';
import { sdkId } from '../../@hey-api/sdk/constants';
import { operationClasses } from '../../@hey-api/sdk/operation';
import { serviceFunctionIdentifier } from '../../@hey-api/sdk/plugin-legacy';
import { createMutationOptions } from './mutation';
import { createQueryOptions } from './query';
import type { PluginState } from './state';
import type { PiniaColadaPlugin } from './types';
import { getFileForOperation } from './utils';

export const handler: PiniaColadaPlugin['Handler'] = ({ plugin }) => {
  const files = new Map<string, GeneratedFile>();
  const states = new Map<string, PluginState>();

  plugin.forEach('operation', ({ operation }) => {
    const { file, state } = getFileForOperation({
      files,
      operation,
      plugin,
      states,
    });
    state.hasUsedQueryFn = false;

    const sdkPlugin = plugin.getPlugin('@hey-api/sdk')!;
    const classes = sdkPlugin.config.asClass
      ? operationClasses({
          context: plugin.context,
          operation,
          plugin: sdkPlugin,
        })
      : undefined;
    const entry = classes ? classes.values().next().value : undefined;
    const queryFn =
      // TODO: this should use class graph to determine correct path string
      // as it's really easy to break once we change the class casing
      (
        entry
          ? [
              entry.path[0],
              ...entry.path.slice(1).map((className: string) =>
                stringCase({
                  case: 'camelCase',
                  value: className,
                }),
              ),
              entry.methodName,
            ].filter(Boolean)
          : [
              serviceFunctionIdentifier({
                config: plugin.context.config,
                handleIllegal: true,
                id: operation.id,
                operation,
              }),
            ]
      ).join('.');

    createQueryOptions({
      file,
      operation,
      plugin,
      queryFn,
      state,
    });

    createMutationOptions({
      file,
      operation,
      plugin,
      queryFn,
      state,
    });

    if (state.hasUsedQueryFn) {
      file.import({
        module: file.relativePathToFile({
          context: plugin.context,
          id: sdkId,
        }),
        name: queryFn.split('.')[0]!,
      });
    }
  });

  // re-export all split files
  if (plugin.config.groupByTag && plugin.config.exportFromIndex) {
    const indexFile = plugin.createFile({
      case: plugin.config.case,
      id: `${plugin.name}/index`,
      path: `${plugin.output}/index`,
    });

    files.forEach((_, fileId) => {
      if (fileId !== plugin.name) {
        const tag = fileId.split('/').pop()!;
        indexFile.add(
          tsc.exportAllDeclaration({
            module: `./${tag}`,
          }),
        );
      }
    });
  }
};

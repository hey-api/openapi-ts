import { stringCase } from '../../../utils/stringCase';
import { operationClasses } from '../../@hey-api/sdk/operation';
import { createMutationOptions } from './mutationOptions';
import { createQueryOptions } from './queryOptions';
import type { PiniaColadaPlugin } from './types';

export const handler: PiniaColadaPlugin['Handler'] = ({ plugin }) => {
  plugin.registerSymbol({
    external: plugin.name,
    meta: {
      kind: 'type',
    },
    name: 'UseMutationOptions',
    selector: plugin.api.getSelector('UseMutationOptions'),
  });
  plugin.registerSymbol({
    external: plugin.name,
    meta: {
      kind: 'type',
    },
    name: 'UseQueryOptions',
    selector: plugin.api.getSelector('UseQueryOptions'),
  });
  plugin.registerSymbol({
    external: plugin.name,
    meta: {
      kind: 'type',
    },
    name: '_JSONValue',
    selector: plugin.api.getSelector('_JSONValue'),
  });
  plugin.registerSymbol({
    external: 'axios',
    meta: {
      kind: 'type',
    },
    name: 'AxiosError',
    selector: plugin.api.getSelector('AxiosError'),
  });

  const sdkPlugin = plugin.getPluginOrThrow('@hey-api/sdk');

  plugin.forEach('operation', ({ operation }) => {
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
      entry
        ? [
            plugin.referenceSymbol(
              sdkPlugin.api.getSelector('class', entry.path[0]),
            ).placeholder,
            ...entry.path.slice(1).map((className: string) =>
              stringCase({
                case: 'camelCase',
                value: className,
              }),
            ),
            entry.methodName,
          ]
            .filter(Boolean)
            .join('.')
        : plugin.referenceSymbol(
            sdkPlugin.api.getSelector('function', operation.id),
          ).placeholder;

    if (plugin.hooks.operation.isQuery(operation)) {
      if (plugin.config.queryOptions.enabled) {
        createQueryOptions({ operation, plugin, queryFn });
      }
    }

    if (plugin.hooks.operation.isMutation(operation)) {
      if (plugin.config.mutationOptions.enabled) {
        createMutationOptions({ operation, plugin, queryFn });
      }
    }
  });
};

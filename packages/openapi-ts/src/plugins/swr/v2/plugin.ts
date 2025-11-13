import ts from 'typescript';

import { operationClasses } from '~/plugins/@hey-api/sdk/shared/operation';
import { stringCase } from '~/utils/stringCase';

import type { PluginHandler } from '../types';
import { createSwrInfiniteOptions } from './swrInfiniteOptions';
import { createSwrMutationOptions } from './swrMutationOptions';
import { createSwrOptions } from './swrOptions';

/**
 * Main handler for the SWR plugin (v2).
 *
 * This plugin generates useSWR and useSWRMutation options for each operation.
 * It follows SWR's official recommended patterns for key design and data fetching.
 */
export const handlerV2: PluginHandler = ({ plugin }) => {
  // Add file-level eslint-disable comment for unused vars
  // This is more stable than adding inline comments which can be misplaced by formatters
  const eslintDisableSymbol = plugin.registerSymbol({
    exported: false,
    meta: {
      category: 'utility',
      resource: 'eslint-config',
    },
    name: '__eslintDisable',
  });

  // Create an empty statement with the eslint-disable comment
  const eslintDisableComment = ts.factory.createEmptyStatement();
  ts.addSyntheticLeadingComment(
    eslintDisableComment,
    ts.SyntaxKind.MultiLineCommentTrivia,
    ' eslint-disable @typescript-eslint/no-unused-vars ',
    true,
  );

  plugin.setSymbolValue(eslintDisableSymbol, eslintDisableComment);

  // Register external symbols from axios (for error types)
  plugin.registerSymbol({
    external: 'axios',
    kind: 'type',
    meta: {
      category: 'external',
      resource: 'axios.AxiosError',
    },
    name: 'AxiosError',
  });

  const sdkPlugin = plugin.getPluginOrThrow('@hey-api/sdk');

  // Iterate over all operations
  plugin.forEach(
    'operation',
    ({ operation }) => {
      // Get the SDK function name
      const classes = sdkPlugin.config.asClass
        ? operationClasses({
            context: plugin.context,
            operation,
            plugin: sdkPlugin,
          })
        : undefined;
      const entry = classes ? classes.values().next().value : undefined;
      const sdkFn = entry
        ? [
            plugin.referenceSymbol({
              category: 'utility',
              resource: 'class',
              resourceId: entry.path[0],
              tool: 'sdk',
            }).placeholder,
            ...entry.path.slice(1).map((className) =>
              stringCase({
                case: 'camelCase',
                value: className,
              }),
            ),
            entry.methodName,
          ]
            .filter(Boolean)
            .join('.')
        : plugin.referenceSymbol({
            category: 'sdk',
            resource: 'operation',
            resourceId: operation.id,
          }).placeholder;

      // Generate appropriate SWR functions based on operation type
      if (plugin.hooks.operation.isQuery(operation)) {
        if (plugin.config.swrOptions.enabled) {
          createSwrOptions({ operation, plugin, sdkFn });
        }
        if (plugin.config.swrInfiniteOptions.enabled) {
          createSwrInfiniteOptions({ operation, plugin, sdkFn });
        }
      }

      if (plugin.hooks.operation.isMutation(operation)) {
        if (plugin.config.swrMutationOptions.enabled) {
          createSwrMutationOptions({ operation, plugin, sdkFn });
        }
      }
    },
    {
      order: 'declarations',
    },
  );
};

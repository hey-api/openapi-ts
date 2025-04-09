import type { IR } from '../../../ir/types';
import { clientId } from '../../@hey-api/client-core/utils.js';
import type { Plugin } from '../../types';
import { createMutationFunction } from './mutation';
import { createQueryFunction } from './query';
import type { Config } from './types';
import { isQuery } from './utils';

/**
 * Main handler for the Pinia Colada plugin
 */
export const handler: Plugin.Handler<Config> = ({
  context,
  plugin,
}: {
  context: IR.Context;
  plugin: Plugin.Instance<Config>;
}) => {
  const { enableCaching, exportFromIndex, groupByTag, name, output } = plugin;

  // Create default configuration if not provided
  if (enableCaching && plugin.defaultCacheTime === undefined) {
    plugin.defaultCacheTime = 300000; // 5 minutes
  }

  if (enableCaching && plugin.defaultStaleTime === undefined) {
    plugin.defaultStaleTime = 0; // No stale time by default
  }

  if (!groupByTag) {
    context.createFile({
      exportFromIndex,
      id: name,
      path: output,
    });
  }

  // Create files based on grouping strategy
  const getFile = (tag: string) => {
    if (!groupByTag) {
      return (
        context.file({ id: name }) ??
        context.createFile({
          exportFromIndex,
          id: name,
          path: output,
        })
      );
    }

    const fileId = `${name}/${tag}`;
    return (
      context.file({ id: fileId }) ??
      context.createFile({
        exportFromIndex,
        id: fileId,
        path: `${output}/${tag}`,
      })
    );
  };

  // Process each operation as it's discovered
  context.subscribe(
    'operation',
    ({ operation }: { operation: IR.OperationObject }) => {
      const file = getFile(operation.tags?.[0] || 'default');

      // Determine if the operation should be a query or mutation
      if (isQuery(operation, plugin)) {
        createQueryFunction({ context, file, operation, plugin });
      } else {
        createMutationFunction({ context, file, operation, plugin });
      }
    },
  );

  // Clean up and finalize after processing
  context.subscribe('after', () => {
    // Add client import to all generated files
    Object.entries(context.files).forEach(([fileId, file]) => {
      if (fileId.startsWith(name)) {
        // Make sure we have a client import
        file.import({
          alias: '_heyApiClient',
          module: file.relativePathToFile({ context, id: clientId }),
          name: 'client',
        });
      }
    });
  });
};

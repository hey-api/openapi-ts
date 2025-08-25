import { clientId } from '../../@hey-api/client-core/utils';
import { createMutationFunction } from './mutation';
import { createQueryFunction } from './query';
import type { PiniaColadaPlugin } from './types';
import { isQuery } from './utils';

export const handler: PiniaColadaPlugin['Handler'] = ({ plugin }) => {
  if (!plugin.config.groupByTag) {
    plugin.createFile({
      id: plugin.name,
      path: plugin.output,
    });
  }

  // Create files based on grouping strategy
  const getFile = (tag: string) => {
    if (!plugin.config.groupByTag) {
      return (
        plugin.context.file({ id: plugin.name }) ??
        plugin.createFile({
          id: plugin.name,
          path: plugin.output,
        })
      );
    }

    const fileId = `${plugin.name}/${tag}`;
    return (
      plugin.context.file({ id: fileId }) ??
      plugin.createFile({
        id: fileId,
        path: `${plugin.output}/${tag}`,
      })
    );
  };

  plugin.forEach('operation', ({ operation }) => {
    const file = getFile(operation.tags?.[0] || 'default');

    // Determine if the operation should be a query or mutation
    if (isQuery(operation, plugin)) {
      createQueryFunction({ context: plugin.context, file, operation, plugin });
    } else {
      createMutationFunction({ context: plugin.context, file, operation, plugin });
    }
  })

  // Add client import to all generated files
  Object.entries(plugin.context.files).forEach(([fileId, file]) => {
    if (fileId.startsWith(plugin.name)) {
      // Make sure we have a client import
      file.import({
        alias: '_heyApiClient',
        module: file.relativePathToFile({ context: plugin.context, id: clientId }),
        name: 'client',
      });
    }
  });
};

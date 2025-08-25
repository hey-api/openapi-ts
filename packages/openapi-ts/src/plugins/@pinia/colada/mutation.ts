import type { GeneratedFile } from '../../../generate/file';
import type { IR } from '../../../ir/types';
import type { PiniaColadaPlugin } from './types';
import { createComposable } from './utils';

/**
 * Creates a mutation function for an operation
 */
export const createMutationFunction = ({
  context,
  file,
  operation,
  plugin,
}: {
  context: IR.Context;
  file: GeneratedFile;
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
}) => {
  // Allow hooks to customize or skip mutation generation
  if (plugin.config.onMutation && plugin.config.onMutation(operation) === false) {
    return;
  }

  createComposable({ context, file, isQuery: false, operation, plugin });
};

import type { TypeScriptFile } from '../../../generate/files';
import type { IR } from '../../../ir/types';
import type { Plugin } from '../../types';
import type { Config } from './types';
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
  file: TypeScriptFile;
  operation: IR.OperationObject;
  plugin: Plugin.Instance<Config>;
}) => {
  // Allow hooks to customize or skip mutation generation
  if (plugin?.onMutation && plugin.onMutation(operation) === false) {
    return;
  }

  createComposable({ context, file, isQuery: false, operation, plugin });
};

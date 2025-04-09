import type { TypeScriptFile } from '../../../generate/files';
import type { IR } from '../../../ir/types';
import type { Plugin } from '../../types';
import type { Config } from './types';
import { createComposable } from './utils';

/**
 * Creates a query function for an operation
 */
export const createQueryFunction = ({
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
  // Allow hooks to customize or skip query generation
  if (plugin?.onQuery && plugin.onQuery(operation) === false) {
    return;
  }

  createComposable({ context, file, isQuery: true, operation, plugin });
};

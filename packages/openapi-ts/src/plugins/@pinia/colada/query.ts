import type { GeneratedFile } from '../../../generate/file';
import type { IR } from '../../../ir/types';
import type { PiniaColadaPlugin } from './types';
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
  file: GeneratedFile;
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
}) => {
  if (plugin.config.onQuery && plugin.config.onQuery(operation) === false) {
    return;
  }

  createComposable({ context, file, isQuery: true, operation, plugin });
};

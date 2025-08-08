import type ts from 'typescript';

import type { IR } from '../../../ir/types';
import { tsc } from '../../../tsc';
import type { PluginInstance } from './types';

/**
 * Handle the meta configuration
 * @param plugin - The plugin instance
 * @param operation - The operation object to get the meta from
 * @param targetArray - The target array to add the meta to
 * @param configPath - The path to the meta configuration
 */
export const handleMeta = (
  plugin: PluginInstance,
  operation: IR.OperationObject,
  configPath: 'queryOptions' | 'infiniteQueryOptions' | 'mutationOptions',
): ts.Expression | undefined => {
  const metaConfig = plugin.config[configPath].meta;

  if (typeof metaConfig !== 'function') {
    return undefined;
  }

  const customMeta = metaConfig(operation);

  return tsc.valueToExpression({ value: customMeta });
};

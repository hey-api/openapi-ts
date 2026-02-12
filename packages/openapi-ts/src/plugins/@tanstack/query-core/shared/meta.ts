import type { IR } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { PluginInstance } from '../types';

export const handleMeta = (
  plugin: PluginInstance,
  operation: IR.OperationObject,
  configPath: 'queryOptions' | 'infiniteQueryOptions' | 'mutationOptions',
): ReturnType<typeof $.fromValue> | undefined => {
  const metaFn = plugin.config[configPath].meta;
  if (!metaFn) return;

  const metaObject = metaFn(operation);
  if (!Object.keys(metaObject).length) return;

  return $.fromValue(metaObject);
};

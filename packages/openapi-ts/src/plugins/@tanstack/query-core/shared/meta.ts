import type { IR } from '~/ir/types';
import { $ } from '~/ts-dsl';

import type { PluginInstance } from '../types';

export const handleMeta = (
  plugin: PluginInstance,
  operation: IR.OperationObject,
  configPath: 'queryOptions' | 'infiniteQueryOptions' | 'mutationOptions',
): ReturnType<typeof $.toExpr> | undefined => {
  const metaFn = plugin.config[configPath].meta;
  if (!metaFn) return;

  const metaObject = metaFn(operation);
  if (!Object.keys(metaObject).length) return;

  return $.toExpr(metaObject);
};

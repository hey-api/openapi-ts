import type { IR } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import type { PiniaColadaPlugin } from './types';

export const handleMeta = (
  plugin: PiniaColadaPlugin['Instance'],
  operation: IR.OperationObject,
  configPath: 'queryOptions' | 'mutationOptions',
): ReturnType<typeof $.fromValue> | undefined => {
  const metaFn = plugin.config[configPath].meta;
  if (!metaFn) return;

  const metaObject = metaFn(operation);
  if (!Object.keys(metaObject).length) return;

  return $.fromValue(metaObject);
};

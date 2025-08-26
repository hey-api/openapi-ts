import type ts from 'typescript';

import type { IR } from '../../../ir/types';
import { tsc } from '../../../tsc';
import type { PiniaColadaPlugin } from './types';

export const handleMeta = (
  plugin: PiniaColadaPlugin['Instance'],
  operation: IR.OperationObject,
  configPath: 'queryOptions' | 'mutationOptions',
): ts.Expression | undefined => {
  const metaFn = plugin.config[configPath].meta;
  if (!metaFn) return;

  const metaObject = metaFn(operation);
  if (!Object.keys(metaObject).length) return;

  return tsc.valueToExpression({ value: metaObject });
};

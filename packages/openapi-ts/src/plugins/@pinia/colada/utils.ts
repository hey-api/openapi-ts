import type { IR } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import type { PiniaColadaPlugin } from './types';
import { useTypeData } from './use-type';

export function getPublicTypeData({
  isNuxtClient,
  operation,
  plugin,
}: {
  isNuxtClient: boolean;
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
}): ReturnType<typeof $.type> {
  const typeData = useTypeData({ operation, plugin });
  return isNuxtClient ? $.type('Omit').generic(typeData).generic('composable') : typeData;
}

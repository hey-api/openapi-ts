import type { IR } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import type { PiniaColadaPlugin } from './types';
import { useTypeData } from './useType';

export const getPublicTypeData = ({
  isNuxtClient,
  operation,
  plugin,
}: {
  isNuxtClient: boolean;
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
}) => {
  const typeData = useTypeData({ operation, plugin });
  return isNuxtClient ? $.type('Omit').generic(typeData).generic('composable') : typeData;
};

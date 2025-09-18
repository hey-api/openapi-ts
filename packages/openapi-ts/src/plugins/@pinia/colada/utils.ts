import { getClientPlugin } from '../../@hey-api/client-core/utils';
import type { PiniaColadaPlugin } from './types';
export const getPublicTypeData = ({
  plugin,
  typeData,
}: {
  plugin: PiniaColadaPlugin['Instance'];
  typeData: string;
}) => {
  const client = getClientPlugin(plugin.context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';
  const strippedTypeData = isNuxtClient
    ? `Omit<${typeData}, 'composable'>`
    : typeData;

  return { isNuxtClient, strippedTypeData };
};

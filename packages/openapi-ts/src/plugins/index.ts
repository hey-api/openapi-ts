import {
  type PluginTanStackReactQuery,
  pluginTanStackReactQueryDefaultConfig,
} from './@tanstack/react-query/config';
import {
  type PluginTanStackVueQuery,
  pluginTanStackVueQueryDefaultConfig,
} from './@tanstack/vue-query/config';

export type Plugins = PluginTanStackReactQuery | PluginTanStackVueQuery;

type KeyTypes = string | number | symbol;

type ExtractFromPluginConfig<T> = T extends { name: infer U }
  ? U extends KeyTypes
    ? U
    : never
  : never;

type DefaultPluginConfigsMap<
  T,
  U extends KeyTypes = ExtractFromPluginConfig<T>,
> = {
  [K in U]: Required<Extract<T, { name: K }>>;
};

export const defaultPluginConfigs: DefaultPluginConfigsMap<Plugins> = {
  '@tanstack/react-query': pluginTanStackReactQueryDefaultConfig,
  '@tanstack/vue-query': pluginTanStackVueQueryDefaultConfig,
};

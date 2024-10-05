import type { Client } from '../types/client';
import type { Files } from '../types/utils';

export type PluginHandler<PluginConfig> = (args: {
  client: Client;
  files: Files;
  plugin: Omit<Required<PluginConfig>, 'handler'>;
}) => void;

type KeyTypes = string | number | symbol;

type ExtractFromPluginConfig<T> = T extends { name: infer U }
  ? U extends KeyTypes
    ? U
    : never
  : never;

export type DefaultPluginConfigsMap<
  T,
  U extends KeyTypes = ExtractFromPluginConfig<T>,
> = {
  [K in U]: {
    handler: PluginHandler<Required<Extract<T, { name: K }>>>;
    name: string;
    output?: string;
  };
};

import type { IRContext } from '../ir/context';
import type { Client } from '../types/client';
import type { Files } from '../types/utils';

export type PluginLegacyHandler<PluginConfig> = (args: {
  client: Client;
  files: Files;
  plugin: Omit<Required<PluginConfig>, 'handler' | 'handlerLegacy'>;
}) => void;

export type PluginHandler<PluginConfig> = (args: {
  context: IRContext;
  plugin: Omit<Required<PluginConfig>, 'handler' | 'handlerLegacy'>;
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
    handlerLegacy: PluginLegacyHandler<Required<Extract<T, { name: K }>>>;
    name: string;
    output?: string;
  };
};

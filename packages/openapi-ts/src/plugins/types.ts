import type { Client } from '../types/client';
import type { Config } from '../types/config';
import type { Files } from '../types/utils';

export interface PluginDefinition {
  handler: (args: {
    client: Client;
    files: Files;
    outputParts: string[];
    plugin: Config['plugins'][number];
  }) => void;
  name: string;
  output?: string;
}

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
  [K in U]: Required<Extract<T, { name: K }>> & PluginDefinition;
};

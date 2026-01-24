import type { MaybeArray } from '@hey-api/types';

import type { PluginClientNames, PluginNames } from '~/plugins/types';

export interface CliOptions {
  client?: PluginClientNames;
  debug?: boolean;
  dryRun?: boolean;
  file?: string;
  input?: MaybeArray<string>;
  logFile?: boolean;
  logs?: string;
  output?: MaybeArray<string>;
  plugins?: ReadonlyArray<PluginNames>;
  silent?: boolean;
  watch?: boolean | string;
}

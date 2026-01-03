import type { PluginContext } from '~/plugins/types';

import type { UserConfig } from '../types';
import type { ExamplesConfig } from './types';

type Config = Omit<UserConfig, 'name'>;

export function resolveExamples(
  config: Config,
  context: PluginContext,
): ExamplesConfig {
  return context.valueToObject({
    defaultValue: {
      enabled: Boolean(config.examples),
      language: 'JavaScript',
    },
    mappers: {
      boolean: (enabled) => ({ enabled }),
    },
    value: config.examples,
  }) as ExamplesConfig;
}

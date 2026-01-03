import { valueToObject } from '../../utils/config';
import type { UserOutput } from '../types';
import type { SourceConfig } from './types';

export function resolveSource(config: UserOutput): SourceConfig {
  const source = valueToObject({
    defaultValue: {
      enabled: Boolean(config.source),
      extension: 'json',
      fileName: 'source',
      serialize: (input) => JSON.stringify(input, null, 2),
    },
    mappers: {
      boolean: (enabled) => ({ enabled }),
    },
    value: config.source,
  });
  if (source.path === undefined || source.path === true) {
    source.path = '';
  } else if (source.path === false) {
    source.path = null;
  }
  return source as SourceConfig;
}

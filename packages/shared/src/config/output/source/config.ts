import { coerce } from '../../../normalize/coerce';
import { defineConfig } from '../../../normalize/config';
import type { SourceConfig, UserSourceConfig } from './types';

export const sourceConfig = defineConfig<boolean | UserSourceConfig, SourceConfig>({
  $coerceAny: ({ value }) => ({ enabled: Boolean(value) }),
  enabled: false,
  extension: 'json',
  fileName: 'source',
  path: coerce((value: UserSourceConfig['path']): string | null => {
    if (value === true || value === undefined || value === '') return '';
    if (value === false || value === null) return null;
    return value;
  }),
  serialize: coerce((value) =>
    typeof value === 'function' ? value : (input) => JSON.stringify(input, null, 2),
  ),
});

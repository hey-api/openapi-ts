import { definePluginConfig } from '../../shared/utils/config';
import { handler } from './plugin';
import { handlerLegacy } from './plugin-legacy';
import type { HeyApiTypeScriptPlugin } from './types';

export const defaultConfig: HeyApiTypeScriptPlugin['Config'] = {
  config: {
    enums: false,
    enumsCase: 'SCREAMING_SNAKE_CASE',
    enumsConstantsIgnoreNull: false,
    exportFromIndex: true,
    exportInlineEnums: false,
    identifierCase: 'PascalCase',
    readOnlyWriteOnlyBehavior: 'split',
    readableNameBuilder: '{{name}}Readable',
    style: 'preserve',
    tree: false,
    writableNameBuilder: '{{name}}Writable',
  },
  handler,
  handlerLegacy,
  name: '@hey-api/typescript',
  output: 'types',
};

/**
 * Type helper for `@hey-api/typescript` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);

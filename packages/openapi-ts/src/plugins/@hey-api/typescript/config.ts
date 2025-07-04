import { definePluginConfig } from '../../shared/utils/config';
import { handler } from './plugin';
import { handlerLegacy } from './plugin-legacy';
import type { HeyApiTypeScriptPlugin } from './types';

export const defaultConfig: HeyApiTypeScriptPlugin['Config'] = {
  config: {
    case: 'PascalCase',
    exportFromIndex: true,
    style: 'preserve',
    tree: false,
  },
  handler,
  handlerLegacy,
  name: '@hey-api/typescript',
  output: 'types',
  resolveConfig: (plugin, context) => {
    plugin.config.enums = context.valueToObject({
      defaultValue: {
        case: 'SCREAMING_SNAKE_CASE',
        constantsIgnoreNull: false,
        enabled: Boolean(plugin.config.enums),
        mode: 'javascript',
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
        string: (mode) => ({ mode }),
      },
      value: plugin.config.enums,
    });
  },
};

/**
 * Type helper for `@hey-api/typescript` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);

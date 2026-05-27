import { log } from '@hey-api/codegen-core';
import type { AnyPluginName, PluginTag } from '@hey-api/shared';
import { definePluginConfig } from '@hey-api/shared';

import { resolveOperations } from './operations';
import { handler } from './plugin';
import { sdkSymbols } from './symbols';
import type { HeyApiSdkPlugin } from './types';

export const defaultConfig: HeyApiSdkPlugin['Config'] = {
  config: {
    // auth: true,
    comments: true,
    examples: {
      $onCoerce: ({ value }) => ({ enabled: Boolean(value) }),
      enabled: false,
      language: 'Python',
    },
    includeInEntry: true,
    paramsStructure: 'grouped',
    // responseStyle: 'fields',
    // transformer: false,
    // validator: false,
  },
  dependencies: ['pydantic'],
  handler,
  name: '@hey-api/python-sdk',
  resolveConfig(plugin, context) {
    function resolvePlugin<T extends AnyPluginName | boolean = AnyPluginName>(
      value: boolean | T | undefined,
      tag: PluginTag,
      options?: { defaultPlugin?: Exclude<T, boolean>; warn?: string },
    ): T | false {
      if (value === false) return false;
      if (typeof value === 'string') {
        plugin.dependencies.add(value);
        return value;
      }
      try {
        const resolved = context.pluginByTag(
          tag,
          options?.defaultPlugin ? { defaultPlugin: options.defaultPlugin } : undefined,
        );
        if (resolved) plugin.dependencies.add(resolved);
        return (resolved as T) ?? false;
      } catch {
        if (value !== undefined && options?.warn) log.warn(options.warn);
        return false;
      }
    }

    plugin.config.client = resolvePlugin(plugin.config.client, 'client', {
      defaultPlugin: '@hey-api/client-httpx',
    });

    // if (plugin.config.transformer) {
    //   if (typeof plugin.config.transformer === 'boolean') {
    //     plugin.config.transformer = context.pluginByTag('transformer');
    //   }
    //   plugin.dependencies.add(plugin.config.transformer!);
    // } else {
    //   plugin.config.transformer = false;
    // }
    // if (typeof plugin.config.validator !== 'object') {
    //   plugin.config.validator = {
    //     request: plugin.config.validator,
    //     response: plugin.config.validator,
    //   };
    // }
    // if (plugin.config.validator.request) {
    //   if (typeof plugin.config.validator.request === 'boolean') {
    //     plugin.config.validator.request = context.pluginByTag('validator');
    //   }
    //   plugin.dependencies.add(plugin.config.validator.request!);
    // } else {
    //   plugin.config.validator.request = false;
    // }
    // if (plugin.config.validator.response) {
    //   if (typeof plugin.config.validator.response === 'boolean') {
    //     plugin.config.validator.response = context.pluginByTag('validator');
    //   }
    //   plugin.dependencies.add(plugin.config.validator.response!);
    // } else {
    //   plugin.config.validator.response = false;
    // }
    plugin.config.operations = resolveOperations(plugin.config, context);
  },
  symbols: sdkSymbols,
};

/**
 * Type helper for `@hey-api/python-sdk` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);

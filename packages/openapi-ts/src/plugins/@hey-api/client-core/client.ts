import path from 'node:path';

import { parseUrl } from '@hey-api/shared';

import { getTypedConfig } from '../../../config/utils';
import { clientFolderAbsolutePath } from '../../../generate/client';
import { $ } from '../../../ts-dsl';
import type { PluginHandler } from './types';
import { getClientBaseUrlKey } from './utils';

const resolveBaseUrlString = ({ plugin }: Parameters<PluginHandler>[0]): string | undefined => {
  const { baseUrl } = plugin.config;

  if (baseUrl === false) {
    return;
  }

  if (typeof baseUrl === 'string') {
    return baseUrl;
  }

  const { servers } = plugin.context.ir;

  if (!servers) {
    return;
  }

  return servers[typeof baseUrl === 'number' ? baseUrl : 0]?.url;
};

export const createClient: PluginHandler = ({ plugin }) => {
  const clientModule = clientFolderAbsolutePath(getTypedConfig(plugin));
  const symbolCreateClient = plugin.symbol('createClient', {
    external: clientModule,
  });
  const symbolCreateConfig = plugin.symbol('createConfig', {
    external: clientModule,
  });
  const symbolClientOptions = plugin.referenceSymbol({
    category: 'type',
    resource: 'client',
    role: 'options',
  });

  const { runtimeConfigPath } = plugin.config;
  let resolvedRuntimeConfigPath: string | undefined;
  if (runtimeConfigPath) {
    const config = getTypedConfig(plugin);
    const outputPath = config.output.path;

    // If the path starts with './' or '/' (absolute or relative to CWD),
    // resolve it from the current working directory and make it relative to output
    if (runtimeConfigPath.startsWith('./') || path.isAbsolute(runtimeConfigPath)) {
      // Resolve the runtimeConfigPath from the current working directory
      const absoluteRuntimeConfigPath = path.resolve(process.cwd(), runtimeConfigPath);
      // Calculate the relative path from the output directory to the runtime config file
      resolvedRuntimeConfigPath = path.relative(outputPath, absoluteRuntimeConfigPath);
      // Ensure the path uses forward slashes and starts with ./ or ../
      resolvedRuntimeConfigPath = resolvedRuntimeConfigPath.split(path.sep).join('/');
      if (!resolvedRuntimeConfigPath.startsWith('.')) {
        resolvedRuntimeConfigPath = `./${resolvedRuntimeConfigPath}`;
      }
    } else {
      // Path is already relative to output (e.g., '../hey-api'), use it as-is
      resolvedRuntimeConfigPath = runtimeConfigPath;
    }
  }
  const symbolCreateClientConfig = resolvedRuntimeConfigPath
    ? plugin.symbol('createClientConfig', {
        external: resolvedRuntimeConfigPath,
      })
    : undefined;

  const defaultVals = $.object();

  const resolvedBaseUrl = resolveBaseUrlString({
    plugin: plugin as any,
  });
  if (resolvedBaseUrl) {
    const url = parseUrl(resolvedBaseUrl);
    if (url.protocol && url.host && !resolvedBaseUrl.includes('{')) {
      defaultVals.prop(getClientBaseUrlKey(getTypedConfig(plugin)), $.literal(resolvedBaseUrl));
    } else if (resolvedBaseUrl !== '/' && resolvedBaseUrl.startsWith('/')) {
      const baseUrl = resolvedBaseUrl.endsWith('/')
        ? resolvedBaseUrl.slice(0, -1)
        : resolvedBaseUrl;
      defaultVals.prop(getClientBaseUrlKey(getTypedConfig(plugin)), $.literal(baseUrl));
    }
  }

  if ('throwOnError' in plugin.config && plugin.config.throwOnError) {
    defaultVals.prop('throwOnError', $.literal(true));
  }

  const createConfigParameters = [
    $(symbolCreateConfig)
      .call(defaultVals.hasProps() ? defaultVals : undefined)
      .generic(symbolClientOptions),
  ];

  const symbolClient = plugin.symbol('client', {
    meta: {
      category: 'client',
    },
  });
  const statement = $.const(symbolClient)
    .export()
    .assign(
      $(symbolCreateClient).$if(
        symbolCreateClientConfig,
        (c, s) => c.call($(s).call(...createConfigParameters)),
        (c) => c.call(...createConfigParameters),
      ),
    );
  plugin.node(statement);
};

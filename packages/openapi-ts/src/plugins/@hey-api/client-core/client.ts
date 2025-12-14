import { clientFolderAbsolutePath } from '~/generate/client';
import { $ } from '~/ts-dsl';
import { parseUrl } from '~/utils/url';

import type { PluginHandler } from './types';
import { getClientBaseUrlKey } from './utils';

const resolveBaseUrlString = ({
  plugin,
}: Parameters<PluginHandler>[0]): string | undefined => {
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
  const clientModule = clientFolderAbsolutePath(plugin.context.config);
  const symbolCreateClient = plugin.registerSymbol({
    external: clientModule,
    name: 'createClient',
  });
  const symbolCreateConfig = plugin.registerSymbol({
    external: clientModule,
    name: 'createConfig',
  });
  const symbolClientOptions = plugin.referenceSymbol({
    category: 'type',
    resource: 'client',
    role: 'options',
  });

  const { runtimeConfigPath } = plugin.config;
  const symbolCreateClientConfig = runtimeConfigPath
    ? plugin.registerSymbol({
        external: runtimeConfigPath,
        name: 'createClientConfig',
      })
    : undefined;

  const defaultVals = $.object();

  const resolvedBaseUrl = resolveBaseUrlString({
    plugin: plugin as any,
  });
  if (resolvedBaseUrl) {
    const url = parseUrl(resolvedBaseUrl);
    if (url.protocol && url.host && !resolvedBaseUrl.includes('{')) {
      defaultVals.prop(
        getClientBaseUrlKey(plugin.context.config),
        $.literal(resolvedBaseUrl),
      );
    } else if (resolvedBaseUrl !== '/' && resolvedBaseUrl.startsWith('/')) {
      const baseUrl = resolvedBaseUrl.endsWith('/')
        ? resolvedBaseUrl.slice(0, -1)
        : resolvedBaseUrl;
      defaultVals.prop(
        getClientBaseUrlKey(plugin.context.config),
        $.literal(baseUrl),
      );
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

  const symbolClient = plugin.registerSymbol({
    meta: {
      category: 'client',
    },
    name: 'client',
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

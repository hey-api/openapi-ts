import { clientFolderAbsolutePath } from '~/generate/client';
import { tsc } from '~/tsc';
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
  const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');
  const symbolClientOptions = plugin.referenceSymbol(
    pluginTypeScript.api.selector('ClientOptions'),
  );

  const { runtimeConfigPath } = plugin.config;
  const symbolCreateClientConfig = runtimeConfigPath
    ? plugin.registerSymbol({
        external: runtimeConfigPath,
        name: 'createClientConfig',
      })
    : undefined;

  const defaultValues: Array<unknown> = [];

  const resolvedBaseUrl = resolveBaseUrlString({
    plugin: plugin as any,
  });
  if (resolvedBaseUrl) {
    const url = parseUrl(resolvedBaseUrl);
    if (url.protocol && url.host && !resolvedBaseUrl.includes('{')) {
      defaultValues.push({
        key: getClientBaseUrlKey(plugin.context.config),
        value: resolvedBaseUrl,
      });
    } else if (resolvedBaseUrl !== '/' && resolvedBaseUrl.startsWith('/')) {
      const baseUrl = resolvedBaseUrl.endsWith('/')
        ? resolvedBaseUrl.slice(0, -1)
        : resolvedBaseUrl;
      defaultValues.push({
        key: getClientBaseUrlKey(plugin.context.config),
        value: baseUrl,
      });
    }
  }

  if ('throwOnError' in plugin.config && plugin.config.throwOnError) {
    defaultValues.push({
      key: 'throwOnError',
      value: true,
    });
  }

  const createConfigParameters = [
    tsc.callExpression({
      functionName: symbolCreateConfig.placeholder,
      parameters: defaultValues.length
        ? [tsc.objectExpression({ obj: defaultValues })]
        : undefined,
      types: [
        tsc.typeReferenceNode({ typeName: symbolClientOptions.placeholder }),
      ],
    }),
  ];

  const symbolClient = plugin.registerSymbol({
    meta: {
      path: [],
    },
    name: 'client',
    selector: plugin.api.selector('client'),
  });
  const statement = tsc.constVariable({
    exportConst: true,
    expression: tsc.callExpression({
      functionName: symbolCreateClient.placeholder,
      parameters: symbolCreateClientConfig
        ? [
            tsc.callExpression({
              functionName: symbolCreateClientConfig.placeholder,
              parameters: createConfigParameters,
            }),
          ]
        : createConfigParameters,
    }),
    name: symbolClient.placeholder,
  });
  plugin.setSymbolValue(symbolClient, statement);
};

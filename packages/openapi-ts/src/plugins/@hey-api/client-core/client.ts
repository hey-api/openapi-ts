import { compiler } from '../../../compiler';
import { clientModulePath } from '../../../generate/client';
import { parseUrl } from '../../../utils/url';
import { typesId } from '../typescript/ref';
import type { PluginHandler } from './types';
import { clientId, getClientBaseUrlKey } from './utils';

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

export const createClient = ({ plugin }: Parameters<PluginHandler>[0]) => {
  const file = plugin.context.file({ id: clientId })!;

  const clientModule = clientModulePath({
    config: plugin.context.config,
    sourceOutput: file.nameWithoutExtension(),
  });
  const createClient = file.import({
    module: clientModule,
    name: 'createClient',
  });
  const createConfig = file.import({
    module: clientModule,
    name: 'createConfig',
  });
  const clientOptions = file.import({
    asType: true,
    module: file.relativePathToFile({ context: plugin.context, id: typesId }),
    name: 'ClientOptions',
  });

  const createClientConfig = plugin.config.runtimeConfigPath
    ? file.import({
        module: file.relativePathToFile({
          context: plugin.context,
          id: plugin.config.runtimeConfigPath,
        }),
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
    compiler.callExpression({
      functionName: createConfig.name,
      parameters: defaultValues.length
        ? [compiler.objectExpression({ obj: defaultValues })]
        : undefined,
      types: [compiler.typeReferenceNode({ typeName: clientOptions.name })],
    }),
  ];

  const statement = compiler.constVariable({
    exportConst: true,
    expression: compiler.callExpression({
      functionName: createClient.name,
      parameters: createClientConfig
        ? [
            compiler.callExpression({
              functionName: createClientConfig.name,
              parameters: createConfigParameters,
            }),
          ]
        : createConfigParameters,
    }),
    name: 'client',
  });
  file.add(statement);
};

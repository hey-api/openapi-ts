import { compiler } from '../../../compiler';
import { clientModulePath } from '../../../generate/client';
import { parseUrl } from '../../../utils/url';
import { clientId, getClientBaseUrlKey } from '../client-core/utils';
import { typesId } from '../typescript/ref';
import type { PluginHandler } from './types';

const resolveBaseUrlString: PluginHandler<string | undefined> = ({
  context,
  plugin,
}) => {
  const { baseUrl } = plugin;

  if (baseUrl === false) {
    return;
  }

  if (typeof baseUrl === 'string') {
    return baseUrl;
  }

  const { servers } = context.ir;

  if (!servers) {
    return;
  }

  return servers[typeof baseUrl === 'number' ? baseUrl : 0]?.url;
};

export const createClient: PluginHandler = ({ context, plugin }) => {
  const file = context.file({ id: clientId })!;

  const clientModule = clientModulePath({
    config: context.config,
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
    module: file.relativePathToFile({ context, id: typesId }),
    name: 'ClientOptions',
  });

  const createClientConfig = plugin.runtimeConfigPath
    ? file.import({
        module: file.relativePathToFile({
          context,
          id: plugin.runtimeConfigPath,
        }),
        name: 'createClientConfig',
      })
    : undefined;

  const defaultValues: Array<unknown> = [];

  const resolvedBaseUrl = resolveBaseUrlString({ context, plugin });
  if (resolvedBaseUrl) {
    const url = parseUrl(resolvedBaseUrl);
    if (url.protocol && url.host && !resolvedBaseUrl.includes('{')) {
      defaultValues.push({
        key: getClientBaseUrlKey(context.config),
        value: resolvedBaseUrl,
      });
    }
  }

  if ('throwOnError' in plugin && plugin.throwOnError) {
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

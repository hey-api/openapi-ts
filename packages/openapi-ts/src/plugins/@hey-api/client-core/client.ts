import type { ICodegenSymbolOut } from '@hey-api/codegen-core';

import { clientModulePath } from '../../../generate/client';
import { tsc } from '../../../tsc';
import { parseUrl } from '../../../utils/url';
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
  const f = plugin.gen.ensureFile(plugin.output);

  const clientModule = clientModulePath({
    config: plugin.context.config,
    sourceOutput: f.path,
  });
  const symbolCreateClient = f.addSymbol({ name: 'createClient' });
  f.addImport({
    aliases: {
      [symbolCreateClient.name]: symbolCreateClient.placeholder,
    },
    from: clientModule,
    names: [symbolCreateClient.name],
  });
  const symbolCreateConfig = f.addSymbol({ name: 'createConfig' });
  f.addImport({
    aliases: {
      [symbolCreateConfig.name]: symbolCreateConfig.placeholder,
    },
    from: clientModule,
    names: [symbolCreateConfig.name],
  });
  const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');
  const symbolClientOptions = plugin.gen.selectSymbolFirstOrThrow(
    pluginTypeScript.api.getSelector('ClientOptions'),
  );
  f.addImport({
    from: symbolClientOptions.file,
    typeNames: [symbolClientOptions.placeholder],
  });

  let symbolCreateClientConfig: ICodegenSymbolOut | undefined;
  if (plugin.config.runtimeConfigPath) {
    symbolCreateClientConfig = f.addSymbol({ name: 'createClientConfig' });
    f.addImport({
      from: f.relativePathToFile({ path: plugin.config.runtimeConfigPath }),
      names: [symbolCreateClientConfig.placeholder],
    });
  }

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

  // Set default clientCase from output.case so responses map to generated types
  const clientCase = plugin.context.config.output.case;
  if (clientCase) {
    defaultValues.push({
      key: 'clientCase',
      value: clientCase,
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

  const symbolClient = f.addSymbol({
    name: 'client',
    selector: plugin.api.getSelector('client'),
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
  symbolClient.update({ value: statement });
};

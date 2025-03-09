import { compiler } from '../../../compiler';
import { clientModulePath } from '../../../generate/client';
import type { PluginHandler } from '../client-core/types';
import { clientId } from '../client-core/utils';

export const handler: PluginHandler = ({ context, plugin }) => {
  const file = context.createFile({
    exportFromIndex: plugin.exportFromIndex,
    id: clientId,
    path: plugin.output,
  });
  const clientOutput = file.nameWithoutExtension();

  const clientModule = clientModulePath({
    config: context.config,
    sourceOutput: clientOutput,
  });
  const createClient = file.import({
    module: clientModule,
    name: 'createClient',
  });
  const createConfig = file.import({
    module: clientModule,
    name: 'createConfig',
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

  const createConfigParameters = [
    compiler.callExpression({
      functionName: createConfig.name,
      parameters: [
        'throwOnError' in plugin && plugin.throwOnError
          ? compiler.objectExpression({
              obj: [
                {
                  key: 'throwOnError',
                  value: true,
                },
              ],
            })
          : undefined,
      ],
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

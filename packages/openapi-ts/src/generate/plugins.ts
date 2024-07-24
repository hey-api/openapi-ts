import { compiler, TypeScriptFile } from '../compiler';
import type { Operation } from '../openApi';
import type { Client } from '../types/client';
import type { Files } from '../types/utils';
import { getConfig } from '../utils/config';
import { toOperationName } from './services';

const toQueryOptionsName = (operation: Operation) =>
  `${toOperationName(operation, false)}Options`;

export const generatePlugins = async ({
  client,
  files,
}: {
  client: Client;
  files: Files;
}) => {
  const config = getConfig();

  for (const plugin of config.plugins) {
    files[plugin.name] = new TypeScriptFile({
      dir: config.output.path,
      name: `${plugin.output}.ts`,
    });

    if (plugin.name === '@tanstack/react-query') {
      const queryOptionsId = 'queryOptions';

      let importsServices: Parameters<
        TypeScriptFile['addImport']
      >[0]['imports'] = [];
      let importsTanStackQuery: Parameters<
        TypeScriptFile['addImport']
      >[0]['imports'] = [];

      for (const service of client.services) {
        for (const operation of service.operations) {
          const queryFn = toOperationName(operation, true);

          const expression = compiler.types.function({
            // TODO: parameters. Probably want to copy options from service call,
            // then inside the queryOptions function split them into request parameters
            // and client options. Request parameters will go into query key, the rest will
            // go only to the query function. We also need to ensure the service method
            // returns only data and throws on error
            parameters: [],
            statements: [
              compiler.return.functionCall({
                args: [
                  compiler.types.object({
                    identifiers: ['queryFn'],
                    obj: [
                      {
                        key: 'queryFn',
                        value: queryFn,
                      },
                      {
                        key: 'queryKey',
                        // TODO: queryKey strategy
                        value: ['foo'],
                      },
                    ],
                  }),
                ],
                name: queryOptionsId,
              }),
            ],
          });
          const statement = compiler.export.const({
            expression,
            name: toQueryOptionsName(operation),
          });
          files[plugin.name].add(statement);

          if (!importsTanStackQuery.includes(queryOptionsId)) {
            importsTanStackQuery = [...importsTanStackQuery, queryOptionsId];
          }

          if (!importsServices.includes(queryFn)) {
            importsServices = [...importsServices, queryFn];
          }
        }
      }

      if (importsTanStackQuery.length) {
        files[plugin.name].addImport({
          imports: importsTanStackQuery,
          module: '@tanstack/react-query',
        });
      }

      if (importsServices.length) {
        files[plugin.name].addImport({
          imports: importsServices,
          module: `./${files.services.getName(false)}`,
        });
      }
    }
  }
};

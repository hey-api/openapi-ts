import { compiler, TypeScriptFile } from '../compiler';
import type { Operation } from '../openApi';
import { isOperationParameterRequired } from '../openApi/common/parser/operation';
import type { Client } from '../types/client';
import type { Files } from '../types/utils';
import { getConfig, isStandaloneClient } from '../utils/config';
import { setUniqueTypeName } from '../utils/type';
import { unique } from '../utils/unique';
import { clientModulePath, clientOptionsTypeName } from './client';
import {
  generateImport,
  operationDataTypeName,
  operationOptionsType,
  toOperationName,
} from './services';

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

  const isStandalone = isStandaloneClient(config);

  if (!isStandalone) {
    // plugins work only with standalone clients
    return;
  }

  for (const plugin of config.plugins) {
    files[plugin.name] = new TypeScriptFile({
      dir: config.output.path,
      name: `${plugin.output}.ts`,
    });

    if (plugin.name === '@tanstack/react-query') {
      files[plugin.name].addImport({
        imports: [
          {
            asType: true,
            name: clientOptionsTypeName(),
          },
        ],
        module: clientModulePath(),
      });

      let imports: string[] = [];

      const queryOptionsId = 'queryOptions';

      let importsServices: Parameters<
        TypeScriptFile['addImport']
      >[0]['imports'] = [];
      let importsTanStackQuery: Parameters<
        TypeScriptFile['addImport']
      >[0]['imports'] = [];

      for (const service of client.services) {
        for (const operation of service.operations) {
          if (operation.parameters.length) {
            generateImport({
              client,
              meta: {
                // TODO: this should be exact ref to operation for consistency,
                // but name should work too as operation ID is unique
                $ref: operation.name,
                name: operation.name,
              },
              nameTransformer: operationDataTypeName,
              onImport: (imported) => {
                imports = [...imports, imported];
              },
            });
          }

          const queryFn = toOperationName(operation, true);

          const awaitServiceExpression = compiler.awaitExpression({
            expression: compiler.callExpression({
              functionName: queryFn,
              parameters: [
                compiler.objectExpression({
                  multiLine: true,
                  obj: [
                    {
                      spread: 'queryKey[0].params',
                    },
                    {
                      key: 'throwOnError',
                      value: true,
                    },
                  ],
                }),
              ],
            }),
          });

          const { name: importedType } = setUniqueTypeName({
            client,
            meta: {
              // TODO: this should be exact ref to operation for consistency,
              // but name should work too as operation ID is unique
              $ref: operation.name,
              name: operation.name,
            },
            nameTransformer: operationDataTypeName,
          });

          const queryFnArrowFunction = compiler.types.arrowFunction({
            async: true,
            multiLine: true,
            parameters: [
              {
                destructure: true,
                name: 'queryKey',
              },
            ],
            statements: [
              compiler.constVariable({
                destructure: true,
                expression: awaitServiceExpression,
                name: 'data',
              }),
              compiler.returnVariable({
                name: 'data',
              }),
            ],
          });

          const isRequired = isOperationParameterRequired(operation.parameters);

          const expression = compiler.types.arrowFunction({
            parameters: [
              {
                isRequired,
                name: 'options',
                type: operationOptionsType(importedType),
              },
              {
                isRequired: false,
                name: 'queryOpts',
                type: 'object',
              },
            ],
            statements: [
              compiler.return.functionCall({
                args: [
                  compiler.objectExpression({
                    obj: [
                      {
                        spread: 'queryOpts',
                      },
                      {
                        key: 'queryFn',
                        value: queryFnArrowFunction,
                      },
                      {
                        key: 'queryKey',
                        // TODO: queryKey strategy
                        value: compiler.arrayLiteralExpression({
                          elements: [
                            compiler.objectExpression({
                              obj: [
                                {
                                  key: 'scope',
                                  value: operation.name,
                                },
                                {
                                  key: 'params',
                                  value: compiler.objectExpression({
                                    obj: [
                                      {
                                        isValueAccess: true,
                                        key: 'body',
                                        value: isRequired
                                          ? 'options.body'
                                          : 'options?.body',
                                      },
                                      {
                                        isValueAccess: true,
                                        key: 'headers',
                                        value: isRequired
                                          ? 'options.headers'
                                          : 'options?.headers',
                                      },
                                      {
                                        isValueAccess: true,
                                        key: 'path',
                                        value: isRequired
                                          ? 'options.path'
                                          : 'options?.path',
                                      },
                                      {
                                        isValueAccess: true,
                                        key: 'query',
                                        value: isRequired
                                          ? 'options.query'
                                          : 'options?.query',
                                      },
                                    ],
                                  }),
                                },
                              ],
                            }),
                          ],
                        }),
                      },
                    ],
                  }),
                ],
                name: queryOptionsId,
              }),
            ],
          });
          const statement = compiler.constVariable({
            comment: [
              'TODO: describe arguments, options is Hey API, queryOpts is TanStack Query',
            ],
            exportConst: true,
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

      if (importsServices.length && files.services) {
        files[plugin.name].addImport({
          imports: importsServices,
          module: `./${files.services.getName(false)}`,
        });
      }

      if (files.types && !files.types.isEmpty()) {
        const importedTypes = imports.filter(unique).map((name) => ({
          asType: true,
          name,
        }));
        if (importedTypes.length) {
          files[plugin.name].addImport({
            imports: importedTypes,
            module: `./${files.types.getName(false)}`,
          });
        }
      }
    }
  }
};

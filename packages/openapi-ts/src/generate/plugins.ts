import path from 'node:path';

import { compiler, TypeScriptFile } from '../compiler';
import type { ImportExportItem } from '../compiler/module';
import type { ImportExportItemObject } from '../compiler/utils';
import type { Operation } from '../openApi';
import { Method } from '../openApi/common/interfaces/client';
import { isOperationParameterRequired } from '../openApi/common/parser/operation';
import type { Client } from '../types/client';
import type { Files } from '../types/utils';
import { getConfig, isStandaloneClient } from '../utils/config';
import { unique } from '../utils/unique';
import { clientModulePath, clientOptionsTypeName } from './client';
import {
  generateImport,
  operationDataTypeName,
  operationErrorTypeName,
  operationOptionsType,
  operationResponseTypeName,
  toOperationName,
} from './services';

const toMutationOptionsName = (operation: Operation) =>
  `${toOperationName(operation, false)}Mutation`;

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
    const outputParts = plugin.output.split('/');
    const outputDir = path.resolve(
      config.output.path,
      ...outputParts.slice(0, outputParts.length - 1),
    );
    files[plugin.name] = new TypeScriptFile({
      dir: outputDir,
      name: `${outputParts[outputParts.length - 1]}.ts`,
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

      let importsServices: ImportExportItem[] = [];

      // TODO: `addTanStackQueryImport()` should be a method of file class to create
      // unique imports. It could be made more performant too
      let importsTanStackQuery: ImportExportItemObject[] = [];
      const addTanStackQueryImport = (imported: ImportExportItem) => {
        const importedItem: ImportExportItemObject =
          typeof imported === 'string'
            ? {
                name: imported,
              }
            : imported;
        if (
          importsTanStackQuery.every((item) => item.name !== importedItem.name)
        ) {
          importsTanStackQuery = [...importsTanStackQuery, importedItem];
        }
      };

      for (const service of client.services) {
        for (const operation of service.operations) {
          const { name: nameTypeData } = generateImport({
            client,
            meta: operation.parameters.length
              ? {
                  // TODO: this should be exact ref to operation for consistency,
                  // but name should work too as operation ID is unique
                  $ref: operation.name,
                  name: operation.name,
                }
              : undefined,
            nameTransformer: operationDataTypeName,
            onImport: (imported) => {
              imports = [...imports, imported];
            },
          });

          const queryFn = toOperationName(operation, true);

          const isRequired = isOperationParameterRequired(operation.parameters);
          const typeOptions = operationOptionsType(nameTypeData);

          const expression = compiler.types.arrowFunction({
            parameters: [
              {
                isRequired,
                name: 'options',
                type: typeOptions,
              },
            ],
            statements: [
              compiler.return.functionCall({
                args: [
                  compiler.objectExpression({
                    obj: [
                      {
                        key: 'queryFn',
                        value: compiler.types.arrowFunction({
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
                              expression: compiler.awaitExpression({
                                expression: compiler.callExpression({
                                  functionName: queryFn,
                                  parameters: [
                                    compiler.objectExpression({
                                      multiLine: true,
                                      obj: [
                                        {
                                          spread: 'options',
                                        },
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
                              }),
                              name: 'data',
                            }),
                            compiler.returnVariable({
                              name: 'data',
                            }),
                          ],
                        }),
                      },
                      {
                        key: 'queryKey',
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
            // TODO: describe options, same as the actual function call
            comment: [],
            exportConst: true,
            expression,
            name: toQueryOptionsName(operation),
          });
          files[plugin.name].add(statement);

          if (
            plugin.mutationOptions &&
            (
              ['DELETE', 'PATCH', 'POST', 'PUT'] as ReadonlyArray<Method>
            ).includes(operation.method)
          ) {
            addTanStackQueryImport({
              asType: true,
              name: 'UseMutationOptions',
            });

            const { name: nameTypeError } = generateImport({
              client,
              meta: {
                // TODO: this should be exact ref to operation for consistency,
                // but name should work too as operation ID is unique
                $ref: operation.name,
                name: operation.name,
              },
              nameTransformer: operationErrorTypeName,
              onImport: (imported) => {
                imports = [...imports, imported];
              },
            });

            let typeError: ImportExportItem = nameTypeError;
            if (!typeError) {
              typeError = {
                asType: true,
                name: 'DefaultError',
              };
              addTanStackQueryImport(typeError);
            }

            const { name: nameTypeResponse } = generateImport({
              client,
              meta: {
                // TODO: this should be exact ref to operation for consistency,
                // but name should work too as operation ID is unique
                $ref: operation.name,
                name: operation.name,
              },
              nameTransformer: operationResponseTypeName,
              onImport: (imported) => {
                imports = [...imports, imported];
              },
            });

            const typeResponse = nameTypeResponse || 'void';

            const statement = compiler.constVariable({
              // TODO: describe options, same as the actual function call
              comment: [],
              exportConst: true,
              expression: compiler.objectExpression({
                obj: [
                  {
                    key: 'mutationFn',
                    value: compiler.types.arrowFunction({
                      async: true,
                      multiLine: true,
                      parameters: [
                        {
                          name: 'options',
                        },
                      ],
                      statements: [
                        compiler.constVariable({
                          destructure: true,
                          expression: compiler.awaitExpression({
                            expression: compiler.callExpression({
                              functionName: queryFn,
                              parameters: [
                                compiler.objectExpression({
                                  multiLine: true,
                                  obj: [
                                    {
                                      spread: 'options',
                                    },
                                    {
                                      key: 'throwOnError',
                                      value: true,
                                    },
                                  ],
                                }),
                              ],
                            }),
                          }),
                          name: 'data',
                        }),
                        compiler.returnVariable({
                          name: 'data',
                        }),
                      ],
                    }),
                  },
                ],
              }),
              name: toMutationOptionsName(operation),
              // TODO: better types syntax
              typeName: `UseMutationOptions<${typeResponse}, ${typeof typeError === 'string' ? typeError : typeError.name}, ${typeOptions}>`,
            });
            files[plugin.name].add(statement);
          }

          addTanStackQueryImport(queryOptionsId);

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

      const relativePath =
        new Array(outputParts.length).fill('').join('../') || './';

      if (importsServices.length && files.services) {
        files[plugin.name].addImport({
          imports: importsServices,
          module: relativePath + files.services.getName(false),
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
            module: relativePath + files.types.getName(false),
          });
        }
      }
    }
  }
};

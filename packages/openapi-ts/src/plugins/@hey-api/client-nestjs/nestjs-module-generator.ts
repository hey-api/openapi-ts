import { tsc } from '../../../tsc';
import type { HeyApiClientNestjsPlugin } from './types';
import {
  createClientClassName,
  createClientConfigToken,
  createModuleClassName,
  getClientName,
} from './utils';

/**
 * Service group information for module generation
 */
interface ServiceGroup {
  className: string;
  tag: string;
}

/**
 * Generates the main NestJS module that ties everything together
 */
export const generateNestjsModule = ({
  plugin,
  serviceGroups,
}: {
  plugin: Parameters<HeyApiClientNestjsPlugin['Handler']>[0]['plugin'];
  serviceGroups: Map<string, ServiceGroup>;
}) => {
  const clientName = getClientName(plugin.config);
  const moduleClassName =
    plugin.config.moduleName || createModuleClassName(clientName);
  const clientClassName =
    plugin.config.clientClassName || createClientClassName(clientName);
  const configToken = createClientConfigToken(clientName);

  // Create the module file
  const file = plugin.createFile({
    id: 'nestjs-module',
    path: `${plugin.output}/${clientName.toLowerCase()}.module`,
  });

  // Add imports
  const nestjsImport = tsc.namedImportDeclarations({
    imports: ['Module', 'DynamicModule'],
    module: '@nestjs/common',
  });
  file.add(nestjsImport);

  const typesImport = tsc.namedImportDeclarations({
    imports: [
      { asType: true, name: 'ClientModuleConfig' },
      { asType: true, name: 'ClientModuleAsyncConfig' },
    ],
    module: './types.gen',
  });
  file.add(typesImport);

  const clientImport = tsc.namedImportDeclarations({
    imports: [clientClassName],
    module: `./${clientName.toLowerCase()}-client.service.gen`,
  });
  file.add(clientImport);

  // Add service imports
  for (const group of serviceGroups.values()) {
    const serviceImport = tsc.namedImportDeclarations({
      imports: [group.className],
      module: `./services/${clientName.toLowerCase()}-${group.tag.toLowerCase()}.service.gen`,
    });
    file.add(serviceImport);
  }

  // Create providers array with all services and client
  const allServices = [
    clientClassName,
    ...Array.from(serviceGroups.values()).map((group) => group.className),
  ];

  // Create the forRoot static method
  const forRootMethod = tsc.methodDeclaration({
    accessLevel: 'public',
    isStatic: true,
    name: 'forRoot',
    parameters: [
      {
        name: 'config',
        type: tsc.typeReferenceNode({ typeName: 'ClientModuleConfig' }),
      },
    ],
    returnType: tsc.typeReferenceNode({ typeName: 'DynamicModule' }),
    statements: [
      tsc.returnStatement({
        expression: tsc.objectExpression({
          obj: [
            {
              key: 'module',
              value: tsc.identifier({ text: moduleClassName }),
            },
            {
              key: 'providers',
              value: tsc.arrayLiteralExpression({
                elements: [
                  // Config provider
                  tsc.objectExpression({
                    obj: [
                      {
                        key: 'provide',
                        value: tsc.stringLiteral({ text: configToken }),
                      },
                      {
                        key: 'useValue',
                        value: tsc.identifier({ text: 'config' }),
                      },
                    ],
                  }),
                  // All service providers
                  ...allServices.map((serviceName) =>
                    tsc.identifier({ text: serviceName }),
                  ),
                ],
              }),
            },
            {
              key: 'exports',
              value: tsc.arrayLiteralExpression({
                elements: allServices.map((serviceName) =>
                  tsc.identifier({ text: serviceName }),
                ),
              }),
            },
          ],
        }),
      }),
    ],
  });

  // Create the forRootAsync static method
  const forRootAsyncMethod = tsc.methodDeclaration({
    accessLevel: 'public',
    isStatic: true,
    name: 'forRootAsync',
    parameters: [
      {
        name: 'options',
        type: tsc.typeReferenceNode({ typeName: 'ClientModuleAsyncConfig' }),
      },
    ],
    returnType: tsc.typeReferenceNode({ typeName: 'DynamicModule' }),
    statements: [
      tsc.returnStatement({
        expression: tsc.objectExpression({
          obj: [
            {
              key: 'module',
              value: tsc.identifier({ text: moduleClassName }),
            },
            {
              key: 'imports',
              value: tsc.conditionalExpression({
                condition: tsc.propertyAccessExpression({
                  expression: tsc.identifier({ text: 'options' }),
                  name: tsc.identifier({ text: 'imports' }),
                }),
                whenFalse: tsc.arrayLiteralExpression({ elements: [] }),
                whenTrue: tsc.propertyAccessExpression({
                  expression: tsc.identifier({ text: 'options' }),
                  name: tsc.identifier({ text: 'imports' }),
                }),
              }),
            },
            {
              key: 'providers',
              value: tsc.arrayLiteralExpression({
                elements: [
                  // Async config provider
                  tsc.objectExpression({
                    obj: [
                      {
                        key: 'provide',
                        value: tsc.stringLiteral({ text: configToken }),
                      },
                      {
                        key: 'useFactory',
                        value: tsc.conditionalExpression({
                          condition: tsc.propertyAccessExpression({
                            expression: tsc.identifier({ text: 'options' }),
                            name: tsc.identifier({ text: 'useFactory' }),
                          }),
                          whenFalse: tsc.arrowFunction({
                            parameters: [],
                            returnType: 'ClientModuleConfig',
                            statements: [
                              tsc.returnStatement({
                                expression: tsc.objectExpression({ obj: [] }),
                              }),
                            ],
                          }),
                          whenTrue: tsc.propertyAccessExpression({
                            expression: tsc.identifier({ text: 'options' }),
                            name: tsc.identifier({ text: 'useFactory' }),
                          }),
                        }),
                      },
                      {
                        key: 'inject',
                        value: tsc.conditionalExpression({
                          condition: tsc.propertyAccessExpression({
                            expression: tsc.identifier({ text: 'options' }),
                            name: tsc.identifier({ text: 'inject' }),
                          }),
                          whenFalse: tsc.arrayLiteralExpression({
                            elements: [],
                          }),
                          whenTrue: tsc.propertyAccessExpression({
                            expression: tsc.identifier({ text: 'options' }),
                            name: tsc.identifier({ text: 'inject' }),
                          }),
                        }),
                      },
                    ],
                  }),
                  // All service providers
                  ...allServices.map((serviceName) =>
                    tsc.identifier({ text: serviceName }),
                  ),
                ],
              }),
            },
            {
              key: 'exports',
              value: tsc.arrayLiteralExpression({
                elements: allServices.map((serviceName) =>
                  tsc.identifier({ text: serviceName }),
                ),
              }),
            },
          ],
        }),
      }),
    ],
  });

  // Create the module class
  const moduleClass = tsc.classDeclaration({
    decorator: {
      args: [{}],
      name: 'Module',
    },
    exportClass: true,
    name: moduleClassName,
    nodes: [forRootMethod, forRootAsyncMethod],
  });

  file.add(moduleClass);

  return moduleClassName;
};

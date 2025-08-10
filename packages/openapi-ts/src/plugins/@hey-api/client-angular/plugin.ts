import { tsc } from '../../../tsc';
import { stringCase } from '../../../utils/stringCase';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '../../shared/utils/operation';
import { clientPluginHandler } from '../client-core/plugin';
import { operationClasses } from '../sdk/operation';
import { serviceFunctionIdentifier } from '../sdk/plugin-legacy';
import { typesId } from '../typescript/ref';
import type { HeyApiClientAngularPlugin } from './types';

export const angularClientPluginHandler: HeyApiClientAngularPlugin['Handler'] =
  (args) => {
    // First, run the standard client plugin handler to create/copy the client
    clientPluginHandler(args);

    const { plugin } = args;

    // Check if SDK plugin exists and if we should generate class-based services
    const sdkPlugin = plugin.getPlugin('@hey-api/sdk');
    if (!sdkPlugin) {
      return;
    }

    // Now create our Angular-specific httpResource file
    const file = plugin.createFile({
      id: 'httpResource',
      path: plugin.output + '.resource',
    });

    // Import Angular core decorators and rxjs
    if (sdkPlugin.config.asClass) {
      file.import({
        module: '@angular/core',
        name: 'Injectable',
      });
    }

    file.import({
      module: '@angular/core',
      name: 'resource',
    });

    // Import types from the main types file if needed
    // const pluginTypeScript = plugin.getPlugin('@hey-api/typescript')!;
    // const fileTypeScript = plugin.context.file({ id: typesId })!;;

    if (sdkPlugin.config.asClass) {
      generateAngularClassServices({ file, plugin, sdkPlugin });
    } else {
      generateAngularFunctionServices({ file, plugin, sdkPlugin });
    }
  };

interface AngularServiceClassEntry {
  className: string;
  classes: Set<string>;
  methods: Set<string>;
  nodes: Array<any>;
  root: boolean;
}

const generateAngularClassServices = ({
  file,
  plugin,
  sdkPlugin,
}: {
  file: any;
  plugin: HeyApiClientAngularPlugin['Instance'];
  sdkPlugin: any;
}) => {
  const serviceClasses = new Map<string, AngularServiceClassEntry>();
  const generatedClasses = new Set<string>();

  // Iterate through operations to build class structure
  plugin.forEach('operation', ({ operation }) => {
    const isRequiredOptions = isOperationOptionsRequired({
      context: plugin.context,
      operation,
    });

    const classes = operationClasses({
      context: plugin.context,
      operation,
      plugin: sdkPlugin,
    });

    for (const entry of classes.values()) {
      entry.path.forEach((currentClassName, index) => {
        if (!serviceClasses.has(currentClassName)) {
          serviceClasses.set(currentClassName, {
            className: currentClassName,
            classes: new Set(),
            methods: new Set(),
            nodes: [],
            root: !index,
          });
        }

        const parentClassName = entry.path[index - 1];
        if (parentClassName && parentClassName !== currentClassName) {
          const parentClass = serviceClasses.get(parentClassName)!;
          parentClass.classes.add(currentClassName);
          serviceClasses.set(parentClassName, parentClass);
        }

        const isLast = entry.path.length === index + 1;
        if (!isLast) {
          return;
        }

        const currentClass = serviceClasses.get(currentClassName)!;

        // Avoid duplicate methods
        if (currentClass.methods.has(entry.methodName)) {
          return;
        }

        // Generate Angular resource method
        const methodNode = generateAngularResourceMethod({
          file,
          isRequiredOptions,
          methodName: entry.methodName,
          operation,
          plugin,
        });

        if (!currentClass.nodes.length) {
          currentClass.nodes.push(methodNode);
        } else {
          currentClass.nodes.push(tsc.identifier({ text: '\n' }), methodNode);
        }

        currentClass.methods.add(entry.methodName);
        serviceClasses.set(currentClassName, currentClass);
      });
    }
  });

  // Generate classes
  const generateClass = (currentClass: AngularServiceClassEntry) => {
    if (generatedClasses.has(currentClass.className)) {
      return;
    }

    // Handle child classes
    if (currentClass.classes.size) {
      for (const childClassName of currentClass.classes) {
        const childClass = serviceClasses.get(childClassName)!;
        generateClass(childClass);

        currentClass.nodes.push(
          tsc.propertyDeclaration({
            initializer: tsc.newExpression({
              argumentsArray: [],
              expression: tsc.identifier({
                text: `${childClass.className}Resource`,
              }),
            }),
            name: stringCase({
              case: 'camelCase',
              value: childClass.className,
            }),
          }),
        );
      }
    }

    const node = tsc.classDeclaration({
      decorator: currentClass.root
        ? {
            args: [
              {
                providedIn: 'root',
              },
            ],
            name: 'Injectable',
          }
        : undefined,
      exportClass: currentClass.root,
      name: `${currentClass.className}Resource`,
      nodes: currentClass.nodes,
    });

    file.add(node);
    generatedClasses.add(currentClass.className);
  };

  for (const serviceClass of serviceClasses.values()) {
    generateClass(serviceClass);
  }
};

const generateAngularFunctionServices = ({
  file,
  plugin,
  // sdkPlugin,
}: {
  file: any;
  plugin: HeyApiClientAngularPlugin['Instance'];
  sdkPlugin: any;
}) => {
  plugin.forEach('operation', ({ operation }) => {
    const isRequiredOptions = isOperationOptionsRequired({
      context: plugin.context,
      operation,
    });

    const functionName = serviceFunctionIdentifier({
      config: plugin.context.config,
      handleIllegal: true,
      id: operation.id,
      operation,
    });

    const node = generateAngularResourceFunction({
      file,
      functionName: `${functionName}Resource`,
      isRequiredOptions,
      operation,
      plugin,
    });

    file.add(node);
  });
};

const generateResourceCallExpression = () =>
  tsc.callExpression({
    functionName: 'resource',
    parameters: [
      tsc.objectExpression({
        obj: [
          {
            key: 'loader',
            value: tsc.arrowFunction({
              parameters: [],
              statements: [
                tsc.expressionToStatement({
                  expression: tsc.callExpression({
                    functionName: 'throw',
                    parameters: [
                      tsc.newExpression({
                        argumentsArray: [
                          tsc.stringLiteral({ text: 'Not implemented' }),
                        ],
                        expression: tsc.identifier({ text: 'Error' }),
                      }),
                    ],
                  }),
                }),
              ],
            }),
          },
          {
            key: 'params',
            value: tsc.arrowFunction({
              parameters: [],
              statements: [
                tsc.returnStatement({
                  expression: tsc.identifier({ text: 'options' }),
                }),
              ],
            }),
          },
        ],
      }),
    ],
  });

const generateAngularResourceMethod = ({
  file,
  isRequiredOptions,
  methodName,
  operation,
  plugin,
}: {
  file: any;
  isRequiredOptions: boolean;
  methodName: string;
  operation: any;
  plugin: any;
}) => {
  // Import operation data type
  const pluginTypeScript = plugin.getPlugin('@hey-api/typescript')!;
  const fileTypeScript = plugin.context.file({ id: typesId })!;
  const dataType = file.import({
    asType: true,
    module: file.relativePathToFile({ context: plugin.context, id: typesId }),
    name: fileTypeScript.getName(
      pluginTypeScript.api.getId({ operation, type: 'data' }),
    ),
  });

  return tsc.methodDeclaration({
    accessLevel: 'public',
    comment: createOperationComment({ operation }),
    isStatic: true,
    name: methodName,
    parameters: [
      {
        isRequired: isRequiredOptions,
        name: 'options',
        type: dataType.name ? `Omit<${dataType.name}, 'url'>` : 'unknown',
      },
    ],
    returnType: undefined,
    statements: [
      tsc.returnStatement({
        expression: generateResourceCallExpression(),
      }),
    ],
    types: [
      {
        default: false,
        extends: 'boolean',
        name: 'ThrowOnError',
      },
    ],
  });
};

const generateAngularResourceFunction = ({
  file,
  functionName,
  isRequiredOptions,
  operation,
  plugin,
}: {
  file: any;
  functionName: string;
  isRequiredOptions: boolean;
  operation: any;
  plugin: any;
}) => {
  const pluginTypeScript = plugin.getPlugin('@hey-api/typescript')!;
  const fileTypeScript = plugin.context.file({ id: typesId })!;
  const dataType = file.import({
    asType: true,
    module: file.relativePathToFile({ context: plugin.context, id: typesId }),
    name: fileTypeScript.getName(
      pluginTypeScript.api.getId({ operation, type: 'data' }),
    ),
  });

  return tsc.constVariable({
    comment: createOperationComment({ operation }),
    exportConst: true,
    expression: tsc.arrowFunction({
      parameters: [
        {
          isRequired: isRequiredOptions,
          name: 'options',
          type: dataType.name ? `Omit<${dataType.name}, 'url'>` : 'unknown',
        },
      ],
      statements: [
        tsc.returnStatement({
          expression: generateResourceCallExpression(),
        }),
      ],
      types: [
        {
          default: false,
          extends: 'boolean',
          name: 'ThrowOnError',
        },
      ],
    }),
    name: functionName,
  });
};

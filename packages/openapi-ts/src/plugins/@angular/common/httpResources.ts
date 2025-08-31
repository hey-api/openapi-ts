import ts from 'typescript';

import type { GeneratedFile } from '../../../generate/file';
import type { IR } from '../../../ir/types';
import { buildName } from '../../../openApi/shared/utils/name';
import { tsc } from '../../../tsc';
import { stringCase } from '../../../utils/stringCase';
import { sdkId } from '../../@hey-api/sdk/constants';
import { operationClasses } from '../../@hey-api/sdk/operation';
import { typesId } from '../../@hey-api/typescript/ref';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '../../shared/utils/operation';
import { REQUEST_APIS_SUFFIX, RESOURCE_APIS_SUFFIX } from './constants';
import type { AngularCommonPlugin } from './types';

// Helper function to create a variable statement
const createVariableStatement = (
  name: string,
  initializer: ts.Expression,
): ts.VariableStatement =>
  ts.factory.createVariableStatement(
    undefined,
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          name,
          undefined,
          undefined,
          initializer,
        ),
      ],
      ts.NodeFlags.Const,
    ),
  );

interface AngularServiceClassEntry {
  className: string;
  classes: Set<string>;
  methods: Set<string>;
  nodes: Array<ts.ClassElement>;
  root: boolean;
}

const generateAngularClassServices = ({
  file,
  plugin,
}: {
  file: GeneratedFile;
  plugin: AngularCommonPlugin['Instance'];
}) => {
  const serviceClasses = new Map<string, AngularServiceClassEntry>();
  const generatedClasses = new Set<string>();

  const sdkPlugin = plugin.getPlugin('@hey-api/sdk')!;

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

        // Generate the resource method name
        const resourceMethodName =
          plugin.config.httpResources.methodNameBuilder(operation);

        // Avoid duplicate methods
        if (currentClass.methods.has(resourceMethodName)) {
          return;
        }

        // Generate Angular resource method
        const methodNode = generateAngularResourceMethod({
          file,
          isRequiredOptions,
          methodName: resourceMethodName,
          operation,
          plugin,
        });

        if (!currentClass.nodes.length) {
          currentClass.nodes.push(methodNode);
        } else {
          // @ts-expect-error
          currentClass.nodes.push(tsc.identifier({ text: '\n' }), methodNode);
        }

        currentClass.methods.add(resourceMethodName);
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
                text: buildName({
                  config: {
                    case: 'preserve',
                    name: plugin.config.httpResources.classNameBuilder,
                  },
                  name: childClass.className,
                }),
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
      name: buildName({
        config: {
          case: 'preserve',
          name: plugin.config.httpResources.classNameBuilder,
        },
        name: currentClass.className,
      }),
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
}: {
  file: GeneratedFile;
  plugin: AngularCommonPlugin['Instance'];
}) => {
  plugin.forEach('operation', ({ operation }) => {
    const isRequiredOptions = isOperationOptionsRequired({
      context: plugin.context,
      operation,
    });

    const node = generateAngularResourceFunction({
      file,
      functionName: plugin.config.httpResources.methodNameBuilder(operation),
      isRequiredOptions,
      operation,
      plugin,
    });

    file.add(node);
  });
};

const generateResourceCallExpression = ({
  file,
  operation,
  plugin,
  responseTypeName,
}: {
  file: GeneratedFile;
  operation: IR.OperationObject;
  plugin: AngularCommonPlugin['Instance'];
  responseTypeName: string;
}) => {
  const sdkPlugin = plugin.getPlugin('@hey-api/sdk')!;

  // Check if httpRequest is configured to use classes
  const useRequestClasses = plugin.config.httpRequests.asClass;

  if (useRequestClasses) {
    // For class-based request methods, use inject and class hierarchy
    const classes = operationClasses({
      context: plugin.context,
      operation,
      plugin: sdkPlugin,
    });

    const firstEntry = Array.from(classes.values())[0];
    if (firstEntry) {
      // Import the root class from HTTP requests
      const rootClassName = firstEntry.path[0]!;
      const requestClassName = buildName({
        config: {
          case: 'preserve',
          name: plugin.config.httpRequests.classNameBuilder,
        },
        name: rootClassName,
      });

      // Build the method access path using inject
      let methodAccess: ts.Expression = tsc.callExpression({
        functionName: 'inject',
        parameters: [tsc.identifier({ text: requestClassName })],
      });

      // Navigate through the class hierarchy
      for (let i = 1; i < firstEntry.path.length; i++) {
        const className = firstEntry.path[i];
        if (className) {
          methodAccess = tsc.propertyAccessExpression({
            expression: methodAccess,
            name: stringCase({
              case: 'camelCase',
              value: className,
            }),
          });
        }
      }

      // Add the final method name with "Request" suffix
      const requestMethodName =
        plugin.config.httpRequests.methodNameBuilder(operation);
      methodAccess = tsc.propertyAccessExpression({
        expression: methodAccess,
        name: requestMethodName,
      });

      return tsc.callExpression({
        functionName: 'httpResource',
        parameters: [
          tsc.arrowFunction({
            parameters: [],
            statements: [
              createVariableStatement(
                'opts',
                tsc.conditionalExpression({
                  condition: tsc.identifier({ text: 'options' }),
                  whenFalse: tsc.identifier({ text: 'undefined' }),
                  whenTrue: tsc.callExpression({
                    functionName: 'options',
                    parameters: [],
                  }),
                }),
              ),
              tsc.returnStatement({
                expression: tsc.conditionalExpression({
                  condition: tsc.identifier({ text: 'opts' }),
                  whenFalse: tsc.identifier({ text: 'undefined' }),
                  whenTrue: tsc.callExpression({
                    functionName: methodAccess,
                    parameters: [tsc.identifier({ text: 'opts' })],
                  }),
                }),
              }),
            ],
          }),
        ],
        types: [tsc.typeNode(responseTypeName)],
      });
    }
  } else {
    // For function-based request methods, import and call the function directly
    const requestFunctionName =
      plugin.config.httpRequests.methodNameBuilder(operation);

    const requestImport = file.import({
      module: file.relativePathToFile({
        context: plugin.context,
        id: `${plugin.name}${REQUEST_APIS_SUFFIX}`,
      }),
      name: requestFunctionName,
    });

    return tsc.callExpression({
      functionName: 'httpResource',
      parameters: [
        tsc.arrowFunction({
          parameters: [],
          statements: [
            createVariableStatement(
              'opts',
              tsc.conditionalExpression({
                condition: tsc.identifier({ text: 'options' }),
                whenFalse: tsc.identifier({ text: 'undefined' }),
                whenTrue: tsc.callExpression({
                  functionName: 'options',
                  parameters: [],
                }),
              }),
            ),
            tsc.returnStatement({
              expression: tsc.conditionalExpression({
                condition: tsc.identifier({ text: 'opts' }),
                whenFalse: tsc.identifier({ text: 'undefined' }),
                whenTrue: tsc.callExpression({
                  functionName: requestImport.name,
                  parameters: [tsc.identifier({ text: 'opts' })],
                }),
              }),
            }),
          ],
        }),
      ],
      types: [tsc.typeNode(responseTypeName)],
    });
  }

  // Fallback return (should not reach here)
  return tsc.callExpression({
    functionName: 'httpResource',
    parameters: [
      tsc.arrowFunction({
        parameters: [],
        statements: [
          tsc.returnStatement({
            expression: tsc.identifier({ text: 'undefined' }),
          }),
        ],
      }),
    ],
    types: [tsc.typeNode(responseTypeName)],
  });
};

const generateAngularResourceMethod = ({
  file,
  isRequiredOptions,
  methodName,
  operation,
  plugin,
}: {
  file: GeneratedFile;
  isRequiredOptions: boolean;
  methodName: string;
  operation: IR.OperationObject;
  plugin: AngularCommonPlugin['Instance'];
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

  // Import operation response type
  const responseType = file.import({
    asType: true,
    module: file.relativePathToFile({ context: plugin.context, id: typesId }),
    name: fileTypeScript.getName(
      pluginTypeScript.api.getId({ operation, type: 'response' }),
    ),
  });

  return tsc.methodDeclaration({
    accessLevel: 'public',
    comment: createOperationComment({ operation }),
    // isStatic: true,
    name: methodName,
    parameters: [
      {
        isRequired: isRequiredOptions,
        name: 'options',
        type: `() => Options<${dataType.name || 'unknown'}, ThrowOnError> | undefined`,
      },
    ],
    returnType: undefined,
    statements: [
      tsc.returnStatement({
        expression: generateResourceCallExpression({
          file,
          operation,
          plugin,
          responseTypeName: responseType.name || 'unknown',
        }),
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
  file: GeneratedFile;
  functionName: string;
  isRequiredOptions: boolean;
  operation: IR.OperationObject;
  plugin: AngularCommonPlugin['Instance'];
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

  // Import operation response type
  const responseType = file.import({
    asType: true,
    module: file.relativePathToFile({ context: plugin.context, id: typesId }),
    name: fileTypeScript.getName(
      pluginTypeScript.api.getId({ operation, type: 'response' }),
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
          type: `() => Options<${dataType.name || 'unknown'}, ThrowOnError> | undefined`,
        },
      ],
      statements: [
        tsc.returnStatement({
          expression: generateResourceCallExpression({
            file,
            operation,
            plugin,
            responseTypeName: responseType.name || 'unknown',
          }),
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

export const createHttpResources: AngularCommonPlugin['Handler'] = ({
  plugin,
}) => {
  const file = plugin.createFile({
    id: `${plugin.name}${RESOURCE_APIS_SUFFIX}`,
    path: `${plugin.output}${RESOURCE_APIS_SUFFIX}`,
  });

  if (plugin.config.httpResources.asClass) {
    file.import({
      module: '@angular/core',
      name: 'Injectable',
    });
  }

  if (plugin.config.httpRequests.asClass) {
    file.import({
      module: '@angular/core',
      name: 'inject',
    });
  }

  file.import({
    module: '@angular/common/http',
    name: 'httpResource',
  });

  file.import({
    module: file.relativePathToFile({
      context: plugin.context,
      id: sdkId,
    }),
    name: 'Options',
  });

  if (plugin.config.httpResources.asClass) {
    generateAngularClassServices({ file, plugin });
  } else {
    generateAngularFunctionServices({ file, plugin });
  }
};

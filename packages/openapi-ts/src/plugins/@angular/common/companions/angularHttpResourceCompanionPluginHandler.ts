import { tsc } from '../../../../tsc';
import { stringCase } from '../../../../utils/stringCase';
import { sdkId } from '../../../@hey-api/sdk/constants';
import { operationClasses } from '../../../@hey-api/sdk/operation';
import { typesId } from '../../../@hey-api/typescript/ref';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '../../../shared/utils/operation';
import type { HeyApiAngularCommonPlugin } from '../types';
import { REQUEST_APIS_SUFFIX } from './angularHttpRequestsCompanionPluginHandler';

export const RESOURCE_APIS_SUFFIX = '/http/httpResource';

export const angularHttpResourceCompanionPluginHandler: HeyApiAngularCommonPlugin['Handler'] =
  ({ plugin }) => {
    const sdkPlugin = plugin.getPlugin('@hey-api/sdk');

    const file = plugin.createFile({
      exportFromIndex: true,
      id: plugin.name + RESOURCE_APIS_SUFFIX,
      path: plugin.output + RESOURCE_APIS_SUFFIX,
    });

    if (plugin.config.httpResource?.asClass) {
      file.import({
        module: '@angular/core',
        name: 'Injectable',
      });
    }

    if (plugin.config.httpRequest?.asClass) {
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

    if (plugin.config.httpResource!.asClass) {
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
  plugin: HeyApiAngularCommonPlugin['Instance'];
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

        // Generate the resource method name
        const resourceMethodName =
          plugin.config.httpResource!.methodNameBuilder!(operation);

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
          sdkPlugin,
        });

        if (!currentClass.nodes.length) {
          currentClass.nodes.push(methodNode);
        } else {
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
                text: plugin.config.httpResource!.classNameBuilder!(
                  childClass.className,
                ),
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
      name: plugin.config.httpResource!.classNameBuilder!(
        currentClass.className,
      ),
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
  sdkPlugin,
}: {
  file: any;
  plugin: HeyApiAngularCommonPlugin['Instance'];
  sdkPlugin: any;
}) => {
  plugin.forEach('operation', ({ operation }) => {
    const isRequiredOptions = isOperationOptionsRequired({
      context: plugin.context,
      operation,
    });

    const node = generateAngularResourceFunction({
      file,
      functionName: plugin.config.httpResource!.methodNameBuilder!(operation),
      isRequiredOptions,
      operation,
      plugin,
      sdkPlugin,
    });

    file.add(node);
  });
};

const generateResourceCallExpression = ({
  file,
  isRequiredOptions,
  operation,
  plugin,
  responseTypeName,
  sdkPlugin,
}: {
  file: any;
  isRequiredOptions: boolean;
  operation: any;
  plugin: any;
  responseTypeName: string;
  sdkPlugin: any;
}) => {
  // Check if httpRequest is configured to use classes
  const useRequestClasses = plugin.config.httpRequest?.asClass;
  let requestFunctionCall;

  // Create the options call expression based on whether options are required
  const optionsCallExpression = isRequiredOptions
    ? tsc.callExpression({
        functionName: 'options',
        parameters: [],
      })
    : tsc.conditionalExpression({
        condition: tsc.identifier({ text: 'options' }),
        whenFalse: tsc.identifier({ text: 'undefined' }),
        whenTrue: tsc.callExpression({
          functionName: 'options',
          parameters: [],
        }),
      });

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
      const rootClassName = firstEntry.path[0];
      const requestClassName =
        plugin.config.httpRequest!.classNameBuilder!(rootClassName);

      // Build the method access path using inject
      let methodAccess: any = tsc.callExpression({
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
        plugin.config.httpRequest!.methodNameBuilder!(operation);
      methodAccess = tsc.propertyAccessExpression({
        expression: methodAccess,
        name: requestMethodName,
      });

      requestFunctionCall = tsc.callExpression({
        functionName: methodAccess,
        parameters: [optionsCallExpression],
      });
    }
  } else {
    // For function-based request methods, import and call the function directly
    const requestFunctionName =
      plugin.config.httpRequest!.methodNameBuilder!(operation);

    const requestImport = file.import({
      module: file.relativePathToFile({
        context: plugin.context,
        id: plugin.name + REQUEST_APIS_SUFFIX,
      }),
      name: requestFunctionName,
    });

    requestFunctionCall = tsc.callExpression({
      functionName: requestImport.name,
      parameters: [optionsCallExpression],
    });
  }

  return tsc.callExpression({
    functionName: 'httpResource',
    parameters: [
      tsc.arrowFunction({
        parameters: [],
        statements: [
          tsc.returnStatement({
            expression: requestFunctionCall,
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
  sdkPlugin,
}: {
  file: any;
  isRequiredOptions: boolean;
  methodName: string;
  operation: any;
  plugin: any;
  sdkPlugin: any;
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
        type: `() => Options<${dataType.name || 'unknown'}, ThrowOnError>`,
      },
    ],
    returnType: undefined,
    statements: [
      tsc.returnStatement({
        expression: generateResourceCallExpression({
          file,
          isRequiredOptions,
          operation,
          plugin,
          responseTypeName: responseType.name || 'unknown',
          sdkPlugin,
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
  sdkPlugin,
}: {
  file: any;
  functionName: string;
  isRequiredOptions: boolean;
  operation: any;
  plugin: any;
  sdkPlugin: any;
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
          type: `() => Options<${dataType.name || 'unknown'}, ThrowOnError>`,
        },
      ],
      statements: [
        tsc.returnStatement({
          expression: generateResourceCallExpression({
            file,
            isRequiredOptions,
            operation,
            plugin,
            responseTypeName: responseType.name || 'unknown',
            sdkPlugin,
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

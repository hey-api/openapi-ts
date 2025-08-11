import { tsc } from '../../../../tsc';
import { stringCase } from '../../../../utils/stringCase';
import { clientId } from '../../../@hey-api/client-core/utils';
import { sdkId } from '../../../@hey-api/sdk/constants';
import { operationClasses } from '../../../@hey-api/sdk/operation';
import { typesId } from '../../../@hey-api/typescript/ref';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '../../../shared/utils/operation';
import type { HeyApiAngularCommonPlugin } from '../types';

export const REQUEST_APIS_SUFFIX = '/http/httpRequests';

export const angularHttpRequestsCompanionPluginHandler: HeyApiAngularCommonPlugin['Handler'] =
  ({ plugin }) => {
    const sdkPlugin = plugin.getPlugin('@hey-api/sdk');

    const file = plugin.createFile({
      exportFromIndex: true,
      id: plugin.name + REQUEST_APIS_SUFFIX,
      path: plugin.output + REQUEST_APIS_SUFFIX,
    });

    if (plugin.config.httpRequest?.asClass) {
      file.import({
        module: '@angular/core',
        name: 'Injectable',
      });
    }

    file.import({
      module: '@angular/common/http',
      name: 'HttpRequest',
    });

    file.import({
      module: file.relativePathToFile({
        context: plugin.context,
        id: sdkId,
      }),
      name: 'Options',
    });

    if (plugin.config.httpRequest?.asClass) {
      generateAngularClassRequests({ file, plugin, sdkPlugin });
    } else {
      generateAngularFunctionRequests({ file, plugin });
    }
  };

interface AngularRequestClassEntry {
  className: string;
  classes: Set<string>;
  methods: Set<string>;
  nodes: Array<any>;
  root: boolean;
}

const generateAngularClassRequests = ({
  file,
  plugin,
  sdkPlugin,
}: {
  file: any;
  plugin: HeyApiAngularCommonPlugin['Instance'];
  sdkPlugin: any;
}) => {
  const requestClasses = new Map<string, AngularRequestClassEntry>();
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
        if (!requestClasses.has(currentClassName)) {
          requestClasses.set(currentClassName, {
            className: currentClassName,
            classes: new Set(),
            methods: new Set(),
            nodes: [],
            root: !index,
          });
        }

        const parentClassName = entry.path[index - 1];
        if (parentClassName && parentClassName !== currentClassName) {
          const parentClass = requestClasses.get(parentClassName)!;
          parentClass.classes.add(currentClassName);
          requestClasses.set(parentClassName, parentClass);
        }

        const isLast = entry.path.length === index + 1;
        if (!isLast) {
          return;
        }

        const currentClass = requestClasses.get(currentClassName)!;

        // Generate the request method name with "Request" suffix
        const requestMethodName =
          plugin.config.httpRequest!.methodNameBuilder!(operation);

        // Avoid duplicate methods
        if (currentClass.methods.has(requestMethodName)) {
          return;
        }

        // Generate Angular request method
        const methodNode = generateAngularRequestMethod({
          file,
          isRequiredOptions,
          methodName: requestMethodName,
          operation,
          plugin,
        });

        if (!currentClass.nodes.length) {
          currentClass.nodes.push(methodNode);
        } else {
          currentClass.nodes.push(tsc.identifier({ text: '\n' }), methodNode);
        }

        currentClass.methods.add(requestMethodName);
        requestClasses.set(currentClassName, currentClass);
      });
    }
  });

  // Generate classes
  const generateClass = (currentClass: AngularRequestClassEntry) => {
    if (generatedClasses.has(currentClass.className)) {
      return;
    }

    // Handle child classes
    if (currentClass.classes.size) {
      for (const childClassName of currentClass.classes) {
        const childClass = requestClasses.get(childClassName)!;
        generateClass(childClass);

        currentClass.nodes.push(
          tsc.propertyDeclaration({
            initializer: tsc.newExpression({
              argumentsArray: [],
              expression: tsc.identifier({
                text: plugin.config.httpRequest!.classNameBuilder!(
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
      name: plugin.config.httpRequest!.classNameBuilder!(
        currentClass.className,
      ),
      nodes: currentClass.nodes,
    });

    file.add(node);
    generatedClasses.add(currentClass.className);
  };

  for (const requestClass of requestClasses.values()) {
    generateClass(requestClass);
  }
};

const generateAngularFunctionRequests = ({
  file,
  plugin,
}: {
  file: any;
  plugin: HeyApiAngularCommonPlugin['Instance'];
}) => {
  plugin.forEach('operation', ({ operation }) => {
    const isRequiredOptions = isOperationOptionsRequired({
      context: plugin.context,
      operation,
    });

    // Generate function name with "Request" suffix
    const functionName =
      plugin.config.httpRequest!.methodNameBuilder!(operation);

    const node = generateAngularRequestFunction({
      file,
      functionName,
      isRequiredOptions,
      operation,
      plugin,
    });

    file.add(node);
  });
};

const generateRequestCallExpression = ({
  file,
  operation,
  plugin,
}: {
  file: any;
  operation: any;
  plugin: any;
}) => {
  // Import the client and use requestOptions instead of HTTP methods
  const clientImport = file.import({
    alias: '_heyApiClient',
    module: file.relativePathToFile({
      context: plugin.context,
      id: clientId,
    }),
    name: 'client',
  });

  return tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: tsc.conditionalExpression({
        condition: tsc.propertyAccessExpression({
          expression: tsc.identifier({ text: 'options' }),
          isOptional: true,
          name: 'client',
        }),
        whenFalse: tsc.identifier({ text: clientImport.name }),
        whenTrue: tsc.propertyAccessExpression({
          expression: tsc.identifier({ text: 'options' }),
          name: 'client',
        }),
      }),
      name: 'requestOptions',
    }),
    parameters: [
      tsc.objectExpression({
        obj: [
          {
            key: 'responseStyle',
            value: tsc.identifier({ text: "'data'" }),
          },
          {
            key: 'method',
            value: tsc.identifier({
              text: `'${operation.method.toUpperCase()}'`,
            }),
          },
          {
            key: 'url',
            value: tsc.identifier({ text: `'${operation.path}'` }),
          },
          {
            spread: 'options',
          },
        ],
      }),
    ],
  });
};

const generateAngularRequestMethod = ({
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
    name: methodName,
    parameters: [
      {
        isRequired: isRequiredOptions,
        name: 'options',
        type: `Options<${dataType.name || 'unknown'}, ThrowOnError>`,
      },
    ],
    returnType: 'HttpRequest<unknown>',
    statements: [
      tsc.returnStatement({
        expression: generateRequestCallExpression({
          file,
          operation,
          plugin,
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

const generateAngularRequestFunction = ({
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
          type: `Options<${dataType.name || 'unknown'}, ThrowOnError>`,
        },
      ],
      returnType: 'HttpRequest<unknown>',
      statements: [
        tsc.returnStatement({
          expression: generateRequestCallExpression({
            file,
            operation,
            plugin,
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

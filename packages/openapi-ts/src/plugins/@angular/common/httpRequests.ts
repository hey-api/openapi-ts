import type ts from 'typescript';

import type { GeneratedFile } from '../../../generate/file';
import type { IR } from '../../../ir/types';
import { buildName } from '../../../openApi/shared/utils/name';
import { tsc } from '../../../tsc';
import { stringCase } from '../../../utils/stringCase';
import { clientId } from '../../@hey-api/client-core/utils';
import { sdkId } from '../../@hey-api/sdk/constants';
import { operationClasses } from '../../@hey-api/sdk/operation';
import { typesId } from '../../@hey-api/typescript/ref';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '../../shared/utils/operation';
import { REQUEST_APIS_SUFFIX } from './constants';
import type { AngularCommonPlugin } from './types';

interface AngularRequestClassEntry {
  className: string;
  classes: Set<string>;
  methods: Set<string>;
  nodes: Array<ts.ClassElement>;
  root: boolean;
}

const generateAngularClassRequests = ({
  file,
  plugin,
}: {
  file: GeneratedFile;
  plugin: AngularCommonPlugin['Instance'];
}) => {
  const requestClasses = new Map<string, AngularRequestClassEntry>();
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
        if (!requestClasses.has(currentClassName.className)) {
          requestClasses.set(currentClassName.className, {
            className: currentClassName.className,
            classes: new Set(),
            methods: new Set(),
            nodes: [],
            root: !index,
          });
        }

        const parentClassName = entry.path[index - 1];
        if (parentClassName && parentClassName !== currentClassName) {
          const parentClass = requestClasses.get(parentClassName.className)!;
          parentClass.classes.add(currentClassName.className);
          requestClasses.set(parentClassName.className, parentClass);
        }

        const isLast = entry.path.length === index + 1;
        if (!isLast) {
          return;
        }

        const currentClass = requestClasses.get(currentClassName.className)!;

        // Generate the request method name with "Request" suffix
        const requestMethodName =
          plugin.config.httpRequests.methodNameBuilder(operation);

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
          // @ts-expect-error
          currentClass.nodes.push(tsc.identifier({ text: '\n' }), methodNode);
        }

        currentClass.methods.add(requestMethodName);
        requestClasses.set(currentClassName.className, currentClass);
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
                text: buildName({
                  config: {
                    case: 'preserve',
                    name: plugin.config.httpRequests.classNameBuilder,
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
          name: plugin.config.httpRequests.classNameBuilder,
        },
        name: currentClass.className,
      }),
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
  file: GeneratedFile;
  plugin: AngularCommonPlugin['Instance'];
}) => {
  plugin.forEach('operation', ({ operation }) => {
    const isRequiredOptions = isOperationOptionsRequired({
      context: plugin.context,
      operation,
    });

    // Generate function name with "Request" suffix
    const functionName =
      plugin.config.httpRequests.methodNameBuilder(operation);

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
  file: GeneratedFile;
  operation: IR.OperationObject;
  plugin: AngularCommonPlugin['Instance'];
}) => {
  // TODO: client might not be always defined
  const heyApiClient = file.import({
    alias: '_heyApiClient',
    module: file.relativePathToFile({
      context: plugin.context,
      id: clientId,
    }),
    name: 'client',
  });

  const optionsClient = tsc.propertyAccessExpression({
    expression: tsc.identifier({ text: 'options' }),
    isOptional: true,
    name: 'client',
  });

  return tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: tsc.binaryExpression({
        left: optionsClient,
        operator: '??',
        right: tsc.identifier({ text: heyApiClient.name }),
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

export const createHttpRequests: AngularCommonPlugin['Handler'] = ({
  plugin,
}) => {
  const file = plugin.createFile({
    id: `${plugin.name}${REQUEST_APIS_SUFFIX}`,
    path: `${plugin.output}${REQUEST_APIS_SUFFIX}`,
  });

  if (plugin.config.httpRequests.asClass) {
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

  if (plugin.config.httpRequests.asClass) {
    generateAngularClassRequests({ file, plugin });
  } else {
    generateAngularFunctionRequests({ file, plugin });
  }
};

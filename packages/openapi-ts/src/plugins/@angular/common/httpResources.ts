import type { ICodegenSymbolOut } from '@hey-api/codegen-core';
import type ts from 'typescript';

import { TypeScriptRenderer } from '../../../generate/renderer';
import type { IR } from '../../../ir/types';
import { buildName } from '../../../openApi/shared/utils/name';
import { tsc } from '../../../tsc';
import { stringCase } from '../../../utils/stringCase';
import { operationClasses } from '../../@hey-api/sdk/operation';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '../../shared/utils/operation';
import type { AngularCommonPlugin } from './types';

interface AngularServiceClassEntry {
  className: string;
  classes: Set<string>;
  methods: Set<string>;
  nodes: Array<ts.ClassElement>;
  root: boolean;
}

const pathSuffix = '/http/resources';

const generateAngularClassServices = ({
  plugin,
}: {
  plugin: AngularCommonPlugin['Instance'];
}) => {
  const f = plugin.gen.ensureFile(`${plugin.output}${pathSuffix}`);

  const serviceClasses = new Map<string, AngularServiceClassEntry>();
  const generatedClasses = new Set<string>();

  const sdkPlugin = plugin.getPluginOrThrow('@hey-api/sdk');

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

        const resourceMethodName =
          plugin.config.httpResources.methodNameBuilder(operation);

        if (currentClass.methods.has(resourceMethodName)) {
          return;
        }

        const methodNode = generateAngularResourceMethod({
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

  const generateClass = (currentClass: AngularServiceClassEntry) => {
    if (generatedClasses.has(currentClass.className)) {
      return;
    }

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

    const symbolInjectable = f
      .ensureSymbol({
        selector: plugin.api.getSelector('Injectable'),
      })
      .update({ name: 'Injectable' });
    f.addImport({
      from: '@angular/core',
      names: [symbolInjectable.placeholder],
    });
    const symbolClass = f.addSymbol({
      name: buildName({
        config: {
          case: 'preserve',
          name: plugin.config.httpResources.classNameBuilder,
        },
        name: currentClass.className,
      }),
    });
    const node = tsc.classDeclaration({
      decorator: currentClass.root
        ? {
            args: [{ providedIn: 'root' }],
            name: symbolInjectable.placeholder,
          }
        : undefined,
      exportClass: currentClass.root,
      name: symbolClass.placeholder,
      nodes: currentClass.nodes,
    });
    symbolClass.update({ value: node });

    generatedClasses.add(currentClass.className);
  };

  for (const serviceClass of serviceClasses.values()) {
    generateClass(serviceClass);
  }
};

const generateAngularFunctionServices = ({
  plugin,
}: {
  plugin: AngularCommonPlugin['Instance'];
}) => {
  const f = plugin.gen.ensureFile(`${plugin.output}${pathSuffix}`);

  plugin.forEach('operation', ({ operation }) => {
    const isRequiredOptions = isOperationOptionsRequired({
      context: plugin.context,
      operation,
    });

    const symbol = f.addSymbol({
      name: plugin.config.httpResources.methodNameBuilder(operation),
    });
    const node = generateAngularResourceFunction({
      isRequiredOptions,
      operation,
      plugin,
      symbol,
    });
    symbol.update({ value: node });
  });
};

const generateResourceCallExpression = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: AngularCommonPlugin['Instance'];
}) => {
  const f = plugin.gen.ensureFile(`${plugin.output}${pathSuffix}`);

  const sdkPlugin = plugin.getPluginOrThrow('@hey-api/sdk');
  const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');

  const symbolHttpResource = f
    .ensureSymbol({
      selector: plugin.api.getSelector('httpResource'),
    })
    .update({ name: 'httpResource' });
  f.addImport({
    from: '@angular/common/http',
    names: [symbolHttpResource.placeholder],
  });

  const symbolResponseType = plugin.gen.selectSymbolFirst(
    pluginTypeScript.api.getSelector('response', operation.id),
  );
  if (symbolResponseType) {
    f.addImport({
      from: symbolResponseType.file,
      typeNames: [symbolResponseType.placeholder],
    });
  }
  const responseType = symbolResponseType?.placeholder || 'unknown';

  if (plugin.config.httpRequests.asClass) {
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
      const symbolClass = plugin.gen.selectSymbolFirstOrThrow(
        plugin.api.getSelector('class', rootClassName),
      );
      f.addImport({
        from: symbolClass.file,
        names: [symbolClass.placeholder],
      });

      // Build the method access path using inject
      const symbolInject = f
        .ensureSymbol({
          selector: plugin.api.getSelector('inject'),
        })
        .update({ name: 'inject' });
      f.addImport({
        from: '@angular/core',
        names: [symbolInject.placeholder],
      });
      let methodAccess: ts.Expression = tsc.callExpression({
        functionName: symbolInject.placeholder,
        parameters: [tsc.identifier({ text: symbolClass.placeholder })],
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

      methodAccess = tsc.propertyAccessExpression({
        expression: methodAccess,
        name: plugin.config.httpRequests.methodNameBuilder(operation),
      });

      return tsc.callExpression({
        functionName: symbolHttpResource.placeholder,
        parameters: [
          tsc.arrowFunction({
            parameters: [],
            statements: [
              tsc.constVariable({
                expression: tsc.conditionalExpression({
                  condition: tsc.identifier({ text: 'options' }),
                  whenFalse: tsc.identifier({ text: 'undefined' }),
                  whenTrue: tsc.callExpression({
                    functionName: 'options',
                    parameters: [],
                  }),
                }),
                name: 'opts',
              }),
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
        types: [tsc.typeNode(responseType)],
      });
    }
  } else {
    const symbolHttpRequest = plugin.gen.selectSymbolFirstOrThrow(
      plugin.api.getSelector('httpRequest', operation.id),
    );
    f.addImport({
      from: symbolHttpRequest.file,
      names: [symbolHttpRequest.placeholder],
    });

    return tsc.callExpression({
      functionName: symbolHttpResource.placeholder,
      parameters: [
        tsc.arrowFunction({
          parameters: [],
          statements: [
            tsc.constVariable({
              expression: tsc.conditionalExpression({
                condition: tsc.identifier({ text: 'options' }),
                whenFalse: tsc.identifier({ text: 'undefined' }),
                whenTrue: tsc.callExpression({
                  functionName: 'options',
                  parameters: [],
                }),
              }),
              name: 'opts',
            }),
            tsc.returnStatement({
              expression: tsc.conditionalExpression({
                condition: tsc.identifier({ text: 'opts' }),
                whenFalse: tsc.identifier({ text: 'undefined' }),
                whenTrue: tsc.callExpression({
                  functionName: symbolHttpRequest.placeholder,
                  parameters: [tsc.identifier({ text: 'opts' })],
                }),
              }),
            }),
          ],
        }),
      ],
      types: [tsc.typeNode(responseType)],
    });
  }

  // Fallback return (should not reach here)
  return tsc.callExpression({
    functionName: symbolHttpResource.placeholder,
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
    types: [tsc.typeNode(responseType)],
  });
};

const generateAngularResourceMethod = ({
  isRequiredOptions,
  methodName,
  operation,
  plugin,
}: {
  isRequiredOptions: boolean;
  methodName: string;
  operation: IR.OperationObject;
  plugin: AngularCommonPlugin['Instance'];
}) => {
  const f = plugin.gen.ensureFile(`${plugin.output}${pathSuffix}`);

  const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');

  const sdkPlugin = plugin.getPluginOrThrow('@hey-api/sdk');
  const symbolOptions = plugin.gen.selectSymbolFirstOrThrow(
    sdkPlugin.api.getSelector('Options'),
  );
  f.addImport({
    from: symbolOptions.file,
    typeNames: [symbolOptions.placeholder],
  });

  const symbolDataType = plugin.gen.selectSymbolFirst(
    pluginTypeScript.api.getSelector('data', operation.id),
  );
  if (symbolDataType) {
    f.addImport({
      from: symbolDataType.file,
      typeNames: [symbolDataType.placeholder],
    });
  }
  const dataType = symbolDataType?.placeholder || 'unknown';

  return tsc.methodDeclaration({
    accessLevel: 'public',
    comment: createOperationComment({ operation }),
    name: methodName,
    parameters: [
      {
        isRequired: isRequiredOptions,
        name: 'options',
        type: `() => ${symbolOptions.placeholder}<${dataType}, ThrowOnError> | undefined`,
      },
    ],
    returnType: undefined,
    statements: [
      tsc.returnStatement({
        expression: generateResourceCallExpression({
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

const generateAngularResourceFunction = ({
  isRequiredOptions,
  operation,
  plugin,
  symbol,
}: {
  isRequiredOptions: boolean;
  operation: IR.OperationObject;
  plugin: AngularCommonPlugin['Instance'];
  symbol: ICodegenSymbolOut;
}) => {
  const f = plugin.gen.ensureFile(`${plugin.output}${pathSuffix}`);

  const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');

  const sdkPlugin = plugin.getPluginOrThrow('@hey-api/sdk');
  const symbolOptions = plugin.gen.selectSymbolFirstOrThrow(
    sdkPlugin.api.getSelector('Options'),
  );
  f.addImport({
    from: symbolOptions.file,
    typeNames: [symbolOptions.placeholder],
  });

  const symbolDataType = plugin.gen.selectSymbolFirst(
    pluginTypeScript.api.getSelector('data', operation.id),
  );
  if (symbolDataType) {
    f.addImport({
      from: symbolDataType.file,
      typeNames: [symbolDataType.placeholder],
    });
  }
  const dataType = symbolDataType?.placeholder || 'unknown';

  return tsc.constVariable({
    comment: createOperationComment({ operation }),
    exportConst: true,
    expression: tsc.arrowFunction({
      parameters: [
        {
          isRequired: isRequiredOptions,
          name: 'options',
          type: `() => ${symbolOptions.placeholder}<${dataType}, ThrowOnError> | undefined`,
        },
      ],
      statements: [
        tsc.returnStatement({
          expression: generateResourceCallExpression({
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
    name: symbol.placeholder,
  });
};

export const createHttpResources: AngularCommonPlugin['Handler'] = ({
  plugin,
}) => {
  const f = plugin.gen.createFile(`${plugin.output}${pathSuffix}`, {
    extension: '.ts',
    path: '{{path}}.gen',
    renderer: new TypeScriptRenderer(),
  });

  if (plugin.config.httpResources.asClass) {
    generateAngularClassServices({ plugin });
  } else {
    generateAngularFunctionServices({ plugin });
  }

  if (plugin.config.exportFromIndex && f.hasContent()) {
    const index = plugin.gen.ensureFile('index');
    index.addExport({ from: f, namespaceImport: true });
  }
};

import type { ICodegenSymbolOut } from '@hey-api/codegen-core';
import type ts from 'typescript';

import { TypeScriptRenderer } from '../../../generate/renderer';
import type { IR } from '../../../ir/types';
import { buildName } from '../../../openApi/shared/utils/name';
import { tsc } from '../../../tsc';
import { stringCase } from '../../../utils/stringCase';
import { getClientPlugin } from '../../@hey-api/client-core/utils';
import { operationClasses } from '../../@hey-api/sdk/operation';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '../../shared/utils/operation';
import type { AngularCommonPlugin } from './types';

interface AngularRequestClassEntry {
  className: string;
  classes: Set<string>;
  methods: Set<string>;
  nodes: Array<ts.ClassElement>;
  root: boolean;
}

const pathSuffix = '/http/requests';

const generateAngularClassRequests = ({
  plugin,
}: {
  plugin: AngularCommonPlugin['Instance'];
}) => {
  const f = plugin.gen.ensureFile(`${plugin.output}${pathSuffix}`);

  const requestClasses = new Map<string, AngularRequestClassEntry>();
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

        const requestMethodName =
          plugin.config.httpRequests.methodNameBuilder(operation);

        if (currentClass.methods.has(requestMethodName)) {
          return;
        }

        const methodNode = generateAngularRequestMethod({
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
        requestClasses.set(currentClassName, currentClass);
      });
    }
  });

  const generateClass = (currentClass: AngularRequestClassEntry) => {
    if (generatedClasses.has(currentClass.className)) {
      return;
    }

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
          name: plugin.config.httpRequests.classNameBuilder,
        },
        name: currentClass.className,
      }),
      selector: plugin.api.getSelector('class', currentClass.className),
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

  for (const requestClass of requestClasses.values()) {
    generateClass(requestClass);
  }
};

const generateAngularFunctionRequests = ({
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
      name: plugin.config.httpRequests.methodNameBuilder(operation),
      selector: plugin.api.getSelector('httpRequest', operation.id),
    });
    const node = generateAngularRequestFunction({
      isRequiredOptions,
      operation,
      plugin,
      symbol,
    });
    symbol.update({ value: node });
  });
};

const generateRequestCallExpression = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: AngularCommonPlugin['Instance'];
}) => {
  const f = plugin.gen.ensureFile(`${plugin.output}${pathSuffix}`);

  let symbolClient: ICodegenSymbolOut | undefined;
  const client = getClientPlugin(plugin.context.config);
  if (client.api && 'getSelector' in client.api) {
    symbolClient = plugin.gen.selectSymbolFirst(
      // @ts-expect-error
      client.api.getSelector('client'),
    );
    if (symbolClient) {
      f.addImport({
        from: symbolClient.file,
        names: [symbolClient.placeholder],
      });
    }
  }

  const optionsClient = tsc.propertyAccessExpression({
    expression: tsc.identifier({ text: 'options' }),
    isOptional: true,
    name: 'client',
  });

  let clientExpression: ts.Expression;
  if (symbolClient) {
    clientExpression = tsc.binaryExpression({
      left: optionsClient,
      operator: '??',
      right: symbolClient.placeholder,
    });
  } else {
    clientExpression = optionsClient;
  }

  return tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: clientExpression,
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

  const symbolHttpRequest = f
    .ensureSymbol({
      selector: plugin.api.getSelector('HttpRequest'),
    })
    .update({ name: 'HttpRequest' });
  f.addImport({
    from: '@angular/common/http',
    typeNames: [symbolHttpRequest.placeholder],
  });

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
        type: `${symbolOptions.placeholder}<${dataType}, ThrowOnError>`,
      },
    ],
    returnType: `${symbolHttpRequest.placeholder}<unknown>`,
    statements: [
      tsc.returnStatement({
        expression: generateRequestCallExpression({
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

  const symbolHttpRequest = f
    .ensureSymbol({
      selector: plugin.api.getSelector('HttpRequest'),
    })
    .update({ name: 'HttpRequest' });
  f.addImport({
    from: '@angular/common/http',
    typeNames: [symbolHttpRequest.placeholder],
  });

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
          type: `${symbolOptions.placeholder}<${dataType}, ThrowOnError>`,
        },
      ],
      returnType: `${symbolHttpRequest.placeholder}<unknown>`,
      statements: [
        tsc.returnStatement({
          expression: generateRequestCallExpression({
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

export const createHttpRequests: AngularCommonPlugin['Handler'] = ({
  plugin,
}) => {
  plugin.gen.createFile(`${plugin.output}${pathSuffix}`, {
    extension: '.ts',
    path: '{{path}}.gen',
    renderer: new TypeScriptRenderer(),
  });

  if (plugin.config.httpRequests.asClass) {
    generateAngularClassRequests({ plugin });
  } else {
    generateAngularFunctionRequests({ plugin });
  }
};

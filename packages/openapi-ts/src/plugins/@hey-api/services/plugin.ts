import type ts from 'typescript';

import { compiler } from '../../../compiler';
import type { ObjectValue } from '../../../compiler/types';
import {
  clientModulePath,
  clientOptionsTypeName,
} from '../../../generate/client';
import {
  operationOptionsType,
  serviceFunctionIdentifier,
} from '../../../generate/services';
import type { IRContext } from '../../../ir/context';
import type {
  IROperationObject,
  IRPathItemObject,
  IRPathsObject,
} from '../../../ir/ir';
import { hasOperationDataRequired } from '../../../ir/operation';
import { camelCase } from '../../../utils/camelCase';
import { escapeComment } from '../../../utils/escape';
import { getServiceName } from '../../../utils/postprocess';
import { irRef } from '../../../utils/ref';
import { transformServiceName } from '../../../utils/transform';
import { operationResponseTransformerRef } from '../transformers/plugin';

interface OperationIRRef {
  /**
   * Operation ID
   */
  id: string;
}

const operationIrRef = ({
  id,
  type,
}: OperationIRRef & {
  type: 'data' | 'error' | 'response';
}): string => {
  let affix = '';
  switch (type) {
    case 'data':
      affix = 'Data';
      break;
    case 'error':
      affix = 'Error';
      break;
    case 'response':
      affix = 'Response';
      break;
  }
  return `${irRef}${camelCase({
    input: id,
    pascalCase: true,
  })}${affix}`;
};

export const operationDataRef = ({ id }: OperationIRRef): string =>
  operationIrRef({ id, type: 'data' });

export const operationErrorRef = ({ id }: OperationIRRef): string =>
  operationIrRef({ id, type: 'error' });

export const operationResponseRef = ({ id }: OperationIRRef): string =>
  operationIrRef({ id, type: 'response' });

const servicesId = 'services';

const checkPrerequisites = ({ context }: { context: IRContext }) => {
  if (!context.config.client.name) {
    throw new Error(
      '🚫 client needs to be set to generate services - which HTTP client do you want to use?',
    );
  }

  if (!context.file({ id: 'types' })) {
    throw new Error(
      '🚫 types need to be exported to generate services - enable type generation',
    );
  }
};

const requestOptions = ({
  context,
  operation,
  path,
}: {
  context: IRContext;
  operation: IROperationObject;
  path: string;
}) => {
  const file = context.file({ id: servicesId })!;
  const servicesOutput = file.nameWithoutExtension();

  const obj: ObjectValue[] = [{ spread: 'options' }];

  if (operation.body) {
    switch (operation.body.type) {
      case 'form-data':
        obj.push({ spread: 'formDataBodySerializer' });
        file.import({
          module: clientModulePath({
            config: context.config,
            sourceOutput: servicesOutput,
          }),
          name: 'formDataBodySerializer',
        });
        break;
      case 'json':
        break;
      case 'url-search-params':
        obj.push({ spread: 'urlSearchParamsBodySerializer' });
        file.import({
          module: clientModulePath({
            config: context.config,
            sourceOutput: servicesOutput,
          }),
          name: 'urlSearchParamsBodySerializer',
        });
        break;
    }

    obj.push({
      key: 'headers',
      value: [
        {
          key: 'Content-Type',
          // form-data does not need Content-Type header, browser will set it automatically
          value:
            operation.body.type === 'form-data'
              ? null
              : operation.body.mediaType,
        },
        {
          spread: 'options?.headers',
        },
      ],
    });
  }

  // TODO: parser - set parseAs to skip inference if every response has the same
  // content type. currently impossible because successes do not contain
  // header information

  obj.push({
    key: 'url',
    value: path,
  });

  const fileTransformers = context.file({ id: 'transformers' });
  if (fileTransformers) {
    const identifier = fileTransformers.identifier({
      $ref: operationResponseTransformerRef({ id: operation.id }),
      namespace: 'value',
    });
    if (identifier.name) {
      file.import({
        module: file.relativePathToFile({ context, id: 'transformers' }),
        name: identifier.name,
      });
      obj.push({
        key: 'responseTransformer',
        value: identifier.name,
      });
    }
  }

  return compiler.objectExpression({
    identifiers: ['responseTransformer'],
    obj,
  });
};

const generateClassServices = ({ context }: { context: IRContext }) => {
  const file = context.file({ id: servicesId })!;
  const typesModule = file.relativePathToFile({ context, id: 'types' });

  const services = new Map<string, Array<ts.MethodDeclaration>>();

  for (const path in context.ir.paths) {
    const pathItem = context.ir.paths[path as keyof IRPathsObject];

    for (const _method in pathItem) {
      const method = _method as keyof IRPathItemObject;
      const operation = pathItem[method]!;

      const identifierData = context.file({ id: 'types' })!.identifier({
        $ref: operationDataRef({ id: operation.id }),
        namespace: 'type',
      });
      if (identifierData.name) {
        file.import({
          asType: true,
          module: typesModule,
          name: identifierData.name,
        });
      }

      const identifierError = context.file({ id: 'types' })!.identifier({
        $ref: operationErrorRef({ id: operation.id }),
        namespace: 'type',
      });
      if (identifierError.name) {
        file.import({
          asType: true,
          module: typesModule,
          name: identifierError.name,
        });
      }

      const identifierResponse = context.file({ id: 'types' })!.identifier({
        $ref: operationResponseRef({ id: operation.id }),
        namespace: 'type',
      });
      if (identifierResponse.name) {
        file.import({
          asType: true,
          module: typesModule,
          name: identifierResponse.name,
        });
      }

      const node = compiler.methodDeclaration({
        accessLevel: 'public',
        comment: [
          operation.deprecated && '@deprecated',
          operation.summary && escapeComment(operation.summary),
          operation.description && escapeComment(operation.description),
        ],
        isStatic: true,
        name: serviceFunctionIdentifier({
          config: context.config,
          handleIllegal: false,
          id: operation.id,
          operation,
        }),
        parameters: [
          {
            isRequired: hasOperationDataRequired(operation),
            name: 'options',
            type: operationOptionsType({
              importedType: identifierData.name,
              throwOnError: 'ThrowOnError',
            }),
          },
        ],
        returnType: undefined,
        statements: [
          compiler.returnFunctionCall({
            args: [
              requestOptions({
                context,
                operation,
                path,
              }),
            ],
            name: `(options?.client ?? client).${method}`,
            types: [
              identifierResponse.name || 'unknown',
              identifierError.name || 'unknown',
              'ThrowOnError',
            ],
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

      const uniqueTags = Array.from(new Set(operation.tags));
      if (!uniqueTags.length) {
        uniqueTags.push('default');
      }

      for (const tag of uniqueTags) {
        const serviceName = getServiceName(tag);
        const nodes = services.get(serviceName) ?? [];
        nodes.push(node);
        services.set(serviceName, nodes);
      }
    }
  }

  for (const [serviceName, nodes] of services) {
    const node = compiler.classDeclaration({
      decorator: undefined,
      members: nodes,
      name: transformServiceName({
        config: context.config,
        name: serviceName,
      }),
    });
    file.add(node);
  }
};

const generateFlatServices = ({ context }: { context: IRContext }) => {
  const file = context.file({ id: servicesId })!;
  const typesModule = file.relativePathToFile({ context, id: 'types' });

  for (const path in context.ir.paths) {
    const pathItem = context.ir.paths[path as keyof IRPathsObject];

    for (const _method in pathItem) {
      const method = _method as keyof IRPathItemObject;
      const operation = pathItem[method]!;

      const identifierData = context.file({ id: 'types' })!.identifier({
        $ref: operationDataRef({ id: operation.id }),
        namespace: 'type',
      });
      if (identifierData.name) {
        file.import({
          asType: true,
          module: typesModule,
          name: identifierData.name,
        });
      }

      const identifierError = context.file({ id: 'types' })!.identifier({
        $ref: operationErrorRef({ id: operation.id }),
        namespace: 'type',
      });
      if (identifierError.name) {
        file.import({
          asType: true,
          module: typesModule,
          name: identifierError.name,
        });
      }

      const identifierResponse = context.file({ id: 'types' })!.identifier({
        $ref: operationResponseRef({ id: operation.id }),
        namespace: 'type',
      });
      if (identifierResponse.name) {
        file.import({
          asType: true,
          module: typesModule,
          name: identifierResponse.name,
        });
      }

      const node = compiler.constVariable({
        comment: [
          operation.deprecated && '@deprecated',
          operation.summary && escapeComment(operation.summary),
          operation.description && escapeComment(operation.description),
        ],
        exportConst: true,
        expression: compiler.arrowFunction({
          parameters: [
            {
              isRequired: hasOperationDataRequired(operation),
              name: 'options',
              type: operationOptionsType({
                importedType: identifierData.name,
                throwOnError: 'ThrowOnError',
              }),
            },
          ],
          returnType: undefined,
          statements: [
            compiler.returnFunctionCall({
              args: [
                requestOptions({
                  context,
                  operation,
                  path,
                }),
              ],
              name: `(options?.client ?? client).${method}`,
              types: [
                identifierResponse.name || 'unknown',
                identifierError.name || 'unknown',
                'ThrowOnError',
              ],
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
        name: serviceFunctionIdentifier({
          config: context.config,
          handleIllegal: true,
          id: operation.id,
          operation,
        }),
      });
      file.add(node);
    }
  }
};

export const generateServices = ({ context }: { context: IRContext }): void => {
  // TODO: parser - once services are a plugin, this logic can be simplified
  if (!context.config.services.export) {
    return;
  }

  checkPrerequisites({ context });

  const file = context.createFile({
    id: servicesId,
    path: 'services',
  });
  const servicesOutput = file.nameWithoutExtension();

  // import required packages and core files
  file.import({
    module: clientModulePath({
      config: context.config,
      sourceOutput: servicesOutput,
    }),
    name: 'createClient',
  });
  file.import({
    module: clientModulePath({
      config: context.config,
      sourceOutput: servicesOutput,
    }),
    name: 'createConfig',
  });
  file.import({
    asType: true,
    module: clientModulePath({
      config: context.config,
      sourceOutput: servicesOutput,
    }),
    name: clientOptionsTypeName(),
  });

  // define client first
  const statement = compiler.constVariable({
    exportConst: true,
    expression: compiler.callExpression({
      functionName: 'createClient',
      parameters: [
        compiler.callExpression({
          functionName: 'createConfig',
        }),
      ],
    }),
    name: 'client',
  });
  file.add(statement);

  if (context.config.services.asClass) {
    generateClassServices({ context });
  } else {
    generateFlatServices({ context });
  }
};

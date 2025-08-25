import type ts from 'typescript';

import { createOperationKey } from '../../../ir/operation';
import { tsc } from '../../../tsc';
import type { ModelMeta, OperationResponse } from '../../../types/client';
import { getConfig } from '../../../utils/config';
import { isModelDate, unsetUniqueTypeName } from '../../../utils/type';
import {
  modelResponseTransformerTypeName,
  operationResponseTransformerTypeName,
  operationResponseTypeName,
} from '../sdk/plugin-legacy';
import { generateType, type TypesProps } from '../typescript/plugin-legacy';
import type { HeyApiTransformersPlugin } from './types';

interface ModelProps extends TypesProps {
  meta?: ModelMeta;
  path: Array<string>;
}

const dataVariableName = 'data';

const isVoidResponse = (response: OperationResponse) =>
  response.base === 'unknown' &&
  response.export === 'generic' &&
  response.type === 'unknown';

const getRefModels = ({
  client,
  model,
}: Pick<TypesProps, 'client' | 'model'>) => {
  const refModels = model.$refs.map((ref) => {
    const refModel = client.models.find((model) => model.meta?.$ref === ref);
    if (!refModel) {
      throw new Error(
        `Ref ${ref} could not be found. Transformers cannot be generated without having access to all refs.`,
      );
    }
    return refModel;
  });
  return refModels;
};

const ensureModelResponseTransformerExists = (
  props: Omit<ModelProps, 'path'>,
) => {
  const modelName = props.model.meta!.name;

  const { name } = generateType({
    ...props,
    meta: {
      $ref: `transformers/${modelName}`,
      name: modelName,
    },
    nameTransformer: modelResponseTransformerTypeName,
    onCreated: (name) => {
      const statements = processModel({
        ...props,
        meta: {
          $ref: `transformers/${modelName}`,
          name,
        },
        path: [dataVariableName],
      });
      generateResponseTransformer({
        ...props,
        async: false,
        name,
        statements,
      });
    },
    type: `(${dataVariableName}: any) => ${modelName}`,
  });

  const result = {
    created: Boolean(props.client.types[name]),
    name,
  };
  return result;
};

const processArray = (props: ModelProps) => {
  const { model } = props;
  const refModels = getRefModels(props);

  if (refModels.length === 1) {
    const { created, name: nameModelResponseTransformer } =
      ensureModelResponseTransformerExists({ ...props, model: refModels[0]! });

    if (!created) {
      return [];
    }

    return [
      tsc.transformArrayMutation({
        path: props.path,
        transformerName: nameModelResponseTransformer,
      }),
    ];
  }

  if (
    isModelDate(model) ||
    (model.link &&
      !Array.isArray(model.link) &&
      model.link.export === 'any-of' &&
      model.link.properties.find((property) => isModelDate(property)))
  ) {
    return [
      tsc.transformArrayMap({
        path: props.path,
        transformExpression: tsc.conditionalExpression({
          condition: tsc.identifier({ text: 'item' }),
          whenFalse: tsc.identifier({ text: 'item' }),
          whenTrue: tsc.transformNewDate({
            parameterName: 'item',
          }),
        }),
      }),
    ];
  }

  // Not transform for this type
  return [];
};

const processProperty = (props: ModelProps) => {
  const { model } = props;
  const path = [...props.path, model.name];

  if (
    model.type === 'string' &&
    model.export !== 'array' &&
    isModelDate(model)
  ) {
    return [tsc.transformDateMutation({ path })];
  }

  // otherwise we recurse in case it's an object/array, and if it's not that will just bail with []
  return processModel({
    ...props,
    model,
    path,
  });
};

const processModel = (props: ModelProps): ts.Statement[] => {
  const { model } = props;

  switch (model.export) {
    case 'array':
      return processArray(props);
    case 'interface':
      return model.properties.flatMap((property) =>
        processProperty({ ...props, model: property }),
      );
    case 'reference': {
      if (model.$refs.length !== 1) {
        return [];
      }
      const refModels = getRefModels(props);

      const { created, name: nameModelResponseTransformer } =
        ensureModelResponseTransformerExists({
          ...props,
          model: refModels[0]!,
        });

      if (!created) {
        return [];
      }

      return model.in === 'response'
        ? [
            tsc.expressionToStatement({
              expression: tsc.callExpression({
                functionName: nameModelResponseTransformer,
                parameters: [dataVariableName],
              }),
            }),
          ]
        : tsc.transformFunctionMutation({
            path: props.path,
            transformerName: nameModelResponseTransformer,
          });
    }
    // unsupported
    default:
      return [];
  }
};

const generateResponseTransformer = ({
  async,
  client,
  name,
  onNode,
  onRemoveNode,
  statements,
}: Pick<TypesProps, 'client' | 'onNode' | 'onRemoveNode'> & {
  async: boolean;
  name: string;
  statements: Array<ts.Statement>;
}) => {
  const result = {
    created: false,
    name,
  };

  if (!statements.length) {
    // clean up created type for response transformer if it turns out
    // the transformer was never generated
    unsetUniqueTypeName({
      client,
      name,
    });
    onRemoveNode?.();
    return result;
  }

  const expression = tsc.arrowFunction({
    async,
    multiLine: true,
    parameters: [
      {
        name: dataVariableName,
      },
    ],
    statements: [
      ...statements,
      tsc.returnVariable({
        expression: dataVariableName,
      }),
    ],
  });
  const statement = tsc.constVariable({
    exportConst: true,
    expression,
    name,
    typeName: name,
  });
  onNode(statement);

  return {
    created: true,
    name,
  };
};

// handles only response transformers for now
export const handlerLegacy: HeyApiTransformersPlugin['LegacyHandler'] = ({
  client,
  files,
}) => {
  const config = getConfig();

  const onNode: TypesProps['onNode'] = (node) => {
    files.types?.add(node);
  };
  const onRemoveNode: TypesProps['onRemoveNode'] = () => {
    files.types?.removeNode_LEGACY();
  };

  for (const service of client.services) {
    for (const operation of service.operations) {
      const successResponses = operation.responses.filter((response) =>
        response.responseTypes.includes('success'),
      );

      if (!successResponses.length) {
        continue;
      }

      const nonVoidResponses = successResponses.filter(
        (response) => !isVoidResponse(response),
      );

      if (!nonVoidResponses.length) {
        continue;
      }

      if (nonVoidResponses.length > 1) {
        if (config.logs.level === 'debug') {
          console.warn(
            `❗️ Transformers warning: route ${createOperationKey(operation)} has ${nonVoidResponses.length} non-void success responses. This is currently not handled and we will not generate a response transformer. Please open an issue if you'd like this feature https://github.com/hey-api/openapi-ts/issues`,
          );
        }
        continue;
      }

      const name = operationResponseTypeName(operation.name);
      generateType({
        client,
        meta: {
          $ref: `transformers/${name}`,
          name,
        },
        nameTransformer: operationResponseTransformerTypeName,
        onCreated: (nameCreated) => {
          const statements =
            successResponses.length > 1
              ? successResponses.flatMap((response) => {
                  const statements = processModel({
                    client,
                    meta: {
                      $ref: `transformers/${name}`,
                      name,
                    },
                    model: response,
                    onNode,
                    onRemoveNode,
                    path: [dataVariableName],
                  });

                  // assume unprocessed responses are void
                  if (!statements.length) {
                    return [];
                  }

                  return [
                    tsc.ifStatement({
                      expression: tsc.safeAccessExpression(['data']),
                      thenStatement: tsc.block({ statements }),
                    }),
                  ];
                })
              : processModel({
                  client,
                  meta: {
                    $ref: `transformers/${name}`,
                    name,
                  },
                  model: successResponses[0]!,
                  onNode,
                  onRemoveNode,
                  path: [dataVariableName],
                });
          generateResponseTransformer({
            async: true,
            client,
            name: nameCreated,
            onNode,
            onRemoveNode,
            statements,
          });
        },
        onNode,
        type: `(${dataVariableName}: any) => Promise<${name}>`,
      });
    }
  }
};

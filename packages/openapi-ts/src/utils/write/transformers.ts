import ts from 'typescript';

import { compiler } from '../../compiler';
import type {
  ModelMeta,
  OperationResponse,
} from '../../openApi/common/interfaces/client';
import { getSuccessResponses } from '../../openApi/common/parser/operation';
import { getConfig } from '../config';
import {
  modelResponseTransformerTypeName,
  operationResponseTransformerTypeName,
  operationResponseTypeName,
} from './services';
import { unsetUniqueTypeName } from './type';
import { generateType, type TypesProps } from './types';

interface ModelProps extends TypesProps {
  path: Array<string>;
  meta?: ModelMeta;
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
      ensureModelResponseTransformerExists({ ...props, model: refModels[0] });

    if (!created) {
      return [];
    }

    return [
      compiler.transform.arrayTransformMutation({
        path: props.path,
        transformerName: nameModelResponseTransformer,
      }),
    ];
  }

  if (model.format === 'date' || model.format === 'date-time') {
    return [
      compiler.transform.mapArray({
        path: props.path,
        transformExpression: compiler.transform.newDate({
          parameterName: 'item',
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
    (model.format === 'date-time' || model.format === 'date')
  ) {
    return [compiler.transform.dateTransformMutation({ path })];
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
        ensureModelResponseTransformerExists({ ...props, model: refModels[0] });

      if (!created) {
        return [];
      }

      return model.in === 'response'
        ? [
            compiler.convert.expressionToStatement({
              expression: compiler.function.call({
                functionName: nameModelResponseTransformer,
                parameters: [dataVariableName],
              }),
            }),
          ]
        : compiler.transform.transformItem({
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

  const expression = compiler.types.function({
    async,
    multiLine: true,
    parameters: [
      {
        name: dataVariableName,
      },
    ],
    statements: [
      ...statements,
      compiler.return.statement({
        expression: ts.factory.createIdentifier(dataVariableName),
      }),
    ],
  });
  const statement = compiler.export.const({
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

export const processResponseTransformers = async ({
  client,
  onNode,
  onRemoveNode,
}: Pick<TypesProps, 'client' | 'onNode' | 'onRemoveNode'>) => {
  const config = getConfig();

  for (const service of client.services) {
    for (const operation of service.operations) {
      const hasRes = operation.results.length;

      if (!hasRes) {
        continue;
      }

      const responses = getSuccessResponses(operation.results);

      const nonVoidResponses = responses.filter(
        (response) => !isVoidResponse(response),
      );

      if (!nonVoidResponses.length) {
        continue;
      }

      if (nonVoidResponses.length > 1) {
        if (config.debug) {
          console.warn(
            `⚠️ Transformers warning: route ${operation.method} ${operation.path} has ${responses.length} success responses. This is currently not handled and we will not generate a response transformer. Please open an issue if you'd like this feature https://github.com/hey-api/openapi-ts/issues`,
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
            responses.length > 1
              ? responses.flatMap((response) => {
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
                    compiler.logic.if({
                      expression: compiler.logic.safeAccess(['data']),
                      thenStatement: ts.factory.createBlock(statements),
                    }),
                  ];
                })
              : processModel({
                  client,
                  meta: {
                    $ref: `transformers/${name}`,
                    name,
                  },
                  model: operation.results[0],
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

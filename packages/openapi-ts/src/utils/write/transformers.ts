import ts from 'typescript';

import { compiler } from '../../compiler';
import type { ModelMeta } from '../../openApi/common/interfaces/client';
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

const ensureModelResponseTransformerExists = ({
  client,
  model,
  onNode,
  onRemoveNode,
}: Omit<ModelProps, 'path'>) => {
  const modelName = model.meta!.name;

  const { name } = generateType({
    client,
    meta: {
      $ref: `transformers/${modelName}`,
      name: modelName,
    },
    nameTransformer: modelResponseTransformerTypeName,
    onCreated: (name) => {
      const statements = processModel({
        client,
        meta: {
          $ref: `transformers/${modelName}`,
          name,
        },
        model,
        onNode,
        onRemoveNode,
        path: [dataVariableName],
      });
      generateResponseTransformer({
        client,
        name,
        onNode,
        onRemoveNode,
        statements,
      });
    },
    onNode,
    type: `(${dataVariableName}: any) => ${modelName}`,
  });

  const result = {
    created: Boolean(client.types[name]),
    name,
  };
  return result;
};

const processArray = ({
  client,
  model,
  onNode,
  onRemoveNode,
  path,
}: ModelProps) => {
  const refModels = getRefModels({ client, model });

  if (refModels.length === 1) {
    const { created, name: nameModelResponseTransformer } =
      ensureModelResponseTransformerExists({
        client,
        model: refModels[0],
        onNode,
        onRemoveNode,
      });

    if (!created) {
      return [];
    }

    return [
      compiler.transform.arrayTransformMutation({
        path,
        transformerName: nameModelResponseTransformer,
      }),
    ];
  }

  if (model.format === 'date' || model.format === 'date-time') {
    return [
      compiler.transform.mapArray({
        path,
        transformExpression: compiler.transform.newDate({
          parameterName: 'item',
        }),
      }),
    ];
  }

  // Not transform for this type
  return [];
};

const processProperty = ({
  client,
  model,
  onNode,
  onRemoveNode,
  path,
  meta,
}: ModelProps) => {
  const pathProperty = [...path, model.name];

  if (
    model.type === 'string' &&
    model.export !== 'array' &&
    (model.format === 'date-time' || model.format === 'date')
  ) {
    return [compiler.transform.dateTransformMutation({ path: pathProperty })];
  }

  // otherwise we recurse in case it's an object/array, and if it's not that will just bail with []
  return processModel({
    client,
    meta,
    model,
    onNode,
    onRemoveNode,
    path: pathProperty,
  });
};

const processModel = ({
  client,
  model,
  meta,
  onNode,
  onRemoveNode,
  path,
}: ModelProps): ts.Statement[] => {
  switch (model.export) {
    case 'array': {
      return processArray({
        client,
        meta,
        model,
        onNode,
        onRemoveNode,
        path,
      });
    }
    case 'interface': {
      const statements = model.properties.flatMap((property) =>
        processProperty({
          client,
          meta,
          model: property,
          onNode,
          onRemoveNode,
          path,
        }),
      );

      return statements;
    }
    case 'reference': {
      if (model.$refs.length !== 1) {
        return [];
      }
      const refModels = getRefModels({ client, model });

      const { created, name: nameModelResponseTransformer } =
        ensureModelResponseTransformerExists({
          client,
          model: refModels[0],
          onNode,
          onRemoveNode,
        });

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
            path,
            transformerName: nameModelResponseTransformer,
          });
    }
    default:
      // Unsupported
      return [];
  }
};

const generateResponseTransformer = ({
  client,
  name,
  onNode,
  onRemoveNode,
  statements,
}: Pick<TypesProps, 'client' | 'onNode' | 'onRemoveNode'> & {
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

      if (!responses.length) {
        continue;
      }

      if (responses.length > 1) {
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
          const statements = processModel({
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
            client,
            name: nameCreated,
            onNode,
            onRemoveNode,
            statements,
          });
        },
        onNode,
        type: `(${dataVariableName}: any) => ${name}`,
      });
    }
  }
};

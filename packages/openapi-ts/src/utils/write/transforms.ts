import ts from 'typescript';

import { compiler } from '../../compiler';
import type { Model } from '../../openApi';
import type { Client } from '../../types/client';

type OnNode = (node: ts.Node) => void;

export const generateTransform = (
  client: Client,
  model: Model,
  onNode: OnNode,
) => {
  // Ignore if transforms are disabled or the transform has been already created
  if (!model.meta || model.meta.hasTransformer) {
    return;
  }

  const generateForProperty = (rootPath: string[], property: Model) => {
    const localPath = [...rootPath, property.name];

    if (
      property.type === 'string' &&
      property.export !== 'array' &&
      (property.format === 'date-time' || property.format === 'date')
    ) {
      return [
        compiler.transform.dateTransformMutation({
          path: localPath,
        }),
      ];
    } else {
      // otherwise we recurse in case it's an object/array, and if it's not that will just bail with []
      return generateForModel(localPath, property);
    }
  };

  const generateForArray = (
    localPath: string[],
    localModel: Model,
    refModels: Model[],
  ) => {
    if (localModel.export !== 'array') {
      throw new Error(
        'generateForArray should only be called with array models',
      );
    }

    if (refModels.length === 1) {
      const refModel = refModels[0];

      if (client.types[refModel.meta!.name].hasTransformer) {
        return [
          compiler.transform.arrayTransformMutation({
            path: localPath,
            transformer: refModel.meta!.name,
          }),
        ];
      } else {
        // We do not currently support union types for transforms since discriminating them is a challenge
        return [];
      }
    }

    if (localModel.format === 'date' || localModel.format === 'date-time') {
      return [
        compiler.transform.mapArray({
          path: localPath,
          transformExpression: compiler.transform.newDate({
            parameterName: 'item',
          }),
        }),
      ];
    }

    // Not transform for this type
    return [];
  };

  const generateForReference = (localPath: string[], refModels: Model[]) => {
    if (
      refModels.length !== 1 ||
      client.types[refModels[0].meta!.name].hasTransformer !== true
    ) {
      return [];
    }

    return compiler.transform.transformItem({
      path: localPath,
      transformer: refModels[0].meta!.name,
    });
  };

  const generateForModel = (
    localPath: string[],
    model: Model,
  ): ts.Statement[] => {
    const refModels = model.$refs.map((ref) => {
      const refModel = client.models.find((m) => m.meta?.$ref === ref);
      if (!refModel) {
        throw new Error(
          `Model ${ref} could not be found when building ref transform`,
        );
      }
      return refModel;
    });

    switch (model.export) {
      case 'reference':
        return generateForReference(localPath, refModels);
      case 'interface':
        return model.properties.flatMap((property) =>
          generateForProperty(localPath, property),
        );
      case 'array':
        return generateForArray(localPath, model, refModels);

      default:
        // Unsupported
        return [];
    }
  };

  const statements = generateForModel(['data'], model);
  if (!statements.length) {
    return;
  }

  const transformFunction = compiler.transform.transformMutationFunction({
    modelName: model.meta.name,
    statements,
  });

  client.types[model.meta.name].hasTransformer = true;

  onNode(transformFunction);
};

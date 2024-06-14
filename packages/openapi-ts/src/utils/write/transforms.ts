import ts from 'typescript';

import { compiler } from '../../compiler';
import type { Model } from '../../openApi';
import type { Client } from '../../types/client';
import { getConfig } from '../config';

type OnNode = (node: ts.Node) => void;

export const generateTransform = (
  client: Client,
  model: Model,
  onNode: OnNode,
) => {
  const config = getConfig();
  if (config.types.dates === 'types+transform') {
    if (model.meta?.hasTransformer) {
      // Transform already created (maybe the model is used in other models) so we just bail here
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

    function generateForArray(
      localPath: string[],
      localModel: Model,
      refModels: Model[],
    ) {
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
    }

    function generateForReference(localPath: string[], refModels: Model[]) {
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
    }

    function generateForModel(
      localPath: string[],
      localModel: Model,
    ): ts.Statement[] {
      // We pre-transform refs (if any) so that they can be referenced in this transform
      const refModels = localModel.$refs.map((ref) => {
        const refModel = client.models.find((m) => m.meta!.$ref === ref);
        if (!refModel) {
          throw new Error(
            `Model ${ref} could not be founded when building ref transform`,
          );
        }

        generateTransform(client, refModel, onNode);

        return refModel;
      });

      switch (localModel.export) {
        case 'reference':
          return generateForReference(localPath, refModels);
        case 'interface':
          return localModel.properties.flatMap((property) =>
            generateForProperty(localPath, property),
          );
        case 'array':
          return generateForArray(localPath, localModel, refModels);

        default:
          // Unsupported
          return [];
      }
    }

    const transformStatements = generateForModel(['data'], model);
    if (transformStatements.length > 0) {
      const transformFunction = compiler.transform.transformMutationFunction({
        modelName: model.name,
        statements: transformStatements,
      });

      client.types[model.meta!.name].hasTransformer = true;

      onNode(transformFunction);
    }
  }
};

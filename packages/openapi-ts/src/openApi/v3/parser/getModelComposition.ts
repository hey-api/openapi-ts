import type { Model, ModelComposition } from '../../common/interfaces/client';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import type { getModel } from './getModel';
import { getModelProperties } from './getModelProperties';
import { getRequiredPropertiesFromComposition } from './getRequiredPropertiesFromComposition';

// Fix for circular dependency
export type GetModelFn = typeof getModel;

type Composition = {
  definitions: OpenApiSchema[];
  type: ModelComposition['export'];
};

export const findModelComposition = (
  definition: OpenApiSchema,
): Composition | undefined => {
  const compositions: ReadonlyArray<{
    definitions: Composition['definitions'] | undefined;
    type: Composition['type'];
  }> = [
    {
      definitions: definition.allOf,
      type: 'all-of',
    },
    {
      definitions: definition.anyOf,
      type: 'any-of',
    },
    {
      definitions: definition.oneOf,
      type: 'one-of',
    },
  ];
  return compositions.find(
    (composition) => composition.definitions?.length,
  ) as ReturnType<typeof findModelComposition>;
};

export const getModelComposition = ({
  definition,
  definitions,
  getModel,
  model,
  openApi,
  type,
}: Composition & {
  definition: OpenApiSchema;
  getModel: GetModelFn;
  model: Model;
  openApi: OpenApi;
}): ModelComposition => {
  const composition: ModelComposition = {
    $refs: model.$refs,
    enums: model.enums,
    export: type,
    imports: model.imports,
    properties: model.properties,
  };

  const properties: Model[] = [];

  definitions
    .map((def) =>
      getModel({ definition: def, openApi, parentDefinition: definition }),
    )
    .forEach((model) => {
      composition.$refs = [...composition.$refs, ...model.$refs];
      composition.imports = [...composition.imports, ...model.imports];
      composition.enums.push(...model.enums);
      composition.properties.push(model);
    });

  if (definition.required) {
    const requiredProperties = getRequiredPropertiesFromComposition(
      openApi,
      definition.required,
      definitions,
      getModel,
    );
    requiredProperties.forEach((requiredProperty) => {
      composition.$refs = [...composition.$refs, ...requiredProperty.$refs];
      composition.imports = [
        ...composition.imports,
        ...requiredProperty.imports,
      ];
      composition.enums.push(...requiredProperty.enums);
    });
    properties.push(...requiredProperties);
  }

  if (definition.properties) {
    const modelProperties = getModelProperties(openApi, definition, getModel);
    modelProperties.forEach((modelProperty) => {
      composition.$refs = [...composition.$refs, ...modelProperty.$refs];
      composition.imports = [...composition.imports, ...modelProperty.imports];
      composition.enums.push(...modelProperty.enums);
      if (modelProperty.export === 'enum') {
        composition.enums.push(modelProperty);
      }
    });
    properties.push(...modelProperties);
  }

  if (properties.length) {
    const foundComposition = findModelComposition(definition);
    if (foundComposition?.type === 'one-of') {
      composition.properties.forEach((property) => {
        property.properties.push(...properties);
      });
    } else {
      composition.properties.push({
        $refs: [],
        base: 'unknown',
        description: '',
        enum: [],
        enums: [],
        export: 'interface',
        imports: [],
        isDefinition: false,
        isNullable: false,
        isReadOnly: false,
        isRequired: false,
        link: null,
        name: 'properties',
        properties,
        template: null,
        type: 'unknown',
      });
    }
  }

  return composition;
};

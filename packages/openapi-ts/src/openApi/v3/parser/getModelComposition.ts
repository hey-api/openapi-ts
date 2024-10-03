import type { Client } from '../../../types/client';
import type { Model, ModelComposition } from '../../common/interfaces/client';
import type { GetModelFn } from '../interfaces/Model';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { getModelProperties } from './getModelProperties';
import { getRequiredPropertiesFromComposition } from './getRequiredPropertiesFromComposition';

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
  debug,
  definition,
  definitions,
  getModel,
  model,
  openApi,
  type,
  types,
}: Composition &
  Pick<Client, 'types'> & {
    debug?: boolean;
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

  let properties: Model[] = [];

  definitions
    .map((def) => {
      const modelFromDef = getModel({
        debug,
        definition: def,
        openApi,
        parentDefinition: definition,
        types,
      });
      return modelFromDef;
    })
    .forEach((model) => {
      composition.$refs = [...composition.$refs, ...model.$refs];
      composition.imports = [...composition.imports, ...model.imports];
      composition.enums = [...composition.enums, ...model.enums];
      composition.properties = [...composition.properties, model];
    });

  if (definition.required && type === 'all-of') {
    const requiredProperties = getRequiredPropertiesFromComposition({
      debug,
      definitions,
      getModel,
      openApi,
      required: definition.required,
      types,
    });
    requiredProperties.forEach((requiredProperty) => {
      composition.$refs = [...composition.$refs, ...requiredProperty.$refs];
      composition.imports = [
        ...composition.imports,
        ...requiredProperty.imports,
      ];
      composition.enums = [...composition.enums, ...requiredProperty.enums];
    });
    properties = [...properties, ...requiredProperties];
  }

  if (definition.properties) {
    const modelProperties = getModelProperties({
      definition,
      getModel,
      openApi,
      types,
    });
    modelProperties.forEach((modelProperty) => {
      composition.$refs = [...composition.$refs, ...modelProperty.$refs];
      composition.imports = [...composition.imports, ...modelProperty.imports];
      composition.enums = [...composition.enums, ...modelProperty.enums];
      if (modelProperty.export === 'enum') {
        composition.enums = [...composition.enums, modelProperty];
      }
    });
    properties = [...properties, ...modelProperties];
  }

  if (properties.length) {
    const foundComposition = findModelComposition(definition);
    if (foundComposition) {
      const propertiesProperty: Model = {
        $refs: [],
        base: 'unknown',
        description: '',
        enum: [],
        enums: [],
        export: 'interface',
        imports: [],
        in: '',
        isDefinition: false,
        isNullable: false,
        isReadOnly: false,
        isRequired: false,
        link: null,
        name: 'properties',
        properties,
        template: null,
        type: 'unknown',
      };

      if (foundComposition.type === 'one-of') {
        composition.properties = [
          {
            ...composition,
            base: '',
            description: null,
            enum: [],
            in: '',
            isDefinition: false,
            isNullable: false,
            isReadOnly: false,
            isRequired: true,
            link: null,
            name: '',
            template: null,
            type: '',
          },
          propertiesProperty,
        ];
        composition.export = 'all-of';
      } else {
        composition.properties = [
          ...composition.properties,
          propertiesProperty,
        ];
      }
    }
  }

  return composition;
};

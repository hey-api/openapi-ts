import type { Model } from '../../common/interfaces/client';
import type { Dictionary } from '../../common/interfaces/Dictionary';
import { stripNamespace } from '../../common/parser/stripNamespace';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiDiscriminator } from '../interfaces/OpenApiDiscriminator';

const inverseDictionary = (map: Dictionary<string>): Dictionary<string> => {
  const m2: Dictionary<string> = {};
  for (const name in map) {
    m2[map[name]!] = name;
  }
  return m2;
};

export const findOneOfParentDiscriminator = (
  openApi: OpenApi,
  parent?: Model,
): OpenApiDiscriminator | undefined => {
  if (openApi.components && parent) {
    for (const definitionName in openApi.components.schemas) {
      if (openApi.components.schemas.hasOwnProperty(definitionName)) {
        const schema = openApi.components.schemas[definitionName]!;
        if (
          schema.discriminator &&
          schema.oneOf?.length &&
          schema.oneOf.some(
            (definition) =>
              definition.$ref && stripNamespace(definition.$ref) == parent.name,
          )
        ) {
          return schema.discriminator;
        }
      }
    }
  }
  return undefined;
};

export const mapPropertyValue = (
  discriminator: OpenApiDiscriminator,
  parent: Model,
): string => {
  if (discriminator.mapping) {
    const mapping = inverseDictionary(discriminator.mapping);
    const key = Object.keys(mapping).find(
      (item) => stripNamespace(item) == parent.name,
    );
    if (key && mapping[key]) {
      return mapping[key];
    }
  }
  return parent.name;
};

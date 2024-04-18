import type { Model } from '../../common/interfaces/client'
import { getRef } from '../../common/parser/getRef'
import type { OpenApi } from '../interfaces/OpenApi'
import type { OpenApiSchema } from '../interfaces/OpenApiSchema'
import type { getModel } from './getModel'

// Fix for circular dependency
export type GetModelFn = typeof getModel

export const getRequiredPropertiesFromComposition = (
  openApi: OpenApi,
  required: string[],
  definitions: OpenApiSchema[],
  getModel: GetModelFn
): Model[] =>
  definitions
    .reduce((properties, definition) => {
      if (definition.$ref) {
        const schema = getRef<OpenApiSchema>(openApi, definition)
        return [...properties, ...getModel(openApi, schema).properties]
      }
      return [...properties, ...getModel(openApi, definition).properties]
    }, [] as Model[])
    .filter(
      property => !property.isRequired && required.includes(property.name)
    )
    .map(property => ({
      ...property,
      isRequired: true
    }))

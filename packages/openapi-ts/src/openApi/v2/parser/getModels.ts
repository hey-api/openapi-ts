import type { Model } from '../../common/interfaces/client'
import { reservedWords } from '../../common/parser/reservedWords'
import { getType } from '../../common/parser/type'
import type { OpenApi } from '../interfaces/OpenApi'
import { getModel } from './getModel'

export const getModels = (openApi: OpenApi): Model[] => {
  const models: Model[] = []
  for (const definitionName in openApi.definitions) {
    if (openApi.definitions.hasOwnProperty(definitionName)) {
      const definition = openApi.definitions[definitionName]
      const definitionType = getType(definitionName)
      const model = getModel(
        openApi,
        definition,
        true,
        definitionType.base.replace(reservedWords, '_$1')
      )
      models.push(model)
    }
  }
  return models
}

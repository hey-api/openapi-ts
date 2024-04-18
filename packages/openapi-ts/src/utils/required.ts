import { Model, OperationParameter } from '../openApi'
import { getConfig } from './config'

export const getDefaultPrintable = (
  p: OperationParameter | Model
): string | undefined => {
  if (p.default === undefined) {
    return undefined
  }
  return JSON.stringify(p.default, null, 4)
}

export const modelIsRequired = (model: Model) => {
  const config = getConfig()
  if (config?.useOptions) {
    return model.isRequired ? '' : '?'
  }
  return !model.isRequired && !getDefaultPrintable(model) ? '?' : ''
}

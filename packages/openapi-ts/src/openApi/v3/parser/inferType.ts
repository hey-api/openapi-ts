import type { OpenApiSchema } from '../interfaces/OpenApiSchema'

export const inferType = (definition: OpenApiSchema) => {
  if (definition.enum && definition.type !== 'boolean') {
    return 'enum'
  }
  return undefined
}

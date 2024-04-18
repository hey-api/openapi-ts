import { Model, Service } from '../openApi'

export interface Client {
  enumNames: string[]
  models: Model[]
  server: string
  services: Service[]
  version: string
}

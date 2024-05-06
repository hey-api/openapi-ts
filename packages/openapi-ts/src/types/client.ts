import { Model, Service } from '../openApi';
import type { ModelMeta } from '../openApi/common/interfaces/client';

export interface Client {
  models: Model[];
  server: string;
  services: Service[];
  /**
   * Map of generated types, keys are type names
   */
  types: Record<string, ModelMeta>;
  version: string;
}

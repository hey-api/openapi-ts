import { Model, Service } from '../openApi';
import type { ModelMeta } from '../openApi/common/interfaces/client';

export interface Client {
  models: Model[];
  /**
   * Map of unique operation IDs where operation IDs are keys. The values
   * are endpoints in the `${method} ${path}` format. This is used to detect
   * duplicate operation IDs in the specification.
   */
  operationIds: Map<string, string>;
  server: string;
  services: Service[];
  /**
   * Map of generated types where type names are keys. This is used to track
   * uniquely generated types as we may want to deduplicate if there are
   * multiple definitions with the same name but different value, or if we
   * want to transform names.
   */
  types: Record<string, ModelMeta>;
  version: string;
}

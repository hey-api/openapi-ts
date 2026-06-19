import type { IR } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import type { Type } from './shared/types';
import type { HeyApiTypeScriptPlugin } from './types';
import { createProcessor } from './v1/processor';

export type IApi = {
  schemaToType: (plugin: HeyApiTypeScriptPlugin['Instance'], schema: IR.SchemaObject) => Type;
};

export class Api implements IApi {
  schemaToType(plugin: HeyApiTypeScriptPlugin['Instance'], schema: IR.SchemaObject): Type {
    const processor = createProcessor(plugin);
    const result = processor.process({
      export: false,
      meta: {
        resource: 'definition',
        resourceId: '',
      },
      naming: plugin.config.definitions,
      path: [],
      plugin,
      schema,
    });

    if (!result) {
      return $.type(plugin.config.topType);
    }
    return result.type;
  }
}

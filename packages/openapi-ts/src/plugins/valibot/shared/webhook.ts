import type { IR } from '@hey-api/shared';

import { buildOperationSchema } from './operation-schema';
import type { ProcessorContext, ProcessorResult } from './processor';
import type { IrSchemaToAstOptions } from './types';

export function irWebhookToAst({
  operation,
  path,
  plugin,
  processor,
  tags,
}: Pick<IrSchemaToAstOptions, 'plugin'> &
  Pick<ProcessorContext, 'path' | 'tags'> & {
    operation: IR.OperationObject;
    processor: ProcessorResult;
  }): void {
  if (plugin.config.webhooks.enabled) {
    const { schema } = buildOperationSchema(operation);

    processor.process({
      meta: {
        resource: 'webhook',
        resourceId: operation.id,
        role: 'data',
      },
      naming: plugin.config.webhooks,
      namingAnchor: operation.id,
      path,
      plugin,
      schema,
      tags,
    });
  }
}

import type { IR } from '@hey-api/shared';
import { operationResponsesMap } from '@hey-api/shared';

import { buildOperationSchema } from './operation-schema';
import type { ProcessorContext, ProcessorResult } from './processor';

export function irOperationToAst({
  operation,
  path,
  plugin,
  processor,
  tags,
}: Pick<ProcessorContext, 'path' | 'plugin' | 'tags'> & {
  operation: IR.OperationObject;
  processor: ProcessorResult;
}): void {
  if (plugin.config.requests.enabled) {
    const { schema } = buildOperationSchema(operation);

    processor.process({
      meta: {
        resource: 'operation',
        resourceId: operation.id,
        role: 'data',
      },
      naming: plugin.config.requests,
      namingAnchor: operation.id,
      path,
      plugin,
      schema,
      tags,
    });
  }

  if (plugin.config.responses.enabled) {
    if (operation.responses) {
      const { response } = operationResponsesMap(operation);

      if (response) {
        processor.process({
          meta: {
            resource: 'operation',
            resourceId: operation.id,
            role: 'responses',
          },
          naming: plugin.config.responses,
          namingAnchor: operation.id,
          path: [...path, 'responses'],
          plugin,
          schema: response,
          tags,
        });
      }
    }
  }
}

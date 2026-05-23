import type { IR } from '@hey-api/shared';
import type ts from 'typescript';

import { $, type TsDsl } from '../../../../ts-dsl';
import type { HeyApiSdkPlugin } from '../types';

type MetadataFn = TsDsl<ts.Expression>;

function createResponseSchema(args: {
  operation: IR.OperationObject;
  plugin: HeyApiSdkPlugin['Instance'];
}) {
  const { operation, plugin } = args;
  if (!plugin.config.validator.response) return;

  const query = {
    category: 'schema' as const,
    resource: 'operation' as const,
    resourceId: operation.id,
    role: 'responses' as const,
    tool: plugin.config.validator.response,
  };

  if (!plugin.isSymbolRegistered(query)) return;

  return plugin.referenceSymbol(query);
}

export function createMetadataObject(args: {
  operation: IR.OperationObject;
  plugin: HeyApiSdkPlugin['Instance'];
  tags?: ReadonlyArray<string>;
}) {
  const { operation, plugin, tags } = args;
  const responseSchema = createResponseSchema({ operation, plugin });
  const metadata = plugin.config.metadata;

  return $.object()
    .$if(metadata.id, (o) => o.prop('id', $.literal(operation.id)))
    .$if(metadata.method, (o) => o.prop('method', $.literal(operation.method)))
    .$if(metadata.responseSchema && responseSchema, (o, v) => o.prop('responseSchema', v))
    .$if(metadata.tags && Boolean(tags?.length) && tags, (o, v) =>
      o.prop('tags', $.array().elements(...v)),
    )
    .$if(metadata.url, (o) => o.prop('url', $.literal(operation.path)));
}

export function withMetadata(args: {
  fn: MetadataFn;
  operation: IR.OperationObject;
  plugin: HeyApiSdkPlugin['Instance'];
  tags?: ReadonlyArray<string>;
}): ReturnType<typeof $.call> {
  const { fn, operation, plugin, tags } = args;

  return $('Object').attr('assign').call(
    fn,
    createMetadataObject({
      operation,
      plugin,
      tags,
    }),
  );
}

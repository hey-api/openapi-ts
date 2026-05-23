import type { IR } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { HeyApiSdkPlugin } from '../types';

function createRequestSchema(args: {
  operation: IR.OperationObject;
  plugin: HeyApiSdkPlugin['Instance'];
}) {
  const { operation, plugin } = args;
  if (!plugin.config.validator.request) return;

  const validator = plugin.getPluginOrThrow(plugin.config.validator.request);
  if (!validator.api || !('createRequestSchema' in validator.api)) return;

  return validator.api.createRequestSchema({
    layers: {
      body: { whenEmpty: 'omit' },
      headers: { whenEmpty: 'omit' },
      path: { as: 'params', whenEmpty: 'omit' },
      query: { whenEmpty: 'omit' },
    },
    operation,
    // @ts-expect-error validator plugin instance type is narrowed by config
    plugin: validator,
  });
}

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
  const requestSchema = createRequestSchema({ operation, plugin });
  const responseSchema = createResponseSchema({ operation, plugin });
  const metadata = plugin.config.metadata;

  return $.object()
    .$if(metadata.id, (o) => o.prop('id', $.literal(operation.id)))
    .$if(metadata.method, (o) => o.prop('method', $.literal(operation.method)))
    .$if(metadata.requestSchema && requestSchema, (o, v) => o.prop('requestSchema', v))
    .$if(metadata.responseSchema && responseSchema, (o, v) => o.prop('responseSchema', v))
    .$if(metadata.tags && Boolean(tags?.length) && tags, (o, v) =>
      o.prop('tags', $.array().elements(...v)),
    )
    .$if(metadata.url, (o) => o.prop('url', $.literal(operation.path)));
}

export function withMetadata(args: {
  fn: ReturnType<typeof $.func>;
  operation: IR.OperationObject;
  plugin: HeyApiSdkPlugin['Instance'];
  tags?: ReadonlyArray<string>;
}) {
  const { fn, operation, plugin, tags } = args;

  return $('Object').attr('assign').call(fn, createMetadataObject({ operation, plugin, tags }));
}

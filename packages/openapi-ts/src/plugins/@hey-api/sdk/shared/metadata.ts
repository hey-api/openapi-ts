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
}) {
  const { operation, plugin } = args;
  const requestSchema = createRequestSchema({ operation, plugin });
  const responseSchema = createResponseSchema({ operation, plugin });

  return $.object()
    .prop('id', $.literal(operation.id))
    .prop('method', $.literal(operation.method))
    .$if(requestSchema, (o, v) => o.prop('requestSchema', v))
    .$if(responseSchema, (o, v) => o.prop('responseSchema', v))
    .$if(operation.tags?.length, (o, v) => o.prop('tags', $.fromValue(v)))
    .prop('url', $.literal(operation.path));
}

export function withMetadata(args: {
  fn: ReturnType<typeof $.func>;
  operation: IR.OperationObject;
  plugin: HeyApiSdkPlugin['Instance'];
}) {
  const { fn, operation, plugin } = args;

  return $('Object').attr('assign').call(fn, createMetadataObject({ operation, plugin }));
}

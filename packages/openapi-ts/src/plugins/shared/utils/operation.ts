import { hasOperationDataRequired } from '../../../ir/operation';
import type { IR } from '../../../ir/types';
import { getClientPlugin } from '../../@hey-api/client-core/utils';

export const isOperationOptionsRequired = ({
  context,
  operation,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
}): boolean => {
  const client = getClientPlugin(context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';
  const plugin = context.config.plugins['@hey-api/sdk'];
  return (
    (plugin && !plugin.config.client && !plugin.config.instance) ||
    isNuxtClient ||
    hasOperationDataRequired(operation)
  );
};

export const hasOperationSse = ({
  operation,
}: {
  operation: IR.OperationObject;
}): boolean => {
  for (const statusCode in operation.responses) {
    const response = operation.responses[statusCode]!;
    if (response.mediaType === 'text/event-stream') {
      return true;
    }
  }
  return false;
};

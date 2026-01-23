import type { Context, IR } from '@hey-api/shared';
import { escapeComment, hasOperationDataRequired } from '@hey-api/shared';

import { getTypedConfig } from '~/config/utils';
import { getClientPlugin } from '~/plugins/@hey-api/client-core/utils';
import type { HeyApiSdkPlugin } from '~/plugins/@hey-api/sdk';
import { isInstance } from '~/plugins/@hey-api/sdk/v1/node';

export function createOperationComment(
  operation: IR.OperationObject,
): ReadonlyArray<string> | undefined {
  const comments: Array<string> = [];

  if (operation.summary) {
    comments.push(escapeComment(operation.summary));
  }

  if (operation.description) {
    if (comments.length) {
      comments.push(''); // Add an empty line between summary and description
    }

    comments.push(escapeComment(operation.description));
  }

  if (operation.deprecated) {
    if (comments.length) {
      comments.push(''); // Add an empty line before deprecated
    }

    comments.push('@deprecated');
  }

  return comments.length ? comments : undefined;
}

/**
 * TODO: replace with plugin logic...
 *
 * @deprecated this needs to be refactored
 */
export function isOperationOptionsRequired({
  context,
  operation,
}: {
  context: Context;
  operation: IR.OperationObject;
}): boolean {
  const config = getTypedConfig(context);
  const client = getClientPlugin(config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';
  const plugin = config.plugins['@hey-api/sdk'];
  if (plugin) {
    if (
      !plugin.config.client &&
      !isInstance(plugin as unknown as HeyApiSdkPlugin['Instance'])
    ) {
      return true;
    }
    if (plugin.config.paramsStructure === 'flat') {
      return false;
    }
  }
  return isNuxtClient || hasOperationDataRequired(operation);
}

export function hasOperationSse({
  operation,
}: {
  operation: IR.OperationObject;
}): boolean {
  for (const statusCode in operation.responses) {
    const response = operation.responses[statusCode]!;
    if (response.mediaType === 'text/event-stream') {
      return true;
    }
  }
  return false;
}

import type { Context } from '~/ir/context';
import { hasOperationDataRequired } from '~/ir/operation';
import type { IR } from '~/ir/types';
import { getClientPlugin } from '~/plugins/@hey-api/client-core/utils';
import { escapeComment } from '~/utils/escape';

export const createOperationComment = (
  operation: IR.OperationObject,
): ReadonlyArray<string> | undefined => {
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
};

export const isOperationOptionsRequired = ({
  context,
  operation,
}: {
  context: Context;
  operation: IR.OperationObject;
}): boolean => {
  const client = getClientPlugin(context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';
  const plugin = context.config.plugins['@hey-api/sdk'];
  if (plugin) {
    if (!plugin.config.client && !plugin.config.instance) {
      return true;
    }
    if (plugin.config.paramsStructure === 'flat') {
      return false;
    }
  }
  return isNuxtClient || hasOperationDataRequired(operation);
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

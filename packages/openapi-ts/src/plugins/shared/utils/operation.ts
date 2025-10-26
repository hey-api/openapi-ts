import { hasOperationDataRequired } from '~/ir/operation';
import type { IR } from '~/ir/types';
import { getClientPlugin } from '~/plugins/@hey-api/client-core/utils';
import type { Comments } from '~/tsc';
import { escapeComment } from '~/utils/escape';

export const createOperationComment = ({
  operation,
}: {
  operation: IR.OperationObject;
}): Comments | undefined => {
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

  if (!comments.length) {
    return;
  }

  return comments;
};

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

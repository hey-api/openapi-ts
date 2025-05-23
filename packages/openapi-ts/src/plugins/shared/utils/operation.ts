import type { Comments } from '../../../compiler';
import { hasOperationDataRequired } from '../../../ir/operation';
import type { IR } from '../../../ir/types';
import { escapeComment } from '../../../utils/escape';
import { getClientPlugin } from '../../@hey-api/client-core/utils';

export const createOperationComment = ({
  operation,
}: {
  operation: IR.OperationObject;
}): Comments | undefined => {
  const comments: Array<string> = [];

  if (operation.deprecated) {
    comments.push('@deprecated');
  }

  if (operation.summary) {
    comments.push(escapeComment(operation.summary));
  }

  if (operation.description) {
    comments.push(escapeComment(operation.description));
  }

  return comments.length ? comments : undefined;
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
    (plugin && !plugin.client) ||
    isNuxtClient ||
    hasOperationDataRequired(operation)
  );
};

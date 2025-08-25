import { hasOperationDataRequired } from '../../../ir/operation';
import type { IR } from '../../../ir/types';
import type { Comments } from '../../../tsc';
import { escapeComment } from '../../../utils/escape';
import { getClientPlugin } from '../../@hey-api/client-core/utils';

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
    comments.push(escapeComment(operation.description));
  }

  if (operation.deprecated) {
    comments.push('@deprecated');
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
    (plugin && !plugin.config.client && !plugin.config.instance) ||
    isNuxtClient ||
    hasOperationDataRequired(operation)
  );
};

import type { IR } from '~/ir/types';
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

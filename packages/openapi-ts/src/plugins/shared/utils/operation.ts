import type { Comments } from '../../../compiler';
import type { IR } from '../../../ir/types';
import { escapeComment } from '../../../utils/escape';

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

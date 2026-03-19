import type { IR } from '@hey-api/shared';
import { escapeComment } from '@hey-api/shared';

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

    // TODO: smarter deprecation message
    comments.push('Deprecated.');
  }

  return comments.length ? comments : undefined;
}

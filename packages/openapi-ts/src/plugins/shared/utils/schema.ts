import type { IR } from '~/ir/types';
import { escapeComment } from '~/utils/escape';

export const createSchemaComment = (
  schema: IR.SchemaObject,
): ReadonlyArray<string> | undefined => {
  const comments: Array<string> = [];

  if (schema.title) {
    comments.push(escapeComment(schema.title));
  }

  if (schema.description) {
    if (comments.length) {
      comments.push(''); // Add an empty line between title and description
    }
    comments.push(escapeComment(schema.description));
  }

  if (schema.deprecated) {
    if (comments.length) {
      comments.push(''); // Add an empty line before deprecated
    }
    comments.push('@deprecated');
  }

  return comments.length ? comments : undefined;
};

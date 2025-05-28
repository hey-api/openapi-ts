import type { Comments } from '../../../compiler';
import type { IR } from '../../../ir/types';
import { escapeComment } from '../../../utils/escape';

export const createSchemaComment = ({
  schema,
}: {
  schema: IR.SchemaObject;
}): Comments | undefined => {
  const comments: Array<string> = [];

  if (schema.title) {
    comments.push(escapeComment(schema.title));
  }

  if (schema.description) {
    comments.push(escapeComment(schema.description));
  }

  if (schema.deprecated) {
    comments.push('@deprecated');
  }

  return comments.length ? comments : undefined;
};

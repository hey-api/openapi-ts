import type { PyNodeBase } from '../base';
import { PyNodeKind } from '../kinds';

export interface PyComment extends PyNodeBase {
  kind: PyNodeKind.Comment;
  text: string;
}

export function createComment(text: string): PyComment {
  return {
    kind: PyNodeKind.Comment,
    text,
  };
}

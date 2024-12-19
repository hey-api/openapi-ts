import type { IR } from './types';

export const paginationKeywordsRegExp =
  /^(after|before|cursor|offset|page|start)$/;

export interface Pagination {
  in: string;
  name: string;
  schema: IR.SchemaObject;
}

import type { IRSchemaObject } from './ir';

export const paginationKeywordsRegExp = /^(cursor|offset|page|start)/;

export interface Pagination {
  in: string;
  name: string;
  schema: IRSchemaObject;
}

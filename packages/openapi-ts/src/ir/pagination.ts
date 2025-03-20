import type { IR } from './types';

const DEFAULT_PAGINATION_KEYWORDS = [
  'after',
  'before',
  'cursor',
  'offset',
  'page',
  'start',
];

let currentPaginationKeywords = DEFAULT_PAGINATION_KEYWORDS;

export function setPaginationKeywords(
  keywords: string[] = DEFAULT_PAGINATION_KEYWORDS,
): void {
  currentPaginationKeywords = keywords;
}

export function createPaginationKeywordsRegExp(keywords?: string[]): RegExp {
  const keywordsToUse = keywords || currentPaginationKeywords;
  const pattern = `^(${keywordsToUse.join('|')})$`;
  return new RegExp(pattern);
}

let paginationKeywordsRegExp: RegExp | undefined;

export function getPaginationKeywordsRegExp(): RegExp {
  if (!paginationKeywordsRegExp) {
    paginationKeywordsRegExp = createPaginationKeywordsRegExp(
      currentPaginationKeywords,
    );
  }
  return paginationKeywordsRegExp;
}

export interface Pagination {
  in: string;
  name: string;
  schema: IR.SchemaObject;
}

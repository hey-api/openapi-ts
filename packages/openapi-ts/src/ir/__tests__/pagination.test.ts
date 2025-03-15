import { describe, expect, it } from 'vitest';

import { getPaginationKeywordsRegExp } from '../pagination';

describe('paginationKeywordsRegExp', () => {
  const scenarios: Array<{
    result: boolean;
    value: string;
  }> = [
    {
      result: true,
      value: 'after',
    },
    {
      result: true,
      value: 'before',
    },
    {
      result: true,
      value: 'cursor',
    },
    {
      result: true,
      value: 'offset',
    },
    {
      result: true,
      value: 'page',
    },
    {
      result: true,
      value: 'start',
    },
    {
      result: false,
      value: 'my_start',
    },
    {
      result: false,
      value: 'start_my',
    },
  ];

  it.each(scenarios)(
    'is $value pagination param? $output',
    async ({ result, value }) => {
      const paginationRegExp = getPaginationKeywordsRegExp();
      paginationRegExp.lastIndex = 0;
      expect(paginationRegExp.test(value)).toEqual(result);
    },
  );
});

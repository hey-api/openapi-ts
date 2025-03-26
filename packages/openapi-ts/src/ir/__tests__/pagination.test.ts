import { describe, expect, it } from 'vitest';

import type { Config } from '../../types/config';
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

  it('uses custom keywords from config', async () => {
    const config: Config = {
      input: {
        pagination: {
          keywords: ['customPagination', 'pageSize', 'perPage'],
        },
      },
    } as Config;

    const paginationRegExp = getPaginationKeywordsRegExp(config);

    // Should match custom keywords
    paginationRegExp.lastIndex = 0;
    expect(paginationRegExp.test('customPagination')).toEqual(true);
    paginationRegExp.lastIndex = 0;
    expect(paginationRegExp.test('pageSize')).toEqual(true);
    paginationRegExp.lastIndex = 0;
    expect(paginationRegExp.test('perPage')).toEqual(true);

    // Should not match default keywords
    paginationRegExp.lastIndex = 0;
    expect(paginationRegExp.test('page')).toEqual(false);
  });
});

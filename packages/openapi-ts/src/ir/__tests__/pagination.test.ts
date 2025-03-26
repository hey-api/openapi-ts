import { describe, expect, it } from 'vitest';

import type { Config } from '../../types/config';
import { getPaginationKeywordsRegExp } from '../pagination';

describe('paginationKeywordsRegExp', () => {
  const defaultScenarios: Array<{
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

  it.each(defaultScenarios)(
    'is $value pagination param? $output',
    async ({ result, value }) => {
      const paginationRegExp = getPaginationKeywordsRegExp();
      paginationRegExp.lastIndex = 0;
      expect(paginationRegExp.test(value)).toEqual(result);
    },
  );

  const customScenarios: Array<{
    result: boolean;
    value: string;
  }> = [
    { result: true, value: 'customPagination' },
    { result: true, value: 'pageSize' },
    { result: true, value: 'perPage' },
    { result: false, value: 'page' },
  ];

  it.each(customScenarios)(
    'with custom config, $value should match? $result',
    async ({ result, value }) => {
      const config: Config = {
        input: {
          pagination: {
            keywords: ['customPagination', 'pageSize', 'perPage'],
          },
        },
      } as Config;

      const paginationRegExp = getPaginationKeywordsRegExp(config);
      paginationRegExp.lastIndex = 0;
      expect(paginationRegExp.test(value)).toEqual(result);
    },
  );
});

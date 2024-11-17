import { describe, expect, it } from 'vitest';

import { getParseAs } from '../src/utils';

describe('getParseAs', () => {
  const scenarios: Array<{
    content: Parameters<typeof getParseAs>[0];
    parseAs: ReturnType<typeof getParseAs>;
  }> = [
    {
      content: null,
      parseAs: undefined,
    },
    {
      content: 'application/json',
      parseAs: 'json',
    },
    {
      content: 'application/ld+json',
      parseAs: 'json',
    },
    {
      content: 'application/ld+json;charset=utf-8',
      parseAs: 'json',
    },
    {
      content: 'application/ld+json; charset=utf-8',
      parseAs: 'json',
    },
    {
      content: 'multipart/form-data',
      parseAs: 'formData',
    },
    {
      content: 'application/*',
      parseAs: 'blob',
    },
    {
      content: 'audio/*',
      parseAs: 'blob',
    },
    {
      content: 'image/*',
      parseAs: 'blob',
    },
    {
      content: 'video/*',
      parseAs: 'blob',
    },
    {
      content: 'text/*',
      parseAs: 'text',
    },
    {
      content: 'unsupported',
      parseAs: undefined,
    },
  ];

  it.each(scenarios)(
    'detects $content as $parseAs',
    async ({ content, parseAs }) => {
      expect(getParseAs(content)).toEqual(parseAs);
    },
  );
});

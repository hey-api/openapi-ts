import { describe, it } from 'vitest';

import { createClient } from '../index';

describe('index', () => {
  it('parses v2 without issues', async () => {
    await createClient({
      dryRun: true,
      input: './test/spec/v2.json',
      output: './generated/v2/',
      plugins: ['@hey-api/client-fetch'],
    });
  });

  it('parses v3 without issues', async () => {
    await createClient({
      dryRun: true,
      input: './test/spec/v3.json',
      output: './generated/v3/',
      plugins: ['@hey-api/client-fetch'],
    });
  });

  it('parses v3-transforms without issues', async () => {
    await createClient({
      dryRun: true,
      input: './test/spec/v3-transforms.json',
      output: './generated/v3/',
      plugins: [
        '@hey-api/client-fetch',
        '@hey-api/schemas',
        '@hey-api/sdk',
        '@hey-api/typescript',
        {
          dates: true,
          name: '@hey-api/transformers',
        },
      ],
    });
  });

  it('downloads and parses v2 without issues', async () => {
    await createClient({
      dryRun: true,
      input:
        'https://raw.githubusercontent.com/hey-api/openapi-ts/main/packages/openapi-ts/test/spec/v2.json',
      output: './generated/v2-downloaded/',
      plugins: ['@hey-api/client-fetch'],
    });
  });

  it('downloads and parses v3 without issues', async () => {
    await createClient({
      dryRun: true,
      input:
        'https://raw.githubusercontent.com/hey-api/openapi-ts/main/packages/openapi-ts/test/spec/v3.json',
      output: './generated/v3-downloaded/',
      plugins: ['@hey-api/client-fetch'],
    });
  });
});

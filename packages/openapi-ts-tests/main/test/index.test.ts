import path from 'node:path';

import { createClient } from '@hey-api/openapi-ts';
import { describe, expect, it } from 'vitest';

import { getSpecsPath } from '../../utils';

describe('index', () => {
  it('parses v2 without issues', async () => {
    await expect(
      createClient({
        dryRun: true,
        input: path.join(getSpecsPath(), 'v2.json'),
        logs: {
          level: 'silent',
        },
        output: './generated/v2/',
        plugins: ['@hey-api/client-fetch'],
      }),
    ).resolves.not.toThrow();
  });

  it('parses v3 without issues', async () => {
    await expect(
      createClient({
        dryRun: true,
        input: path.join(getSpecsPath(), 'v3.json'),
        logs: {
          level: 'silent',
        },
        output: './generated/v3/',
        plugins: ['@hey-api/client-fetch'],
      }),
    ).resolves.not.toThrow();
  });

  it('parses v3-transforms without issues', async () => {
    await expect(
      createClient({
        dryRun: true,
        input: path.join(getSpecsPath(), 'v3-transforms.json'),
        logs: {
          level: 'silent',
        },
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
      }),
    ).resolves.not.toThrow();
  });
});

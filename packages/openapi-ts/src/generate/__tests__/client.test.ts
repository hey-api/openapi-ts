import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('isDevMode logic', () => {
  const scenarios: ReadonlyArray<{
    description: string;
    expected: boolean;
    mockPath: string;
  }> = [
    {
      description: 'returns true in dev mode (src/generate)',
      expected: true,
      mockPath: '/home/user/packages/openapi-ts/src/generate',
    },
    {
      description: 'returns false in prod mode (dist/generate)',
      expected: false,
      mockPath: '/home/user/packages/openapi-ts/dist/generate',
    },
    {
      description: 'returns false when path contains /src/ but not in correct position',
      expected: false,
      mockPath: '/home/user/src/project/node_modules/@hey-api/openapi-ts/dist/generate',
    },
    {
      description: 'returns false when src is in project path (pnpm case from issue)',
      expected: false,
      mockPath:
        '/home/Huliiiiii/src/thcdb/worktree/schema-gen/web/node_modules/.pnpm/@hey-api+openapi-ts@0.91.1/node_modules/@hey-api/openapi-ts/dist/generate',
    },
    {
      description: 'returns true only when ending with src/generate',
      expected: true,
      mockPath: '/var/src/backup/packages/openapi-ts/src/generate',
    },
    {
      description: 'returns false when not ending with generate',
      expected: false,
      mockPath: '/home/user/packages/openapi-ts/src/plugins',
    },
    {
      description: 'returns false when src exists but dist is later',
      expected: false,
      mockPath: '/home/user/src/project/openapi-ts/dist/generate',
    },
  ];

  it.each(scenarios)('$description', ({ expected, mockPath }) => {
    // Test the isDevMode logic
    const normalized = mockPath.split(path.sep);
    const srcIndex = normalized.lastIndexOf('src');
    const distIndex = normalized.lastIndexOf('dist');

    const result =
      srcIndex !== -1 &&
      srcIndex > distIndex &&
      srcIndex === normalized.length - 2 &&
      normalized[srcIndex + 1] === 'generate';

    expect(result).toBe(expected);
  });
});

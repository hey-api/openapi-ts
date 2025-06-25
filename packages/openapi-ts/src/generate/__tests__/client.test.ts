import fs from 'node:fs';
import path from 'node:path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Client } from '../../plugins/@hey-api/client-core/types';
import type { Plugin } from '../../plugins/types';
import { generateClientBundle } from '../client';

vi.mock('node:fs', async () => {
  const mockPaths: Record<string, string> = {};
  return {
    default: {
      cpSync: (source: string, destination: string) => {
        const sourceParent = path.dirname(source);
        mockPaths[destination] = destination;
        for (const name in mockPaths) {
          if (name.startsWith(source)) {
            const target = path.resolve(
              destination,
              path.relative(sourceParent, name),
            );
            mockPaths[target] = target;
          }
        }
      },
      existsSync: (path: string) => !!mockPaths[path],
      mkdirSync: (path: string) => (mockPaths[path] = path),
      mkdtempSync: (prefix: string) => `/tmp/${prefix}`,
      renameSync: (oldPath: string, newPath: string) => {
        mockPaths[newPath] = newPath;
        for (const name in mockPaths) {
          if (name.startsWith(oldPath)) {
            const target = path.resolve(newPath, path.relative(oldPath, name));
            mockPaths[target] = target;
            delete mockPaths[name];
          }
        }
      },
      rmSync: (path: string) => {
        for (const name in mockPaths) {
          if (name.startsWith(path)) {
            delete mockPaths[name];
          }
        }
      },
      writeFileSync: (path: string, content: string) => {
        mockPaths[path] = content;
      },
    },
  };
});

describe('generateClientBundle', () => {
  beforeEach(() => {});

  it('generate Hey API client codes', async () => {
    fs.mkdirSync(path.resolve(__dirname, '..', 'clients', 'core'));
    fs.writeFileSync(
      path.resolve(__dirname, '..', 'clients', 'core', 'types.ts'),
      '',
    );
    fs.mkdirSync(path.resolve(__dirname, '..', 'clients', 'fetch'));
    fs.writeFileSync(
      path.resolve(__dirname, '..', 'clients', 'fetch', 'types.ts'),
      '',
    );

    const config = {
      outputPath: 'bundle-output',
      plugin: {
        name: '@hey-api/client-fetch',
      } as Plugin.Config<Client.Config & { name: any }>,
      tsConfig: null,
    };

    expect(fs.existsSync(config.outputPath)).toBeFalsy();

    generateClientBundle(config);

    expect(
      fs.existsSync(path.resolve(config.outputPath, 'core', 'types.ts')),
    ).toBeTruthy();
    expect(
      fs.existsSync(path.resolve(config.outputPath, 'client', 'types.ts')),
    ).toBeTruthy();

    fs.rmSync(config.outputPath);
  });
});

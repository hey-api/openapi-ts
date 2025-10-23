import { describe, expect, it } from 'vitest';

import { compileInputPath } from '~/createClient';

describe('compileInputPath', () => {
  it('with raw OpenAPI specification', () => {
    const path = compileInputPath({
      path: {
        info: {
          version: '1.0.0',
        },
        openapi: '3.1.0',
      },
    });
    expect(path).toEqual({
      path: {
        info: {
          version: '1.0.0',
        },
        openapi: '3.1.0',
      },
    });
  });

  it('with arbitrary string', () => {
    const path = compileInputPath({
      path: 'path/to/openapi.json',
    });
    expect(path).toEqual({
      path: 'path/to/openapi.json',
    });
  });

  it('with platform string', () => {
    const path = compileInputPath({
      path: 'https://get.heyapi.dev/foo/bar?branch=main&commit_sha=sha&tags=a,b,c&version=1.0.0',
      registry: 'hey-api',
    });
    expect(path).toEqual({
      branch: 'main',
      commit_sha: 'sha',
      organization: 'foo',
      path: 'https://get.heyapi.dev/foo/bar?branch=main&commit_sha=sha&tags=a,b,c&version=1.0.0',
      project: 'bar',
      registry: 'hey-api',
      tags: ['a', 'b', 'c'],
      version: '1.0.0',
    });
  });

  it('with platform arguments', () => {
    const path = compileInputPath({
      branch: 'main',
      commit_sha: 'sha',
      organization: 'foo',
      path: '',
      project: 'bar',
      tags: ['a', 'b', 'c'],
      version: '1.0.0',
    });
    expect(path).toEqual({
      branch: 'main',
      commit_sha: 'sha',
      organization: 'foo',
      path: 'https://get.heyapi.dev/foo/bar?branch=main&commit_sha=sha&tags=a,b,c&version=1.0.0',
      project: 'bar',
      tags: ['a', 'b', 'c'],
      version: '1.0.0',
    });
  });

  it('loads API key from HEY_API_TOKEN', () => {
    process.env.HEY_API_TOKEN = 'foo';
    const path = compileInputPath({
      path: 'https://get.heyapi.dev/foo/bar',
      registry: 'hey-api',
    });
    delete process.env.HEY_API_TOKEN;
    expect(path).toEqual({
      api_key: 'foo',
      organization: 'foo',
      path: 'https://get.heyapi.dev/foo/bar?api_key=foo',
      project: 'bar',
      registry: 'hey-api',
    });
  });
});

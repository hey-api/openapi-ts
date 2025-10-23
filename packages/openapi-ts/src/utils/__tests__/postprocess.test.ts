import { describe, expect, it, vi } from 'vitest';

import { parseLegacy } from '~/openApi';
import type { Config } from '~/types/config';

import { getServiceName, postProcessClient } from '../postprocess';

vi.mock('../config', () => {
  const config: Partial<Config> = {
    plugins: {},
  };
  return {
    getConfig: () => config,
    isLegacyClient: vi.fn().mockReturnValue(true),
  };
});

describe('getServiceName', () => {
  it.each([
    { expected: '', input: '' },
    { expected: 'FooBar', input: 'FooBar' },
    { expected: 'FooBar', input: 'Foo Bar' },
    { expected: 'FooBar', input: 'foo bar' },
    { expected: 'FooBar', input: '@fooBar' },
    { expected: 'FooBar', input: '$fooBar' },
    { expected: 'FooBar', input: '123fooBar' },
    {
      expected: 'NonAsciiÆøåÆøÅöôêÊ字符串',
      input: 'non-ascii-æøåÆØÅöôêÊ字符串',
    },
  ])('getServiceName($input) -> $expected', ({ expected, input }) => {
    expect(getServiceName(input)).toEqual(expected);
  });
});

describe('getServices', () => {
  it('should create a unnamed service if tags are empty', () => {
    const parserClient = parseLegacy({
      openApi: {
        info: {
          title: 'x',
          version: '1',
        },
        openapi: '3.0.0',
        paths: {
          '/api/trips': {
            get: {
              responses: {
                200: {
                  description: 'x',
                },
                default: {
                  description: 'default',
                },
              },
              tags: [],
            },
          },
        },
      },
    });
    const { services } = postProcessClient(parserClient, {} as Config);

    expect(services).toHaveLength(1);
    expect(services[0]!.name).toEqual('Default');
  });
});

describe('getServices', () => {
  it('should create a unnamed service if tags are empty', () => {
    const parserClient = parseLegacy({
      openApi: {
        info: {
          title: 'x',
          version: '1',
        },
        openapi: '3.0.0',
        paths: {
          '/api/trips': {
            get: {
              responses: {
                200: {
                  description: 'x',
                },
                default: {
                  description: 'default',
                },
              },
              tags: [],
            },
          },
        },
      },
    });
    const { services } = postProcessClient(parserClient, {} as Config);

    expect(services).toHaveLength(1);
    expect(services[0]!.name).toEqual('Default');
  });
});

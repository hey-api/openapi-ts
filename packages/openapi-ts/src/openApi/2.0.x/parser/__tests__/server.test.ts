import { describe, expect, it } from 'vitest';

import type { OpenApi } from '~/openApi/types';

import type { IR } from '../../../../ir/types';
import { parseServers } from '../server';

describe('parseServers', () => {
  it('host + basePath + schemes', () => {
    const context: Partial<IR.Context<Partial<OpenApi.V2_0_X>>> = {
      config: {
        input: [
          // @ts-expect-error
          {
            path: '',
          },
        ],
      },
      ir: {},
      spec: {
        basePath: '/v1',
        host: 'foo.com',
        schemes: ['http', 'https'],
      },
    };
    parseServers({ context: context as IR.Context });
    expect(context.ir!.servers).toEqual([
      {
        url: 'http://foo.com/v1',
      },
      {
        url: 'https://foo.com/v1',
      },
    ]);
  });

  it('schemes + host', () => {
    const context: Partial<IR.Context<Partial<OpenApi.V2_0_X>>> = {
      config: {
        input: [
          // @ts-expect-error
          {
            path: '',
          },
        ],
      },
      ir: {},
      spec: {
        host: 'foo.com',
        schemes: ['ws'],
      },
    };
    parseServers({ context: context as IR.Context });
    expect(context.ir!.servers).toEqual([
      {
        url: 'ws://foo.com',
      },
    ]);
  });

  it('host + basePath', () => {
    const context: Partial<IR.Context<Partial<OpenApi.V2_0_X>>> = {
      config: {
        input: [
          // @ts-expect-error
          {
            path: '',
          },
        ],
      },
      ir: {},
      spec: {
        basePath: '/v1',
        host: 'foo.com',
      },
    };
    parseServers({ context: context as IR.Context });
    expect(context.ir!.servers).toEqual([
      {
        url: 'foo.com/v1',
      },
    ]);
  });

  it('host', () => {
    const context: Partial<IR.Context<Partial<OpenApi.V2_0_X>>> = {
      config: {
        input: [
          // @ts-expect-error
          {
            path: '',
          },
        ],
      },
      ir: {},
      spec: {
        host: 'foo.com',
      },
    };
    parseServers({ context: context as IR.Context });
    expect(context.ir!.servers).toEqual([
      {
        url: 'foo.com',
      },
    ]);
  });

  it('basePath', () => {
    const context: Partial<IR.Context<Partial<OpenApi.V2_0_X>>> = {
      config: {
        input: [
          // @ts-expect-error
          {
            path: '',
          },
        ],
      },
      ir: {},
      spec: {
        basePath: '/v1',
      },
    };
    parseServers({ context: context as IR.Context });
    expect(context.ir!.servers).toEqual([
      {
        url: '/v1',
      },
    ]);
  });
});

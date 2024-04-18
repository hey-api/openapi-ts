import { describe, expect, it } from 'vitest';

import { getServer } from '../getServer';

describe('getServer', () => {
  it('should produce correct result', () => {
    expect(
      getServer({
        basePath: '/api',
        host: 'localhost:8080',
        info: {
          title: 'dummy',
          version: '1.0',
        },
        paths: {},
        schemes: ['http', 'https'],
        swagger: '2.0',
      }),
    ).toEqual('http://localhost:8080/api');
  });
});

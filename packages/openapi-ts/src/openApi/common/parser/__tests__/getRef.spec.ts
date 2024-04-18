import { describe, expect, it } from 'vitest';

import { getRef } from '../getRef';

describe('getRef (v2)', () => {
  it('should produce correct result', () => {
    expect(
      getRef(
        {
          basePath: '/api',
          definitions: {
            Example: {
              description: 'This is an Example model ',
              type: 'integer',
            },
          },
          host: 'localhost:8080',
          info: {
            title: 'dummy',
            version: '1.0',
          },
          paths: {},
          schemes: ['http', 'https'],
          swagger: '2.0',
        },
        {
          $ref: '#/definitions/Example',
        },
      ),
    ).toEqual({
      description: 'This is an Example model ',
      type: 'integer',
    });
  });
});

describe('getRef (v3)', () => {
  it('should produce correct result', () => {
    expect(
      getRef(
        {
          components: {
            schemas: {
              Example: {
                description: 'This is an Example model ',
                type: 'integer',
              },
            },
          },
          info: {
            title: 'dummy',
            version: '1.0',
          },
          openapi: '3.0',
          paths: {},
          servers: [
            {
              url: 'https://localhost:8080/api',
            },
          ],
        },
        {
          $ref: '#/components/schemas/Example',
        },
      ),
    ).toEqual({
      description: 'This is an Example model ',
      type: 'integer',
    });
  });

  it('should produce correct result for encoded ref path', () => {
    expect(
      getRef(
        {
          info: {
            title: 'dummy',
            version: '1.0',
          },
          openapi: '3.0',
          paths: {
            '/api/user/{id}': {
              description: 'This is an Example path',
            },
          },
        },
        {
          $ref: '#/paths/~1api~1user~1%7Bid%7D',
        },
      ),
    ).toEqual({
      description: 'This is an Example path',
    });
  });
});

import { describe, expect, it } from 'vitest';

import { setConfig } from '../../../config';
import { getServices } from '../getServices';

describe('getServices', () => {
  it('should create a unnamed service if tags are empty', () => {
    setConfig({
      nameFn: {
        operation: () => 'operation',
        operationParameter: () => 'operationParameter',
      },
    });

    const services = getServices({
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
      types: {},
    });

    expect(services).toHaveLength(1);
    expect(services[0].name).toEqual('Default');
  });
});

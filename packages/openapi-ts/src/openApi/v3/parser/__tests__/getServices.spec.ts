import { describe, expect, it } from 'vitest';

import { setConfig } from '../../../../utils/config';
import { getServices } from '../getServices';

describe('getServices', () => {
  it('should create a unnamed service if tags are empty', () => {
    setConfig({
      client: {
        name: 'fetch',
      },
      configFile: '',
      debug: false,
      dryRun: true,
      experimental_parser: false,
      exportCore: true,
      input: '',
      output: {
        path: '',
      },
      plugins: [],
      schemas: {},
      services: {
        operationId: true,
      },
      types: {},
      useOptions: true,
    });

    const { services } = getServices({
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

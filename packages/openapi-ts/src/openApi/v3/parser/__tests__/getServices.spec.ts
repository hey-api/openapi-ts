import { describe, expect, it } from 'vitest';

import { setConfig } from '../../../../utils/config';
import { getServices } from '../getServices';

describe('getServices', () => {
  it('should create a unnamed service if tags are empty', () => {
    setConfig({
      client: 'fetch',
      debug: false,
      dryRun: true,
      enums: false,
      exportCore: true,
      format: false,
      input: '',
      lint: false,
      operationId: true,
      output: '',
      schemas: {},
      services: {},
      types: {},
      useDateType: false,
      useOptions: true,
    });

    const services = getServices({
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
    });

    expect(services).toHaveLength(1);
    expect(services[0].name).toEqual('Default');
  });
});

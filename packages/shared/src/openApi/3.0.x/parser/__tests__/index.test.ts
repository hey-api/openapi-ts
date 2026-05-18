import { Logger } from '@hey-api/codegen-core';
import type { OpenAPIV3 } from '@hey-api/spec-types';

import { Context } from '../../../../ir/context';
import { parseV3_0_X } from '../index';

function createContext(spec: OpenAPIV3.Document) {
  return new Context({
    config: {
      input: [],
      logs: {},
      // @ts-expect-error
      output: {
        case: undefined,
        entryFile: false,
        path: '',
      },
      // @ts-expect-error
      parser: {
        pagination: { keywords: [] },
        transforms: {
          enums: { enabled: false, mode: 'root' },
          propertiesRequiredByDefault: false,
          readWrite: { enabled: false, requests: {}, responses: {} },
        },
      },
      pluginOrder: [],
      plugins: {},
    },
    dependencies: {},
    logger: new Logger(),
    spec,
  });
}

describe('parseV3_0_X', () => {
  it('encodes $ref for schema name containing /', () => {
    const spec: OpenAPIV3.Document = {
      components: {
        schemas: {
          'node/type': {
            properties: {
              id: { type: 'string' },
            },
            type: 'object',
          },
        },
      },
      info: { title: 'Test', version: '1' },
      openapi: '3.0.3',
      paths: {},
    };
    const context = createContext(spec);
    parseV3_0_X(context);
    expect(context.ir.components?.schemas?.['node/type']).toBeDefined();
  });

  it('encodes $ref for schema name containing ~', () => {
    const spec: OpenAPIV3.Document = {
      components: {
        schemas: {
          'type~special': {
            properties: {
              id: { type: 'string' },
            },
            type: 'object',
          },
        },
      },
      info: { title: 'Test', version: '1' },
      openapi: '3.0.3',
      paths: {},
    };
    const context = createContext(spec);
    parseV3_0_X(context);
    expect(context.ir.components?.schemas?.['type~special']).toBeDefined();
  });

  it('encodes $ref for schema name containing / and ~', () => {
    const spec: OpenAPIV3.Document = {
      components: {
        schemas: {
          'node/type~special': {
            properties: {
              id: { type: 'string' },
            },
            type: 'object',
          },
        },
      },
      info: { title: 'Test', version: '1' },
      openapi: '3.0.3',
      paths: {},
    };
    const context = createContext(spec);
    parseV3_0_X(context);
    expect(context.ir.components?.schemas?.['node/type~special']).toBeDefined();
  });

  it('encodes $ref for parameter name containing special characters', () => {
    const spec: OpenAPIV3.Document = {
      components: {
        parameters: {
          'param/special~name': {
            in: 'query' as const,
            name: 'special',
            schema: { type: 'string' },
          },
        },
      },
      info: { title: 'Test', version: '1' },
      openapi: '3.0.3',
      paths: {},
    };
    const context = createContext(spec);
    parseV3_0_X(context);
    expect(context.ir.components?.parameters?.['param/special~name']).toBeDefined();
  });

  it('encodes $ref for requestBody name containing special characters', () => {
    const spec: OpenAPIV3.Document = {
      components: {
        requestBodies: {
          'body/special~name': {
            content: {
              'application/json': {
                schema: { type: 'object' },
              },
            },
          },
        },
      },
      info: { title: 'Test', version: '1' },
      openapi: '3.0.3',
      paths: {},
    };
    const context = createContext(spec);
    parseV3_0_X(context);
    expect(context.ir.components?.requestBodies?.['body/special~name']).toBeDefined();
  });
});

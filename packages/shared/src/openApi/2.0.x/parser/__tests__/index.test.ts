import { Logger } from '@hey-api/codegen-core';
import type { OpenAPIV2 } from '@hey-api/spec-types';

import { Context } from '../../../../ir/context';
import { parseV2_0_X } from '../index';

function createContext(spec: OpenAPIV2.Document) {
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
      // @ts-expect-error - partial config for testing
      parser: {
        transforms: {
          enums: { case: 'PascalCase', enabled: false, mode: 'root', name: '{{name}}Enum' },
          propertiesRequiredByDefault: false,
          readWrite: {
            enabled: false,
            requests: { case: 'preserve', name: '{{name}}Writable' },
            responses: { case: 'preserve', name: '{{name}}' },
          },
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

describe('parseV2_0_X', () => {
  it('encodes $ref for definition name containing /', () => {
    const spec: OpenAPIV2.Document = {
      definitions: {
        'node/type': {
          properties: {
            id: { type: 'string' },
          },
          type: 'object',
        },
      },
      info: { title: 'Test', version: '1' },
      paths: {},
      swagger: '2.0',
    };
    const context = createContext(spec);
    parseV2_0_X(context);
    expect(context.ir.components?.schemas?.['node/type']).toBeDefined();
  });

  it('encodes $ref for definition name containing ~', () => {
    const spec: OpenAPIV2.Document = {
      definitions: {
        'type~special': {
          properties: {
            id: { type: 'string' },
          },
          type: 'object',
        },
      },
      info: { title: 'Test', version: '1' },
      paths: {},
      swagger: '2.0',
    };
    const context = createContext(spec);
    parseV2_0_X(context);
    expect(context.ir.components?.schemas?.['type~special']).toBeDefined();
  });

  it('encodes $ref for definition name containing / and ~', () => {
    const spec: OpenAPIV2.Document = {
      definitions: {
        'node/type~special': {
          properties: {
            id: { type: 'string' },
          },
          type: 'object',
        },
      },
      info: { title: 'Test', version: '1' },
      paths: {},
      swagger: '2.0',
    };
    const context = createContext(spec);
    parseV2_0_X(context);
    expect(context.ir.components?.schemas?.['node/type~special']).toBeDefined();
  });
});

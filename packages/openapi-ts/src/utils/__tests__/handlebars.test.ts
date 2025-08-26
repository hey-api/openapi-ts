import Handlebars from 'handlebars';
import type ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { setConfig } from '../config';
import {
  registerHandlebarHelpers,
  registerHandlebarTemplates,
} from '../handlebars';

describe('registerHandlebarHelpers', () => {
  it('should register the helpers', () => {
    setConfig({
      configFile: '',
      dryRun: false,
      experimentalParser: false,
      exportCore: true,
      input: {
        path: '',
        watch: {
          enabled: false,
          interval: 1_000,
          timeout: 60_000,
        },
      },
      interactive: false,
      logs: {
        file: true,
        level: 'info',
        path: process.cwd(),
      },
      output: {
        format: 'prettier',
        path: '',
      },
      parser: {
        hooks: {},
        pagination: {
          keywords: [],
        },
        transforms: {
          enums: {
            case: 'preserve',
            enabled: false,
            mode: 'root',
            name: '',
          },
          readWrite: {
            enabled: false,
            requests: {
              case: 'preserve',
              name: '',
            },
            responses: {
              case: 'preserve',
              name: '',
            },
          },
        },
        validate_EXPERIMENTAL: false,
      },
      pluginOrder: [
        '@hey-api/typescript',
        '@hey-api/schemas',
        'legacy/fetch',
        '@hey-api/sdk',
      ],
      plugins: {
        '@hey-api/schemas': {
          config: {
            name: '@hey-api/schemas',
          },
          handler: () => {},
          name: '@hey-api/schemas',
          output: '',
        },
        '@hey-api/sdk': {
          config: {
            name: '@hey-api/sdk',
          },
          handler: () => {},
          name: '@hey-api/sdk',
          output: '',
        },
        '@hey-api/typescript': {
          api: {
            getId: () => '',
            schemaToType: () => ({}) as ts.TypeNode,
          },
          config: {
            enums: 'javascript',
            name: '@hey-api/typescript',
          },
          handler: () => {},
          name: '@hey-api/typescript',
          output: '',
        },
        'legacy/fetch': {
          config: {
            name: 'legacy/fetch',
          },
          handler: () => {},
          name: 'legacy/fetch',
          output: '',
          tags: ['client'],
        },
      },
      useOptions: false,
    });
    registerHandlebarHelpers();
    const helpers = Object.keys(Handlebars.helpers);
    expect(helpers).toContain('camelCase');
    expect(helpers).toContain('equals');
    expect(helpers).toContain('ifServicesResponse');
    expect(helpers).toContain('ifdef');
    expect(helpers).toContain('notEquals');
    expect(helpers).toContain('transformServiceName');
  });
});

describe('registerHandlebarTemplates', () => {
  it('should return correct templates', () => {
    setConfig({
      configFile: '',
      dryRun: false,
      experimentalParser: false,
      exportCore: true,
      input: {
        path: '',
        watch: {
          enabled: false,
          interval: 1_000,
          timeout: 60_000,
        },
      },
      interactive: false,
      logs: {
        file: true,
        level: 'info',
        path: process.cwd(),
      },
      output: {
        format: 'prettier',
        path: '',
      },
      parser: {
        hooks: {},
        pagination: {
          keywords: [],
        },
        transforms: {
          enums: {
            case: 'preserve',
            enabled: false,
            mode: 'root',
            name: '',
          },
          readWrite: {
            enabled: false,
            requests: {
              case: 'preserve',
              name: '',
            },
            responses: {
              case: 'preserve',
              name: '',
            },
          },
        },
        validate_EXPERIMENTAL: false,
      },
      pluginOrder: [
        '@hey-api/typescript',
        '@hey-api/schemas',
        'legacy/fetch',
        '@hey-api/sdk',
      ],
      plugins: {
        '@hey-api/schemas': {
          config: {
            name: '@hey-api/schemas',
          },
          handler: () => {},
          name: '@hey-api/schemas',
          output: '',
        },
        '@hey-api/sdk': {
          config: {
            name: '@hey-api/sdk',
          },
          handler: () => {},
          name: '@hey-api/sdk',
          output: '',
        },
        '@hey-api/typescript': {
          api: {
            getId: () => '',
            schemaToType: () => ({}) as ts.TypeNode,
          },
          config: {
            enums: 'javascript',
            name: '@hey-api/typescript',
          },
          handler: () => {},
          name: '@hey-api/typescript',
          output: '',
        },
        'legacy/fetch': {
          config: {
            name: 'legacy/fetch',
          },
          handler: () => {},
          name: 'legacy/fetch',
          output: '',
          tags: ['client'],
        },
      },
      useOptions: false,
    });
    const templates = registerHandlebarTemplates();
    expect(templates.core.settings).toBeDefined();
    expect(templates.core.apiError).toBeDefined();
    expect(templates.core.apiRequestOptions).toBeDefined();
    expect(templates.core.apiResult).toBeDefined();
    expect(templates.core.request).toBeDefined();
  });
});

import Handlebars from 'handlebars';
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
        pagination: {
          keywords: [],
        },
        transforms: {
          enums: 'off',
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
        pagination: {
          keywords: [],
        },
        transforms: {
          enums: 'off',
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

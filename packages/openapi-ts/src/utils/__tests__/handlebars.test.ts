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
      client: {
        name: 'legacy/fetch',
      },
      configFile: '',
      debug: false,
      dryRun: false,
      experimentalParser: false,
      exportCore: true,
      input: {
        path: '',
      },
      output: {
        format: 'prettier',
        path: '',
      },
      pluginOrder: ['@hey-api/typescript', '@hey-api/schemas', '@hey-api/sdk'],
      plugins: {
        '@hey-api/schemas': {
          _handler: () => {},
          _handlerLegacy: () => {},
          name: '@hey-api/schemas',
        },
        '@hey-api/sdk': {
          _handler: () => {},
          _handlerLegacy: () => {},
          name: '@hey-api/sdk',
        },
        '@hey-api/typescript': {
          _handler: () => {},
          _handlerLegacy: () => {},
          enums: 'javascript',
          name: '@hey-api/typescript',
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
      client: {
        name: 'legacy/fetch',
      },
      configFile: '',
      debug: false,
      dryRun: false,
      experimentalParser: false,
      exportCore: true,
      input: {
        path: '',
      },
      output: {
        format: 'prettier',
        path: '',
      },
      pluginOrder: ['@hey-api/typescript', '@hey-api/schemas', '@hey-api/sdk'],
      plugins: {
        '@hey-api/schemas': {
          _handler: () => {},
          _handlerLegacy: () => {},
          name: '@hey-api/schemas',
        },
        '@hey-api/sdk': {
          _handler: () => {},
          _handlerLegacy: () => {},
          name: '@hey-api/sdk',
        },
        '@hey-api/typescript': {
          _handler: () => {},
          _handlerLegacy: () => {},
          enums: 'javascript',
          name: '@hey-api/typescript',
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

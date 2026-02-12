import { Logger } from '@hey-api/codegen-core';

import type { AnyConfig } from '../../config/shared';
import { Context } from '../../ir/context';
import { parseOpenApiSpec } from '..';
import { type OpenApiV3_0_X, parseV3_0_X } from '../3.0.x';
import { type OpenApiV3_1_X, parseV3_1_X } from '../3.1.x';

vi.mock('../3.0.x', () => ({
  parseV3_0_X: vi.fn(),
}));
vi.mock('../3.1.x', () => ({
  parseV3_1_X: vi.fn(),
}));
vi.mock('../../utils/config', () => {
  const config: Partial<AnyConfig> = {
    logs: {
      file: false,
      level: 'silent',
      path: '',
    },
    pluginOrder: [],
  };
  return {
    getConfig: () => config,
  };
});

describe('OpenAPI parser', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles OpenAPI 3.0.0', () => {
    const spec: OpenApiV3_0_X = {
      info: {
        title: '',
        version: '1',
      },
      openapi: '3.0.0',
      paths: {},
    };
    const context = new Context({
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
        parser: {},
        pluginOrder: [],
        plugins: {},
      },
      dependencies: {},
      logger: new Logger(),
      spec,
    });
    parseOpenApiSpec(context);
    expect(parseV3_0_X).toHaveBeenCalled();
  });

  it('handles OpenAPI 3.0.1', () => {
    const spec: OpenApiV3_0_X = {
      info: {
        title: '',
        version: '1',
      },
      openapi: '3.0.1',
      paths: {},
    };
    const context = new Context({
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
        parser: {},
        pluginOrder: [],
        plugins: {},
      },
      dependencies: {},
      logger: new Logger(),
      spec,
    });
    parseOpenApiSpec(context);
    expect(parseV3_0_X).toHaveBeenCalled();
  });

  it('handles OpenAPI 3.0.2', () => {
    const spec: OpenApiV3_0_X = {
      info: {
        title: '',
        version: '1',
      },
      openapi: '3.0.2',
      paths: {},
    };
    const context = new Context({
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
        parser: {},
        pluginOrder: [],
        plugins: {},
      },
      dependencies: {},
      logger: new Logger(),
      spec,
    });
    parseOpenApiSpec(context);
    expect(parseV3_0_X).toHaveBeenCalled();
  });

  it('handles OpenAPI 3.0.3', () => {
    const spec: OpenApiV3_0_X = {
      info: {
        title: '',
        version: '1',
      },
      openapi: '3.0.3',
      paths: {},
    };
    const context = new Context({
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
        parser: {},
        pluginOrder: [],
        plugins: {},
      },
      dependencies: {},
      logger: new Logger(),
      spec,
    });
    parseOpenApiSpec(context);
    expect(parseV3_0_X).toHaveBeenCalled();
  });

  it('handles OpenAPI 3.0.4', () => {
    const spec: OpenApiV3_0_X = {
      info: {
        title: '',
        version: '1',
      },
      openapi: '3.0.4',
      paths: {},
    };
    const context = new Context({
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
        parser: {},
        pluginOrder: [],
        plugins: {},
      },
      dependencies: {},
      logger: new Logger(),
      spec,
    });
    parseOpenApiSpec(context);
    expect(parseV3_0_X).toHaveBeenCalled();
  });

  it('handles OpenAPI 3.1.0', () => {
    const spec: OpenApiV3_1_X = {
      info: {
        title: '',
        version: '1',
      },
      openapi: '3.1.0',
    };
    const context = new Context({
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
        parser: {},
        pluginOrder: [],
        plugins: {},
      },
      dependencies: {},
      logger: new Logger(),
      spec,
    });
    parseOpenApiSpec(context);
    expect(parseV3_1_X).toHaveBeenCalled();
  });

  it('handles OpenAPI 3.1.1', () => {
    const spec: OpenApiV3_1_X = {
      info: {
        title: '',
        version: '1',
      },
      openapi: '3.1.1',
    };
    const context = new Context({
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
        parser: {},
        pluginOrder: [],
        plugins: {},
      },
      dependencies: {},
      logger: new Logger(),
      spec,
    });
    parseOpenApiSpec(context);
    expect(parseV3_1_X).toHaveBeenCalled();
  });
});
